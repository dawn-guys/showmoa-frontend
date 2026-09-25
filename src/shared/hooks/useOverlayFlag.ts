"use client";

import { parseAsBoolean, useQueryState } from "nuqs";

/**
 * 오버레이(모달·바텀시트·드로워) 열림 상태를 URL에 저장할 때 쓰는 공통 옵션.
 *
 * - `history: "replace"` — 여닫을 때마다 뒤로가기 스택이 쌓이지 않게 현재
 *   히스토리 항목을 덮어쓴다. 오버레이는 뒤로가기가 아니라 백드롭·Esc·닫기
 *   버튼으로 닫는다.
 * - `scroll: false` — URL만 갱신하고 스크롤 위치를 건드리지 않는다.
 *
 * 오버레이 URL 상태는 반드시 이 옵션(또는 아래 훅)을 거쳐 옵션이 파일마다
 * 흩어지지 않게 한다. 문자열/열거형 파라미터(예: 어떤 약관인지)는 이 옵션을
 * 그대로 펼쳐 쓴다.
 */
export const overlayUrlOptions = {
  history: "replace",
  scroll: false,
} as const;

/**
 * 열림/닫힘만 다루는 오버레이의 URL 상태 훅. `?key=true`로 열고 파라미터를
 * 지워 닫는다. nuqs 옵션은 {@link overlayUrlOptions}로 고정돼 히스토리가
 * 쌓이지 않는다.
 */
export function useOverlayFlag(key: string) {
  return useQueryState(
    key,
    parseAsBoolean.withDefault(false).withOptions(overlayUrlOptions),
  );
}
