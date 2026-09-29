import { differenceInCalendarDays, parseISO } from "date-fns";
import type { PerformanceListResponse } from "@/app/(tabs)/_types";
import type { WishlistItemResponse } from "@/app/(tabs)/wishlist/_types";

/** 종료된 공연의 `state` 값(GET /api/performances, /api/performances/search). */
export const STATE_ENDED = "공연완료";
/** 진행 중인 공연의 `state` 값. */
const STATE_ONGOING = "공연중";

/**
 * 카드 진행 뱃지 문구를 만든다(찜 목록 기준).
 *  - ONGOING: "진행 중"
 *  - UPCOMING: "D-{남은 일수}"
 *  - ENDED: "공연 종료"
 * "진행 중"·"D-N"은 Figma 카드 뱃지 표기를 따른다.
 */
export function getWishlistStatusLabel(
  performance: Pick<WishlistItemResponse, "status" | "startDate">,
): string {
  if (performance.status === "ENDED") return "공연 종료";
  if (performance.status === "ONGOING") return "진행 중";

  const days = differenceInCalendarDays(
    parseISO(performance.startDate),
    new Date(),
  );
  return days <= 0 ? "진행 중" : `D-${days}`;
}

/**
 * 카테고리 카드 하단 문구를 만든다.
 *  - 공연중: "공연 중"
 *  - 공연예정: "{M}월 {D}일 오픈"
 *  - 공연완료: "공연 종료"
 * "공연 중"·"{M}월 {D}일 오픈"은 Figma 카드 표기를 따른다.
 * `state`는 계약상 그냥 string이라, 확인된 세 값 외에는 시작일 문구로 둔다.
 */
export function getCategoryCaption(
  performance: Pick<PerformanceListResponse, "state" | "startDate">,
): string {
  if (performance.state === STATE_ENDED) return "공연 종료";
  if (performance.state === STATE_ONGOING) return "공연 중";

  const date = parseISO(performance.startDate);
  return `${date.getMonth() + 1}월 ${date.getDate()}일 오픈`;
}
