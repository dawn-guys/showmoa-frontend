"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryState } from "nuqs";
import { AnimatedToast } from "@/shared/components/toast";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import type {
  TheatreBoundsParams,
  TheatreMapResponse,
} from "@/app/(tabs)/map/_types";
import type { PerformanceResponse } from "@/app/(tabs)/_types";
import { NAVER_MAP_CLIENT_ID } from "@/app/(tabs)/map/_lib/naver-map";
import { useTheatres } from "@/app/(tabs)/map/_hooks/useTheatres";
import { useTheatrePerformances } from "@/app/(tabs)/map/_hooks/useTheatrePerformances";
import { useTheatreSearch } from "@/app/(tabs)/map/_hooks/useTheatreSearch";
import { useLocationConsent } from "@/app/(tabs)/map/_hooks/useLocationConsent";
import { useGeolocationPermissionWatcher } from "@/app/(tabs)/map/_hooks/useGeolocationPermissionWatcher";
import { useOverlayFlag } from "@/shared/hooks/useOverlayFlag";
import {
  MapView,
  type MapStatus,
  type MapViewHandle,
} from "@/app/(tabs)/map/_components/map-view";
import { MapSearchBar } from "@/app/(tabs)/map/_components/map-search-bar";
import {
  MapSkeleton,
  MAP_SECTION_BOTTOM,
} from "@/app/(tabs)/map/_components/map-skeleton";
import { VenueBottomSheet } from "@/app/(tabs)/map/_components/venue-bottom-sheet";
import { LocationConsentModal } from "@/app/(tabs)/map/_components/location-consent-modal";
import { GpsPermissionModal } from "@/app/(tabs)/map/_components/gps-permission-modal";

// 목록 미로드 시 넘길 안정적인 빈 배열(참조가 매 렌더 바뀌지 않도록 모듈 상수로 둔다).
const EMPTY_THEATRES: TheatreMapResponse[] = [];
const EMPTY_PERFORMANCES: PerformanceResponse[] = [];

/**
 * 지도 화면 오케스트레이터. 지도·검색·바텀 시트·동의 모달을 연결한다.
 * 지도 인스턴스 제어(현재 위치/극장 이동)는 MapView의 imperative handle로 위임한다.
 *
 * 극장 목록 조회에는 지도 범위(bounds)가 필수라서, MapView가 지도를 만든 직후
 * 초기 중심·줌 기준 범위를 알려 주면 그때 첫 조회가 나간다. 이후에는 지도가
 * idle이 될 때마다 범위가 갱신되며 재조회된다.
 */
