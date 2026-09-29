/// <reference types="navermaps" />
"use client";

import Script from "next/script";
import {
  buildMapScriptUrl,
  NAVER_MAP_CLIENT_ID,
} from "@/app/(tabs)/map/_lib/naver-map";

interface NaverMapScriptProps {
  /**
   * next/script 캐시 키. 지도를 쓰는 화면마다 서로 다른 값을 준다.
   *
   * 같은 id를 나눠 쓰면, 먼저 마운트된 쪽이 아직 내려받는 중일 때 뒤따라
   * 마운트된 쪽의 onReady가 로드 완료 전에 불릴 수 있다. next/script가
   * 그 시점에 캐시 키를 먼저 등록해 두기 때문이다.
   */
  id: string;
  /** naver.maps를 쓸 수 있게 됐을 때. 중복 호출될 수 있다. */
  onLoaded: () => void;
  onError: () => void;
}

/**
 * 네이버 지도 SDK 로더. 지도를 그리는 화면(지도 탭, 상세 공연장 미니 지도)이
 * 각자 렌더한다. src가 같으면 next/script가 실제 내려받기를 한 번만 하므로
 * 화면을 오가도 SDK는 한 번만 로드되고, 지도를 쓰지 않는 화면은 받지 않는다.
 *
 * 이미 로드된 뒤에 마운트되면 onReady가, 내려받는 중에 마운트되면 onLoad가
 * 불린다. 어느 쪽이 올지는 마운트 시점에 달려 있어 둘 다 받고, 전역이 실제로
 * 준비됐는지 확인한 뒤에만 알린다.
 *
 * 키가 없으면 아무것도 렌더하지 않는다. 지도를 못 그릴 때의 대체 표시는
 * 호출하는 화면이 맡는다.
 */
export function NaverMapScript({ id, onLoaded, onError }: NaverMapScriptProps) {
  if (!NAVER_MAP_CLIENT_ID) return null;

  const notifyIfReady = () => {
    if (typeof naver !== "undefined" && naver.maps) onLoaded();
  };

  return (
    <Script
      id={id}
      src={buildMapScriptUrl(NAVER_MAP_CLIENT_ID)}
      strategy="afterInteractive"
      onReady={notifyIfReady}
      onLoad={notifyIfReady}
      onError={onError}
    />
  );
}
