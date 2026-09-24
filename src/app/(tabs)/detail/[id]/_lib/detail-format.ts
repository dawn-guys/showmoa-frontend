import { format, parseISO } from "date-fns";

/**
 * 공연 정보의 "기간" 표기를 만든다.
 *  - 일반: "2025.07.08 - 2026.08.30"
 *  - 오픈런(endDate null): "2025.07.08 - 종료 기간 미정"
 */
export function formatPerformancePeriod(
  startDate: string,
  endDate: string | null,
): string {
  const start = format(parseISO(startDate), "yyyy.MM.dd");
  if (endDate === null) return `${start} - 종료 기간 미정`;
  return `${start} - ${format(parseISO(endDate), "yyyy.MM.dd")}`;
}
