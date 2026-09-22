"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/shared/hooks/useAuth";
import { Toast } from "@/shared/components/toast";
import type { MapVenue } from "@/app/(tabs)/map/_types";
import { NAVER_MAP_CLIENT_ID } from "@/app/(tabs)/map/_lib/naver-map";
import { useVenues } from "@/app/(tabs)/map/_hooks/useVenues";
import { useLocationConsent } from "@/app/(tabs)/map/_hooks/useLocationConsent";
import {
  MapView,
  type MapStatus,
  type MapViewHandle,
} from "@/app/(tabs)/map/_components/map-view";
import { MapSearchBar } from "@/app/(tabs)/map/_components/map-search-bar";
import { MapSkeleton } from "@/app/(tabs)/map/_components/map-skeleton";
import { VenueBottomSheet } from "@/app/(tabs)/map/_components/venue-bottom-sheet";
import { LocationConsentModal } from "@/app/(tabs)/map/_components/location-consent-modal";

// 검색어를 공백 제거 후 비교해 "유니온 센터" ↔ "유니온센터" 같은 표기 차이를 흡수한다.
const normalize = (value: string) => value.replace(/\s+/g, "");

// venues 미로드 시 넘길 안정적인 빈 배열(참조가 매 렌더 바뀌지 않도록 모듈 상수로 둔다).
const EMPTY_VENUES: MapVenue[] = [];

/**
 * 지도 화면 오케스트레이터. 지도·검색·바텀 시트·동의 모달을 연결한다.
 * 지도 인스턴스 제어(현재 위치/공연장 이동)는 MapView의 imperative handle로 위임한다.
 */
export function MapScreen() {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const { data: venues, isLoading: venuesLoading } = useVenues();
  const { shouldPrompt, dismiss } = useLocationConsent(
    !authLoading && !isLoggedIn,
  );

  const mapViewRef = useRef<MapViewHandle>(null);
  const [mapStatus, setMapStatus] = useState<MapStatus>("loading");
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const venueList = venues ?? EMPTY_VENUES;

  // 선택값이 없으면 첫 공연장을 기본 선택으로 파생한다(effect 없이 렌더에서 계산).
  const effectiveSelectedId = selectedVenueId ?? venueList[0]?.id ?? null;

  // 검색 실패 토스트는 잠시 후 자동으로 사라진다.
  useEffect(() => {
    if (!errorMessage) return;
    const timer = setTimeout(() => setErrorMessage(null), 2500);
    return () => clearTimeout(timer);
  }, [errorMessage]);

  const selectedVenue =
    venueList.find((venue) => venue.id === effectiveSelectedId) ?? null;

  const handleSelectVenue = (id: string) => {
    setSelectedVenueId(id);
    const venue = venueList.find((v) => v.id === id);
    if (venue) mapViewRef.current?.panToVenue(venue);
  };

  // MOCK: Phase 2에서 실제 극장 검색 API로 교체한다. 지금은 목업 공연장 이름을 매칭한다.
  const handleSearch = async (query: string) => {
    setSearching(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    const q = normalize(query);
    const matched = venueList.find((venue) =>
      normalize(venue.name).includes(q),
    );
    if (matched) {
      setSelectedVenueId(matched.id);
      mapViewRef.current?.panToVenue(matched);
    } else {
      setErrorMessage("공연을 찾을 수 없습니다");
    }
    setSearching(false);
  };

  const handleAgree = () => {
    dismiss();
    mapViewRef.current?.locate();
  };

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

  const isLoading = mapStatus === "loading" || venuesLoading;

  return (
    <main className="relative h-dvh overflow-hidden bg-[#f6f6f6]">
      {/* 지도 캔버스 + 현재 위치 버튼 */}
      <MapView
        ref={mapViewRef}
        venues={venueList}
        selectedVenueId={effectiveSelectedId}
        onSelectVenue={handleSelectVenue}
        onStatusChange={setMapStatus}
      />

      {/* 로딩 중에는 스켈레톤을 지도 위에 얹는다. */}
      {isLoading && <MapSkeleton />}

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
        <MapSearchBar onSearch={handleSearch} searching={searching} />
      </div>

      {/* 검색 실패 토스트 */}
      {errorMessage && (
        <div className="absolute inset-x-0 top-[calc(env(safe-area-inset-top)+72px)] z-40 flex justify-center px-4">
          <Toast message={errorMessage} variant="error" />
        </div>
      )}

      {/* 공연장 공연 정보 바텀 시트(로드 완료 후) */}
      {!isLoading && selectedVenue && (
        <VenueBottomSheet venue={selectedVenue} />
      )}

      {/* 비로그인 최초 진입 시 위치 정보 동의 모달 */}
      <LocationConsentModal
        open={shouldPrompt}
        onAgree={handleAgree}
        onDecline={dismiss}
      />
    </main>
  );
}
