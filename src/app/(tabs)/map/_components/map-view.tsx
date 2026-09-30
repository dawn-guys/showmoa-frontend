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
import type {
  TheatreBoundsParams,
  TheatreMapResponse,
} from "@/app/(tabs)/map/_types";
import {
  buildMapOptions,
  buildUserMarkerContent,
  buildVenueMarkerContent,
  DEFAULT_CENTER,
  toBoundsParams,
  venueMarkerAnchor,
} from "@/app/(tabs)/map/_lib/naver-map";
import { NaverMapScript } from "@/app/(tabs)/map/_components/naver-map-script";

// 인증 실패 시 네이버 지도가 호출하는 전역 콜백. (콘솔에 등록한 웹 서비스 URL에
// 현재 도메인이 없으면 호출된다.)
declare global {
  interface Window {
    navermap_authFailure?: () => void;
  }
}

/**
 * 현재 위치 조회 옵션. 기본값은 시간 제한이 없어(Infinity) 조회가 늘어지면 진입
 * 스켈레톤이 끝나지 않으므로 제한을 두고, 1분 내 캐시된 위치는 재사용해 재진입을 빠르게 한다.
 */
const GEOLOCATION_OPTIONS: PositionOptions = {
  timeout: 10_000,
  maximumAge: 60_000,
};

/** 지도 로딩 상태. */
export type MapStatus = "loading" | "ready" | "error";

export interface MapViewHandle {
  /**
   * 현재 위치로 이동하고 사용자 위치 마커를 갱신한다. 이동했으면 true로 끝난다.
   * instant면 애니메이션 없이 바로 옮기고 그 범위를 곧바로 알린다(진입 시 스켈레톤 아래 이동).
   */
  locate: (options?: { instant?: boolean }) => Promise<boolean>;
  /** 해당 극장 위치로 지도를 부드럽게 이동한다. */
  panToTheatre: (theatre: TheatreMapResponse) => void;
  /** 해당 좌표로 지도를 부드럽게 이동한다. */
  panTo: (lat: number, lng: number) => void;
  /** 현재 지도 중심. 검색의 lat·lng(거리순 정렬 기준)로 보낸다. */
  getCenter: () => { lat: number; lng: number } | null;
}

interface MapViewProps {
  theatres: TheatreMapResponse[];
  selectedTheatreId: number | null;
  onSelectTheatre: (id: number) => void;
  onStatusChange: (status: MapStatus) => void;
  /**
   * 조회할 지도 범위를 알린다. 지도 생성 직후(초기 중심·줌 기준) 한 번,
   * 이후에는 지도 이동·줌이 멈춘 idle 시점마다 호출된다.
   */
  onBoundsChange: (bounds: TheatreBoundsParams) => void;
}

/**
 * 네이버 지도 캔버스. 스크립트를 로드해 지도를 만들고, 극장 마커와
 * 사용자 위치 마커를 관리한다. 부모는 ref로 locate()/panToTheatre()를 호출한다.
 */
