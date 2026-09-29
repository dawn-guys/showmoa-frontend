/// <reference types="navermaps" />
"use client";

import { useEffect, useRef, useState } from "react";
import { MapPointLineDuotoneIcon } from "@solar-icons/react";
import {
  buildMapOptions,
  buildVenueMarkerContent,
  NAVER_MAP_CLIENT_ID,
  venueMarkerAnchor,
} from "@/app/(tabs)/map/_lib/naver-map";
import { NaverMapScript } from "@/app/(tabs)/map/_components/naver-map-script";

interface VenueMiniMapProps {
  /** 공연장 이름(마커 표시용) */
  name: string;
  lat: number;
  lng: number;
}

/** 지도를 그릴 수 없을 때(키 없음·로드 실패) 자리를 채우는 표시. */
function MiniMapPlaceholder() {
  return (
    <div className="flex h-[150px] w-full items-center justify-center gap-1.5 rounded-md bg-muted text-body3 text-muted-foreground">
      <MapPointLineDuotoneIcon size={18} aria-hidden />
      지도를 표시할 수 없습니다
    </div>
  );
}

/**
 * 공연장 위치를 간략히 보여주는 정적 미니 지도. 네이버 지도 SDK를 이 화면에서
 * 직접 로드하므로 지도 탭을 거치지 않고 들어와도 뜬다(지도 탭과 src가 같아
 * 실제 내려받기는 한 번뿐이다). 사용자 조작은 막아 스크롤을 방해하지 않는다.
 */
export function VenueMiniMap({ name, lat, lng }: VenueMiniMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  // 재진입 시 SDK가 이미 로드돼 있으면 즉시 준비 완료로 본다(파생값은 렌더에서 계산).
  // 최초 로드는 아래 <NaverMapScript>의 onLoaded가 채운다.
  const [scriptLoaded, setScriptLoaded] = useState(
    () => typeof naver !== "undefined" && !!naver.maps,
  );
  const [failed, setFailed] = useState(false);

  // 지도 인스턴스를 한 번 생성하고 단일 마커를 얹는다.
  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || mapRef.current) return;
    if (typeof naver === "undefined" || !naver.maps) return;

    const center = new naver.maps.LatLng(lat, lng);
    const map = new naver.maps.Map(containerRef.current, {
      ...buildMapOptions(center),
      // 간략 표시: 모든 조작을 막는다.
      draggable: false,
      scrollWheel: false,
      pinchZoom: false,
      disableDoubleTapZoom: true,
      disableDoubleClickZoom: true,
      disableKineticPan: true,
    });
    const anchor = venueMarkerAnchor(false);
    new naver.maps.Marker({
      map,
      position: center,
      icon: {
        content: buildVenueMarkerContent(name, false),
        anchor: new naver.maps.Point(anchor.x, anchor.y),
      },
    });
    mapRef.current = map;

    return () => {
      mapRef.current?.destroy();
      mapRef.current = null;
    };
  }, [scriptLoaded, lat, lng, name]);

  // 키가 없거나 스크립트를 못 받으면 지도를 띄울 수 없다.
  if (!NAVER_MAP_CLIENT_ID || failed) return <MiniMapPlaceholder />;

  // 네이버 지도가 내부 컨테이너 position을 덮어써 높이가 무너지므로,
  // 래퍼가 높이를 잡고 실제 지도 컨테이너는 size-full로 채운다.
  return (
    <>
      <NaverMapScript
        id="naver-maps-sdk-detail"
        onLoaded={() => setScriptLoaded(true)}
        onError={() => setFailed(true)}
      />
      <div className="h-[150px] w-full overflow-hidden rounded-md bg-muted">
        <div
          ref={containerRef}
          data-naver-map
          className="size-full"
          aria-hidden
        />
      </div>
    </>
  );
}
