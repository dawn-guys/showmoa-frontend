"use client";

import { useSyncExternalStore } from "react";

// 위치 정보 서비스 동의 모달을 이미 봤는지 저장하는 localStorage 키.
// (블루프린트상 "위치 동의 확인 여부"는 URL이 아닌 순수 클라이언트 플래그다.)
const STORAGE_KEY = "showmoa:location-consent-seen";

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

// 서버에선 '이미 봤음'으로 취급해 SSR/최초 클라이언트 렌더에서 모달을 열지 않는다.
// 하이드레이션 후 클라이언트가 실제 값을 읽어 반영하므로 불일치가 없다.
function getServerSnapshot() {
  return true;
}

function markSeen() {
  window.localStorage.setItem(STORAGE_KEY, "1");
  listeners.forEach((listener) => listener());
}

/**
 * 비로그인 + 최초 접근일 때만 위치 동의 모달을 띄우기 위한 훅.
 * 최초 여부는 localStorage 플래그로 판단하며, 클라이언트 전용 값이라
 * useSyncExternalStore로 읽어 하이드레이션 불일치를 피한다.
 *
 * @param enabled 모달 노출 대상인지(비로그인 확정 시 true)
 */
export function useLocationConsent(enabled: boolean) {
  const seen = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    shouldPrompt: enabled && !seen,
    // 동의/취소 어느 쪽이든 최초 노출은 끝난 것으로 보고 플래그를 저장한다.
    dismiss: markSeen,
  };
}
