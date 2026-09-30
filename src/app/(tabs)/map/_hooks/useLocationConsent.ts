"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";

/**
 * 같은 세션에서 동의 모달을 이미 띄웠는지 저장하는 클라이언트 전용 플래그.
 * (블루프린트상 "위치 동의 확인 여부"는 URL이 아닌 순수 클라이언트 플래그라 Zustand에 둔다.)
 * Permissions API가 없는 브라우저(주로 Safari)에서 재진입마다 다시 묻지 않게 막는다.
 */
const useLocationConsentStore = create<{
  asked: boolean;
  markAsked: () => void;
}>()((set) => ({
  asked: false,
  markAsked: () => set({ asked: true }),
}));

/** 위치 권한 상태. 확인 중이거나 Permissions API를 못 쓰는 경우를 더한다. */
type GeolocationPermission = PermissionState | "checking" | "unsupported";

// Permissions API 미지원이거나 geolocation 조회가 막힌 브라우저는 "unsupported"로 본다.
async function queryGeolocationPermission(): Promise<
  PermissionState | "unsupported"
> {
  if (!("permissions" in navigator)) return "unsupported";
  try {
    const status = await navigator.permissions.query({ name: "geolocation" });
    return status.state;
  } catch {
    return "unsupported";
  }
}

/**
 * 지도 진입 시 위치 권한 상태에 따라 동의 모달 노출 여부를 정한다.
 * 로그인 여부와 무관하게 동일하게 동작한다.
 *
 * - granted: 모달 없이 바로 현재 위치를 쓴다(isGranted).
 * - denied: 모달 없이 기본 좌표를 쓴다(다시 물어도 브라우저 권한창이 뜨지 않는다).
 * - prompt: 권한이 확정될 때까지 진입마다 모달을 띄운다.
 * - 미지원: 이번 세션에서 아직 묻지 않았다면 모달을 띄운다.
 */
export function useLocationConsent() {
  // 서버·최초 클라이언트 렌더는 "checking"이라 모달을 열지 않아 하이드레이션 불일치가 없다.
  const [permission, setPermission] =
    useState<GeolocationPermission>("checking");
  // 모달이 닫힌 뒤 같은 화면에서 다시 열리지 않도록 이번 진입의 응답 여부를 둔다.
  const [answered, setAnswered] = useState(false);
  const asked = useLocationConsentStore((state) => state.asked);
  const markAsked = useLocationConsentStore((state) => state.markAsked);

  useEffect(() => {
    let cancelled = false;
    queryGeolocationPermission().then((state) => {
      if (!cancelled) setPermission(state);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // prompt는 권한이 확정될 때까지 진입마다 묻는다. 세션 플래그는 권한 상태를
  // 알 수 없는 미지원 브라우저에서만 반복 노출을 막는 데 쓴다.
  const shouldPrompt =
    permission === "prompt" || (permission === "unsupported" && !asked);

  return {
    shouldPrompt: shouldPrompt && !answered,
    isGranted: permission === "granted",
    isChecking: permission === "checking",
    // 동의/취소 어느 쪽이든 이번 진입과 세션에서는 물어본 것으로 기록한다.
    dismiss: () => {
      setAnswered(true);
      markAsked();
    },
  };
}