export function MapScreen() {
  // 위치 권한 상태로만 모달 노출을 정한다(로그인 여부와 무관한 공통 동작).
  const { shouldPrompt, isGranted, isChecking, dismiss } = useLocationConsent();

  // 현재 조회 범위. 지도가 준비되기 전에는 null이라 조회하지 않는다.
  const [bounds, setBounds] = useState<TheatreBoundsParams | null>(null);
  const {
    data: theatres,
    isLoading: theatresLoading,
    isFetching: theatresFetching,
  } = useTheatres(bounds);
  const { searchTheatres, isSearching } = useTheatreSearch();

  // 디테일 화살표 딥링크로 넘어온 극장 id(?venueId=). 극장 id는 숫자라 문자열로 비교한다.
  const [venueIdParam] = useQueryState("venueId");

  const mapViewRef = useRef<MapViewHandle>(null);
  const [mapStatus, setMapStatus] = useState<MapStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * 바텀 시트에 보일 포커스 극장. null이면 "공연장을 선택해 주세요" placeholder다.
   *
   * id가 아니라 응답 객체를 그대로 담는다. 그래서 지도를 단순히 드래그해 이 극장이
   * 현재 뷰포트 조회 결과에서 빠져도 시트는 그대로 유지되고, 드래그만으로 다른
   * 극장이 포커스되지도 않는다.
   *
   * 포커스는 다음 시점에만 바뀐다: ①최초 로드(딥링크 극장 또는 지도 중앙 최근접
   * 극장) ②마커 클릭·검색(사용자 선택) ③현재 위치로 이동한 뒤(진입 자동·GPS 버튼)
   * 그 범위의 최근접 극장. 이동한 범위에 공연장이 없으면 null(placeholder)이 된다.
   */
  const [focusedTheatre, setFocusedTheatre] =
    useState<TheatreMapResponse | null>(null);

  // 최초 포커스를 한 번만 정하기 위한 플래그.
  const [didInitialFocus, setDidInitialFocus] = useState(false);

  /**
   * 현재 위치로 이동한 뒤 그 범위 목록으로 포커스를 다시 잡기 위한 단계.
   * 이동이 유발한 조회(fetch)가 시작됐다 끝나는 것을 보고 반영해, 단순 지도
   * 드래그 조회와 섞이지 않게 한다.
   * - "awaiting-fetch": GPS 버튼 이동(panTo). idle 이후 조회가 시작되길 기다린다.
   * - "awaiting-settle": 진입 자동 이동(즉시 범위 변경) 또는 조회 시작 확인 뒤.
   *   조회가 끝나면 그 범위의 최근접 극장으로 포커스한다.
   */
  const [moveRefocus, setMoveRefocus] = useState<
    "idle" | "awaiting-fetch" | "awaiting-settle"
  >("idle");

  // GPS 안내 모달(위치 권한이 막혀 현재 위치를 못 가져올 때). URL 플래그로 둬 뒤로가기가 쌓이지 않는다.
  const [gpsModalOpen, setGpsModalOpen] = useOverlayFlag("gps");

  // 딥링크 극장으로의 최초 이동을 한 번만 수행하기 위한 플래그.
  const didFocusTheatreRef = useRef(false);
  // 진입 시 현재 위치 이동을 한 번만 수행하기 위한 플래그.
  const didEntryLocateRef = useRef(false);

  /**
   * 진입 시 현재 위치 이동. 권한이 이미 허용돼 있거나(딥링크 극장이 없을 때)
   * 모달에서 동의하면 요청하며, 위치 조회가 끝날 때까지 스켈레톤을 덮는다.
   * 이동에 성공하면 새 위치의 극장 목록이 올 때까지도 스켈레톤을 유지한다.
   */
  const [agreed, setAgreed] = useState(false);
  const [entryLocateDone, setEntryLocateDone] = useState(false);
  const [awaitingLocatedList, setAwaitingLocatedList] = useState(false);
  const wantsEntryLocate = (isGranted && !venueIdParam) || agreed;
  const isEntryLocating = isChecking || (wantsEntryLocate && !entryLocateDone);

  const theatreList = theatres ?? EMPTY_THEATRES;

  // 이동한 위치의 목록 조회가 끝나면 대기를 푼다(렌더 중 상태 조정).
  if (awaitingLocatedList && !theatresFetching) {
    setAwaitingLocatedList(false);
  }

  // 최초 포커스: 위치 이동이 없거나 실패한 경우를 위해 첫 목록의 최근접 극장
  // (딥링크면 그 극장)으로 1회 포커스한다. 위치 이동이 성공하면 아래 이동 포커스가
  // 그 범위 최근접으로 다시 잡는다(진입 자동 이동은 스켈레톤이 덮는 동안 교체).
  // effect가 아니라 렌더 중 상태 조정이라 추가 커밋 없이 곧바로 반영된다.
  if (!didInitialFocus && theatreList.length > 0) {
    const fromDeepLink = venueIdParam
      ? theatreList.find((theatre) => String(theatre.id) === venueIdParam)
      : undefined;
    setDidInitialFocus(true);
    setFocusedTheatre(
      fromDeepLink ??
        theatreList.find((theatre) => theatre.nearest) ??
        theatreList[0] ??
        null,
    );
  }

  // 이동 포커스 상태 머신(렌더 중 상태 조정). 조회가 시작됐다(fetch) 끝나는 것을
  // 확인한 뒤, 이동한 범위의 최근접 극장으로 포커스한다. 범위에 공연장이 없으면
  // null로 둬 placeholder를 보여준다.
  if (moveRefocus === "awaiting-fetch" && theatresFetching) {
    setMoveRefocus("awaiting-settle");
  } else if (moveRefocus === "awaiting-settle" && !theatresFetching) {
    setMoveRefocus("idle");
    setFocusedTheatre(theatreList.find((theatre) => theatre.nearest) ?? null);
  }

  const focusedTheatreId = focusedTheatre?.id ?? null;

  const { data: performances, isLoading: performancesLoading } =
    useTheatrePerformances(focusedTheatreId);

  // 지도가 준비되고 목록이 로드되면 딥링크 극장 위치로 한 번 이동한다(선택 상태는 위에서 파생).
  useEffect(() => {
    if (didFocusTheatreRef.current || mapStatus !== "ready" || !venueIdParam) {
      return;
    }
    const target = theatreList.find(
      (theatre) => String(theatre.id) === venueIdParam,
    );
    if (!target) return;
    didFocusTheatreRef.current = true;
    mapViewRef.current?.panToTheatre(target);
  }, [mapStatus, venueIdParam, theatreList]);

  // 지도가 준비되면 진입 시 현재 위치 이동을 한 번 수행한다. 스켈레톤이 덮고
  // 있으므로 애니메이션 없이 바로 옮긴다. 실패(거부·시간 초과 등)하면 기본 중심을 유지한다.
  useEffect(() => {
    if (
      didEntryLocateRef.current ||
      !wantsEntryLocate ||
      mapStatus !== "ready"
    ) {
      return;
    }
    didEntryLocateRef.current = true;
    mapViewRef.current?.locate({ instant: true }).then((moved) => {
      // 내 위치로 옮겨졌으면 그 지역 목록을 기다렸다가(스켈레톤) 그 범위의 최근접
      // 극장으로 포커스를 다시 잡는다. 즉시 이동이라 범위가 이미 바뀌어 조회가
      // 시작됐으므로 바로 "awaiting-settle"로 둔다. 이동이 없었으면 위의 최초
      // 포커스(혜화역 최근접)를 그대로 둔다.
      if (moved) {
        setAwaitingLocatedList(true);
        setMoveRefocus("awaiting-settle");
      }
      setEntryLocateDone(true);
    });
  }, [wantsEntryLocate, mapStatus]);

  // 검색 실패 토스트는 잠시 후 자동으로 사라진다.
  useEffect(() => {
    if (!errorMessage) return;
    const timer = setTimeout(() => setErrorMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [errorMessage]);

  // 마커 클릭: 사용자 액션이므로 포커스를 그 극장으로 옮기고, 진행 중인 이동
  // 포커스가 있으면 취소한다.
  const handleSelectTheatre = (id: number) => {
    const theatre = theatreList.find((t) => t.id === id);
    if (!theatre) return;
    setMoveRefocus("idle");
    setFocusedTheatre(theatre);
    mapViewRef.current?.panToTheatre(theatre);
  };

  /**
   * 현재 위치 버튼. 권한 상태를 미리 묻지 않고 바로 현재 위치를 요청한다.
   * - 성공(허용됨/네이티브 창에서 허용): 받은 좌표로 지도를 옮기고, 그 범위 목록이
   *   오면 그 범위의 최근접 극장으로 포커스를 다시 잡는다(없으면 placeholder).
   * - 실패(차단·거부·조회 불가): 지도는 그대로 두고, 설정에서 허용하도록 안내 모달만 띄운다.
   *   (스펙에 없는 에러 토스트는 띄우지 않는다.)
   */
  const handleLocate = async () => {
    const moved = await mapViewRef.current?.locate();
    if (moved) {
      // panTo 이동이라 idle 이후 그 범위 조회가 시작된다. 그 조회가 끝나면
      // 최근접 극장으로 다시 포커스한다.
      setMoveRefocus("awaiting-fetch");
    } else {
      setGpsModalOpen(true);
    }
  };

  // 안내 모달이 떠 있는 동안 사용자가 브라우저 설정에서 위치를 허용하면,
  // 모달을 닫고 바로 현재 위치로 이동한다(코드로 권한창을 다시 띄울 수 없어 유일한 복구 경로).
  useGeolocationPermissionWatcher(gpsModalOpen, () => {
    setGpsModalOpen(false);
    handleLocate();
  });

  /**
   * 극장·공연명·지역 통합 검색. 현재 지도 중심을 함께 보내 가까운 결과가 먼저
   * 오게 한다. 결과 형태에 따라 지도를 옮기고, 이동 후 idle에서 그 지역의 극장
   * 목록을 다시 불러온다.
   *
   * - LOCATION: 포커스할 극장이 없는 결과라 지도만 그 좌표로 옮기고 포커스는
   *   건드리지 않는다(시트가 사라지지 않게).
   * - THEATRES: 가장 가까운 첫 극장으로 이동하고 그 극장을 포커스한다.
   * - 빈 목록이거나 요청이 실패하면 스펙 문구의 토스트를 띄운다.
   */
  const handleSearch = async (query: string) => {
    const center = mapViewRef.current?.getCenter();
    if (!center) return;

    try {
      const result = await searchTheatres({ keyword: query, ...center });

      if (result.type === "LOCATION") {
        mapViewRef.current?.panTo(result.lat, result.lng);
        return;
      }

      const nearestMatch = result.theatres[0];
      if (!nearestMatch) {
        setErrorMessage("검색 결과를 찾을 수 없습니다");
        return;
      }

      setMoveRefocus("idle");
      setFocusedTheatre(nearestMatch);
      mapViewRef.current?.panToTheatre(nearestMatch);
    } catch {
      setErrorMessage("검색 결과를 찾을 수 없습니다");
    }
  };

  // 동의: 진입 시 현재 위치 이동을 요청한다. 지도가 아직 준비 전이어도 준비된 뒤 이동한다.
  const handleAgree = () => {
    dismiss();
    setAgreed(true);
  };

  // 취소: 지도는 기본 중심(혜화역)에 그대로 머문다. 지도 생성 시점에 이미 그
  // 중심의 뷰포트로 극장 목록을 조회해 뒀으므로 추가 요청 없이 혜화역 기준
  // 결과가 그대로 보인다(모달이 열려 있는 동안 지도는 움직일 수 없다).
  const handleDecline = () => {
    dismiss();
  };

  // 지도 준비 전 또는 첫 극장 조회 중에만 스켈레톤을 덮는다. 지도를 움직여
  // 재조회할 때는 이전 마커가 유지되므로 스켈레톤이 다시 뜨지 않는다.
  const isLoading = mapStatus === "loading" || theatresLoading;

  // 검색은 지도가 크게 튀는 명시적 액션이라, 검색 중에는 "지도 검색 로딩" 화면
  // (스켈레톤: 지도 영역을 덮은 스피너 + 바텀 시트 스켈레톤)으로 덮는다.
  // 첫 로드와 같은 스켈레톤을 재사용한다. (Figma 지도-검색-로딩)
  // 진입 시 현재 위치를 찾는 동안과 그 위치의 목록이 오기 전까지도 같은 스켈레톤을 덮는다.
  const showSkeleton =
    isLoading || isSearching || isEntryLocating || awaitingLocatedList;

  // 스켈레톤을 덮지 않는 지도 이동 재조회는 스켈레톤 대신 지도 위 스피너로 알린다.
  // 캐시·빠른 응답이면 스피너가 잠깐 떴다 사라져 깜빡임처럼 보이므로, 400ms 넘게
  // 걸릴 때만 스피너를 노출한다(지연 표시).
  const dragFetching = !showSkeleton && theatresFetching;
  const [dragSpinnerReady, setDragSpinnerReady] = useState(false);
  useEffect(() => {
    if (!dragFetching) return;
    const timer = setTimeout(() => setDragSpinnerReady(true), 400);
    return () => {
      clearTimeout(timer);
      setDragSpinnerReady(false);
    };
  }, [dragFetching]);

  const isRefetching = dragFetching && dragSpinnerReady;

  // 네이버 지도 키가 없으면 지도를 띄울 수 없어 플레이스홀더를 노출한다.
  if (!NAVER_MAP_CLIENT_ID) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-2 px-8 pb-safe-nav text-center">
        <h1 className="text-h2 font-semibold text-foreground">지도</h1>
        <p className="text-body2 text-muted-foreground">
          네이버 지도 키가 설정되지 않아 지도를 표시할 수 없습니다.
        </p>
      </main>
    );
  }

  return (
    <main className="relative h-dvh overflow-hidden bg-[#f6f6f6]">
      {/* 지도 캔버스 + 현재 위치 버튼 */}
      <MapView
        ref={mapViewRef}
        theatres={theatreList}
        selectedTheatreId={focusedTheatreId}
        onSelectTheatre={handleSelectTheatre}
        onStatusChange={setMapStatus}
        onBoundsChange={setBounds}
        onLocate={handleLocate}
      />

      {/* 첫 로드·검색 중에는 스켈레톤을 지도 위에 얹는다. */}
      {showSkeleton && <MapSkeleton />}

      {/* 지도 이동 재조회 중 표시. 바텀 시트를 뺀 지도 영역의 가로·세로
          중앙에서 20px 위에 둔다. 지도를 가리지 않도록 클릭은 통과시킨다. */}
      {isRefetching && (
        <div
          aria-hidden
          style={{ bottom: MAP_SECTION_BOTTOM }}
          className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-center"
        >
          <LoadingSpinner className="-translate-y-5" />
        </div>
      )}

      {/* 지도 인증/로드 실패 안내 */}
      {mapStatus === "error" && (
        <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
          <p className="text-body2 text-muted-foreground">
            지도를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        </div>
      )}

      {/* 상단 검색창 */}
      <div className="absolute inset-x-0 top-0 z-30 px-4 pt-[calc(env(safe-area-inset-top)+12px)]">
        <MapSearchBar onSearch={handleSearch} />
      </div>

      {/* 검색 실패 토스트: 회원가입 등과 같은 공용 AnimatedToast. 상단 검색창과
          겹치지 않도록 위치만 검색창 아래로 내린다. */}
      <AnimatedToast
        open={!!errorMessage}
        message={errorMessage ?? ""}
        variant="error"
        className="top-[calc(env(safe-area-inset-top)+72px)]"
      />

      {/* 바텀 시트(로드·검색 완료 후). 같은 시트를 유지하며, 포커스 극장이 없으면
          (이동한 범위에 공연장이 없을 때) 극장 대신 "공연장을 선택해 주세요" 안내를
          보여준다(theatre=null). 시트를 새로 만들지 않는다. */}
      {!showSkeleton && (
        <VenueBottomSheet
          theatre={focusedTheatre}
          performances={performances ?? EMPTY_PERFORMANCES}
          isLoading={performancesLoading}
        />
      )}

      {/* 위치 권한 미결정(또는 확인 불가) 시 위치 정보 동의 모달 */}
      <LocationConsentModal
        open={shouldPrompt}
        onAgree={handleAgree}
        onDecline={handleDecline}
      />

      {/* GPS 버튼으로 현재 위치를 못 가져왔을 때(권한 차단) 설정 안내 모달 */}
      <GpsPermissionModal open={gpsModalOpen} onOpenChange={setGpsModalOpen} />
    </main>
  );
}
