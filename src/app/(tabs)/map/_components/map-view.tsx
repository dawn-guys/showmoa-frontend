/// <reference types="navermaps" />
"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { LocateFixed } from "lucide-react";
import type { MapVenue } from "@/app/(tabs)/map/_types";
import {
  buildMapOptions,
  buildUserMarkerContent,
  buildVenueMarkerContent,
  DEFAULT_CENTER,
  venueMarkerAnchor,
} from "@/app/(tabs)/map/_lib/naver-map";

// 인증 실패 시 네이버 지도가 호출하는 전역 콜백. (콘솔에 등록한 웹 서비스 URL에
// 현재 도메인이 없으면 호출된다.)
declare global {
  interface Window {
    navermap_authFailure?: () => void;
  }
}

/** 지도 로딩 상태. */
export type MapStatus = "loading" | "ready" | "error";

export interface MapViewHandle {
  /** 현재 위치로 이동하고 사용자 위치 마커를 갱신한다. */
  locate: () => void;
  /** 해당 공연장 위치로 지도를 부드럽게 이동한다. */
  panToVenue: (venue: MapVenue) => void;
}

interface MapViewProps {
  venues: MapVenue[];
  selectedVenueId: string | null;
  onSelectVenue: (id: string) => void;
  onStatusChange: (status: MapStatus) => void;
}

/**
 * 네이버 지도 캔버스. (tabs) 셸에서 한 번 로드한 SDK가 준비되면 지도를 만들고,
 * 공연장 마커와 사용자 위치 마커를 관리한다. 부모는 ref로 locate()/panToVenue()를
 * 호출한다.
 */
