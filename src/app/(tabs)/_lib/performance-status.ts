import { differenceInCalendarDays, parseISO } from "date-fns";
import type { PerformanceSummary } from "../_types";

/**
 * 카드 진행 뱃지 문구를 만든다.
 *  - 진행 중: "진행 중"
 *  - 예정: "D-{남은 일수}"
 *  - 종료: "공연 종료"
 * "진행 중"·"D-N"은 Figma 카드 뱃지 표기를 따른다.
 */
export function getPerformanceStatusLabel(
  performance: PerformanceSummary,
): string {
  if (performance.status === "ended") return "공연 종료";
  if (performance.status === "ongoing") return "진행 중";

  const days = differenceInCalendarDays(
    parseISO(performance.startDate),
    new Date(),
  );
  return days <= 0 ? "진행 중" : `D-${days}`;
}
