"use client";

import { useEffect, useRef } from "react";

/**
 * 위치 권한이 'granted'로 바뀌는 순간을 감지해 콜백을 호출한다.
 *
 * GPS 안내 모달이 떠 있는 동안(= enabled) 사용자가 브라우저 설정에서 직접
 * 위치 권한을 허용하는 경우를 잡아, 모달을 닫고 바로 현재 위치로 이동하게 한다.
 * (코드로는 권한창을 다시 띄울 수 없어, 설정 변경을 수동으로 감지하는 것이 유일한 복구 경로다.)
 *
 * Permissions API가 없는 브라우저(주로 Safari)에서는 아무것도 하지 않는다.
 *
 * @param enabled 구독 활성화 여부(안내 모달이 열려 있을 때만 true로 둔다).
 * @param onGranted 권한이 'granted'로 바뀌면 호출된다.
 */
export function useGeolocationPermissionWatcher(
  enabled: boolean,
  onGranted: () => void,
) {
  // effect가 콜백 변경마다 재구독되지 않도록 ref로 최신 콜백을 참조한다.
  const onGrantedRef = useRef(onGranted);
  useEffect(() => {
    onGrantedRef.current = onGranted;
  });

  useEffect(() => {
    if (!enabled || !("permissions" in navigator)) return;

    let status: PermissionStatus | null = null;
    let cancelled = false;
    const handleChange = () => {
      if (status?.state === "granted") onGrantedRef.current();
    };

    navigator.permissions
      .query({ name: "geolocation" })
      .then((result) => {
        if (cancelled) return;
        status = result;
        status.addEventListener("change", handleChange);
      })
      .catch(() => {
        // 조회가 막힌 브라우저는 자동 복구를 포기한다(사용자가 다시 버튼을 누르면 재시도된다).
      });

    return () => {
      cancelled = true;
      status?.removeEventListener("change", handleChange);
    };
  }, [enabled]);
}