export const MapView = forwardRef<MapViewHandle, MapViewProps>(function MapView(
  { venues, selectedVenueId, onSelectVenue, onStatusChange },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<Map<string, naver.maps.Marker>>(new Map());
  const userMarkerRef = useRef<naver.maps.Marker | null>(null);

  // 재진입 시 SDK가 이미 로드돼 있으면 즉시 준비 완료로 본다(파생값은 렌더에서 계산).
  const [scriptLoaded, setScriptLoaded] = useState(
    () => typeof naver !== "undefined" && !!naver.maps,
  );
  const [mapCreated, setMapCreated] = useState(false);

  // 리스너·마커 초기 상태에서 최신 값을 참조하기 위한 ref들.
  const onSelectRef = useRef(onSelectVenue);
  const onStatusRef = useRef(onStatusChange);
  const selectedRef = useRef(selectedVenueId);
  useEffect(() => {
    onSelectRef.current = onSelectVenue;
    onStatusRef.current = onStatusChange;
    selectedRef.current = selectedVenueId;
  });

  // 인증 실패 전역 콜백 등록.
  useEffect(() => {
    window.navermap_authFailure = () => onStatusRef.current("error");
    return () => {
      delete window.navermap_authFailure;
    };
  }, []);

  // (tabs) 셸에서 로드한 SDK가 준비될 때까지 대기한다. 이미 로드돼 있으면
  // 초기값이 true라 이 effect는 건너뛴다. 10초 내 안 뜨면 에러로 처리한다.
  useEffect(() => {
    if (scriptLoaded) return;
    let tries = 0;
    const id = setInterval(() => {
      if (typeof naver !== "undefined" && naver.maps) {
        clearInterval(id);
        setScriptLoaded(true);
      } else if (++tries > 100) {
        clearInterval(id);
        onStatusRef.current("error");
      }
    }, 100);
    return () => clearInterval(id);
  }, [scriptLoaded]);

  // 스크립트 로드 완료 후 지도 인스턴스를 한 번만 생성한다.
  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || mapRef.current) return;
    if (typeof naver === "undefined" || !naver.maps) return;

    const center = new naver.maps.LatLng(
      DEFAULT_CENTER.lat,
      DEFAULT_CENTER.lng,
    );
    mapRef.current = new naver.maps.Map(
      containerRef.current,
      buildMapOptions(center),
    );
    setMapCreated(true);
    onStatusRef.current("ready");

    // 마커 Map은 useRef로 만든 동일 인스턴스가 유지되므로 정리 시점에 참조를 캡처해 둔다.
    const markers = markersRef.current;
    return () => {
      markers.forEach((marker) => marker.setMap(null));
      markers.clear();
      userMarkerRef.current?.setMap(null);
      userMarkerRef.current = null;
      mapRef.current?.destroy();
      mapRef.current = null;
    };
  }, [scriptLoaded]);

  // 공연장 마커 생성(지도·공연장 목록이 준비되면). 초기 선택 상태는 selectedRef로 반영한다.
  useEffect(() => {
    const map = mapRef.current;
    if (!mapCreated || !map || venues.length === 0) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current.clear();

    venues.forEach((venue) => {
      const isSelected = selectedRef.current === venue.id;
      const anchor = venueMarkerAnchor(isSelected);
      const marker = new naver.maps.Marker({
        map,
        position: new naver.maps.LatLng(venue.lat, venue.lng),
        icon: {
          content: buildVenueMarkerContent(venue.name, isSelected),
          anchor: new naver.maps.Point(anchor.x, anchor.y),
        },
        zIndex: isSelected ? 100 : 1,
      });
      naver.maps.Event.addListener(marker, "click", () => {
        onSelectRef.current(venue.id);
      });
      markersRef.current.set(venue.id, marker);
    });
  }, [mapCreated, venues]);

  // 선택된 공연장 변경 시 마커 아이콘(크기·말풍선)과 z-index를 갱신한다.
  useEffect(() => {
    if (!mapCreated) return;
    venues.forEach((venue) => {
      const marker = markersRef.current.get(venue.id);
      if (!marker) return;
      const isSelected = selectedVenueId === venue.id;
      const anchor = venueMarkerAnchor(isSelected);
      marker.setIcon({
        content: buildVenueMarkerContent(venue.name, isSelected),
        anchor: new naver.maps.Point(anchor.x, anchor.y),
      });
      marker.setZIndex(isSelected ? 100 : 1);
    });
  }, [mapCreated, selectedVenueId, venues]);

  // 현재 위치를 얻어 사용자 마커를 갱신하고 지도를 이동한다. 실패(거부 등)해도
  // 기본 좌표로 지도는 정상 동작한다.
  const moveToCurrentLocation = useCallback(() => {
    const map = mapRef.current;
    if (!map || !("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const latlng = new naver.maps.LatLng(latitude, longitude);
        if (userMarkerRef.current) {
          userMarkerRef.current.setPosition(latlng);
        } else {
          userMarkerRef.current = new naver.maps.Marker({
            map,
            position: latlng,
            icon: {
              content: buildUserMarkerContent(),
              anchor: new naver.maps.Point(11, 11),
            },
            zIndex: 50,
          });
        }
        map.panTo(latlng);
      },
      () => {},
    );
  }, []);

  useImperativeHandle(ref, () => ({
    panToVenue: (venue) => {
      mapRef.current?.panTo(new naver.maps.LatLng(venue.lat, venue.lng));
    },
    locate: moveToCurrentLocation,
  }));

  return (
    <>
      {/* 지도 영역을 차지하는 래퍼. 높이 = 전체 높이 + 20px - (하단 나브 + 시트 기본 높이).
          네이버 지도가 내부 컨테이너에 position:relative를 덮어써 높이가 무너지므로,
          래퍼가 크기를 잡고 실제 지도 컨테이너는 size-full(높이 100%)로 채운다. */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height:
            "calc(100dvh + 20px - (var(--spacing-bottom-nav) + var(--spacing-venue-sheet)))",
        }}
      >
        <div
          ref={containerRef}
          data-naver-map
          className="size-full"
          aria-hidden
        />
      </div>

      {/* 현재 위치 버튼 */}
      <button
        type="button"
        aria-label="현재 위치로 이동"
        onClick={moveToCurrentLocation}
        className="absolute right-4 bottom-[calc(var(--spacing-bottom-nav)+var(--spacing-venue-sheet)+16px)] flex size-11 items-center justify-center rounded-full bg-white text-primary shadow-[0_0_2px_0_rgb(0_0_0/0.4)] outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
      >
        <LocateFixed size={24} strokeWidth={2} aria-hidden />
      </button>
    </>
  );
});
