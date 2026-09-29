import { format, parseISO } from "date-fns";
import type { PerformanceStatus } from "@/app/(tabs)/_types";

/**
 * 공연 정보의 "기간" 표기를 만든다(docs/spec/detail.md 16).
 *  - 일반: "2025.07.08 - 2026.08.30"
 *  - 오픈런: "2025.07.08 - 종료 기간 미정"
 *
 * 오픈런 판단은 `openRun` 필드로 한다. 오픈런이어도 endDate가 채워져 내려오는
 * 공연이 있어(예: id 1654), 종료일 유무로 판단하면 확정 종료일처럼 보인다.
 */
export function formatPerformancePeriod(
  startDate: string,
  endDate: string | null,
  openRun: boolean,
): string {
  const start = format(parseISO(startDate), "yyyy.MM.dd");
  if (openRun || endDate === null) return `${start} - 종료 기간 미정`;
  return `${start} - ${format(parseISO(endDate), "yyyy.MM.dd")}`;
}

/**
 * 공연 상태 태그 문구를 만든다. 응답 state를 Figma 카드 표기와 같은 문구로 옮긴다.
 *  - ONGOING: "공연 중"
 *  - ENDED: "공연 종료"
 *  - UPCOMING: "{M}월 {D}일 오픈"(startDate 기준)
 */
export function formatPerformanceStateCaption(
  state: PerformanceStatus,
  startDate: string,
): string {
  if (state === "ENDED") return "공연 종료";
  if (state === "ONGOING") return "공연 중";
  const date = parseISO(startDate);
  return `${date.getMonth() + 1}월 ${date.getDate()}일 오픈`;
}