export const MapView = forwardRef<MapViewHandle, MapViewProps>(function MapView(
  {
    theatres,
    selectedTheatreId,
    onSelectTheatre,
    onStatusChange,
    onBoundsChange,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<Map<number, naver.maps.Marker>>(new Map());
  const userMarkerRef = useRef<naver.maps.Marker | null>(null);

  // 재진입 시 SDK가 이미 로드돼 있으면 즉시 준비 완료로 본다(파생값은 렌더에서 계산).
  // 최초 로드는 아래 <NaverMapScript>의 onLoaded가 채운다.
  const [scriptLoaded, setScriptLoaded] = useState(
    () => typeof naver !== "undefined" && !!naver.maps,
  );
  const [mapCreated, setMapCreated] = useState(false);

  // 리스너·마커 초기 상태에서 최신 값을 참조하기 위한 ref들.
  const onSelectRef = useRef(onSelectTheatre);
  const onStatusRef = useRef(onStatusChange);
  const onBoundsRef = useRef(onBoundsChange);
  const selectedRef = useRef(selectedTheatreId);
  useEffect(() => {
    onSelectRef.current = onSelectTheatre;
    onStatusRef.current = onStatusChange;
    onBoundsRef.current = onBoundsChange;
    selectedRef.current = selectedTheatreId;
  });

  // 인증 실패 전역 콜백 등록.
  useEffect(() => {
    window.navermap_authFailure = () => onStatusRef.current("error");
    return () => {
      delete window.navermap_authFailure;
    };
  }, []);

  // 스크립트 로드 완료 후 지도 인스턴스를 한 번만 생성한다.
  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || mapRef.current) return;
    if (typeof naver === "undefined" || !naver.maps) return;

    const center = new naver.maps.LatLng(
      DEFAULT_CENTER.lat,
      DEFAULT_CENTER.lng,
    );
    const map = new naver.maps.Map(
      containerRef.current,
      buildMapOptions(center),
    );
    mapRef.current = map;
    setMapCreated(true);
    onStatusRef.current("ready");

    // 첫 조회용 범위. 극장 목록 조회에 bounds가 필수라 idle을 기다리지 않고
    // 생성 직후의 뷰포트(초기 중심·줌)를 바로 알린다. 위치 동의를 거부해도
    // 기본 중심좌표 기준으로 첫 호출이 나간다.
    onBoundsRef.current(toBoundsParams(map));

    // 이후 재조회는 이동·줌이 멈춘 뒤에만 한다(드래그 중 연속 호출 방지).
    const idleListener = naver.maps.Event.addListener(map, "idle", () => {
      onBoundsRef.current(toBoundsParams(map));
    });

    // 마커 Map은 useRef로 만든 동일 인스턴스가 유지되므로 정리 시점에 참조를 캡처해 둔다.
    const markers = markersRef.current;
    return () => {
      naver.maps.Event.removeListener(idleListener);
      markers.forEach((marker) => marker.setMap(null));
      markers.clear();
      userMarkerRef.current?.setMap(null);
      userMarkerRef.current = null;
      mapRef.current?.destroy();
      mapRef.current = null;
    };
  }, [scriptLoaded]);

  // 극장 마커 생성(지도·극장 목록이 준비되면). 초기 선택 상태는 selectedRef로 반영한다.
  useEffect(() => {
    const map = mapRef.current;
    if (!mapCreated || !map) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current.clear();

    theatres.forEach((theatre) => {
      const isSelected = selectedRef.current === theatre.id;
      const anchor = venueMarkerAnchor(isSelected);
      const marker = new naver.maps.Marker({
        map,
        position: new naver.maps.LatLng(theatre.latitude, theatre.longitude),
        icon: {
          content: buildVenueMarkerContent(theatre.name, isSelected),
          anchor: new naver.maps.Point(anchor.x, anchor.y),
        },
        zIndex: isSelected ? 100 : 1,
      });
      naver.maps.Event.addListener(marker, "click", () => {
        onSelectRef.current(theatre.id);
      });
      markersRef.current.set(theatre.id, marker);
    });
  }, [mapCreated, theatres]);

  // 선택된 극장 변경 시 마커 아이콘(크기·말풍선)과 z-index를 갱신한다.
  useEffect(() => {
    if (!mapCreated) return;
    theatres.forEach((theatre) => {
      const marker = markersRef.current.get(theatre.id);
      if (!marker) return;
      const isSelected = selectedTheatreId === theatre.id;
      const anchor = venueMarkerAnchor(isSelected);
      marker.setIcon({
        content: buildVenueMarkerContent(theatre.name, isSelected),
        anchor: new naver.maps.Point(anchor.x, anchor.y),
      });
      marker.setZIndex(isSelected ? 100 : 1);
    });
  }, [mapCreated, selectedTheatreId, theatres]);

  // 현재 위치를 얻어 사용자 마커를 갱신하고 지도를 이동한다. 실패(거부 등)해도
  // 기본 좌표로 지도는 정상 동작한다.
  const moveToCurrentLocation = useCallback(
    ({ instant = false }: { instant?: boolean } = {}) =>
      new Promise<boolean>((resolve) => {
        const map = mapRef.current;
        if (!map || !("geolocation" in navigator)) {
          resolve(false);
          return;
        }
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
            if (instant) {
              // 바로 옮기고 그 범위를 즉시 알린다. 이후 idle은 같은 범위라 재조회되지 않는다.
              map.setCenter(latlng);
              onBoundsRef.current(toBoundsParams(map));
            } else {
              // 이동이 끝나면 idle이 발생해 그 지역의 극장 목록을 다시 불러온다.
              map.panTo(latlng);
            }
            resolve(true);
          },
          () => resolve(false),
          GEOLOCATION_OPTIONS,
        );
      }),
    [],
  );

  useImperativeHandle(ref, () => ({
    panToTheatre: (theatre) => {
      mapRef.current?.panTo(
        new naver.maps.LatLng(theatre.latitude, theatre.longitude),
      );
    },
    panTo: (lat, lng) => {
      mapRef.current?.panTo(new naver.maps.LatLng(lat, lng));
    },
    getCenter: () => {
      const map = mapRef.current;
      if (!map) return null;
      // getCenter()는 Point|LatLng 유니온이지만 LatLng로 만든 지도라 LatLng다.
      // Point의 x·y로 읽으면 위경도가 뒤바뀌어(400 "잘못된 좌표입니다")
      // lat()·lng() 접근자를 쓴다. getBounds()도 같은 이유로 캐스트한다.
      const center = map.getCenter() as naver.maps.LatLng;
      return { lat: center.lat(), lng: center.lng() };
    },
    locate: moveToCurrentLocation,
  }));

  return (
    <>
      <NaverMapScript
        id="naver-maps-sdk-map"
        onLoaded={() => setScriptLoaded(true)}
        onError={() => onStatusRef.current("error")}
      />
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
        onClick={() => moveToCurrentLocation()}
        className="absolute right-4 bottom-[calc(var(--spacing-bottom-nav)+var(--spacing-venue-sheet)+16px)] z-10 flex size-11 items-center justify-center rounded-full bg-white text-primary shadow-[0_0_2px_0_rgb(0_0_0/0.4)] outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
      >
        <LocateFixed size={24} strokeWidth={2} aria-hidden />
      </button>
    </>
  );
});
