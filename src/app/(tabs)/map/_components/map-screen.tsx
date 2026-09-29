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
import { useAuth } from "@/shared/hooks/useAuth";
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
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const { shouldPrompt, dismiss } = useLocationConsent(
    !authLoading && !isLoggedIn,
  );

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
   * 포커스된 극장. 사용자 액션(마커 클릭·검색)으로만 바뀐다.
   *
   * id가 아니라 응답 객체를 그대로 담는다. 그래서 지도를 옮겨 이 극장이 현재
   * 뷰포트 조회 결과에서 빠져도 시트는 그대로 유지되고(시트가 사라지지 않음),
   * 지도 이동만으로 다른 극장이 포커스되지도 않는다.
   */
  const [selectedTheatre, setSelectedTheatre] =
    useState<TheatreMapResponse | null>(null);

  /**
   * 진입 직후 1회만 정하는 기본 포커스(딥링크 극장 → 지도 중앙 최근접 극장).
   * 시트는 진입 시점부터 자리를 차지하는 UI라 비워 둘 수 없어 기본값을 둔다.
   * 첫 목록에서 한 번만 정하고, 이후 지도 이동으로는 갱신하지 않는다.
   */
  const [initialTheatre, setInitialTheatre] =
    useState<TheatreMapResponse | null>(null);

  // 딥링크 극장으로의 최초 이동을 한 번만 수행하기 위한 플래그.
  const didFocusTheatreRef = useRef(false);

  const theatreList = theatres ?? EMPTY_THEATRES;

  // 첫 목록이 도착한 렌더에서 기본 포커스를 확정한다. effect가 아니라 렌더 중
  // 상태 조정이라 추가 커밋 없이 곧바로 반영된다.
  if (initialTheatre === null && theatreList.length > 0) {
    const fromDeepLink = venueIdParam
      ? theatreList.find((theatre) => String(theatre.id) === venueIdParam)
      : undefined;
    setInitialTheatre(
      fromDeepLink ??
        theatreList.find((theatre) => theatre.nearest) ??
        theatreList[0],
    );
  }

  // 사용자가 고른 극장이 있으면 그것, 없으면 진입 시 기본 포커스.
  const focusedTheatre = selectedTheatre ?? initialTheatre;
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

  // 검색 실패 토스트는 잠시 후 자동으로 사라진다.
  useEffect(() => {
    if (!errorMessage) return;
    const timer = setTimeout(() => setErrorMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [errorMessage]);

  // 마커 클릭: 사용자 액션이므로 포커스를 옮긴다.
  const handleSelectTheatre = (id: number) => {
    const theatre = theatreList.find((t) => t.id === id);
    if (!theatre) return;
    setSelectedTheatre(theatre);
    mapViewRef.current?.panToTheatre(theatre);
  };

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

      setSelectedTheatre(nearestMatch);
      mapViewRef.current?.panToTheatre(nearestMatch);
    } catch {
      setErrorMessage("검색 결과를 찾을 수 없습니다");
    }
  };

  // 동의: 현재 위치로 이동한다. 이동이 끝나면 idle에서 그 지역을 다시 조회한다.
  const handleAgree = () => {
    dismiss();
    mapViewRef.current?.locate();
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
  const showSkeleton = isLoading || isSearching;

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

      {/* 극장 공연 정보 바텀 시트(로드·검색 완료 후) */}
      {!showSkeleton && focusedTheatre && (
        <VenueBottomSheet
          theatre={focusedTheatre}
          performances={performances ?? EMPTY_PERFORMANCES}
          isLoading={performancesLoading}
        />
      )}

      {/* 비로그인 최초 진입 시 위치 정보 동의 모달 */}
      <LocationConsentModal
        open={shouldPrompt}
        onAgree={handleAgree}
        onDecline={handleDecline}
      />
    </main>
  );
}
