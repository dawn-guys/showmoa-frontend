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

/**
 * 공연 상태 태그 문구를 만든다. 응답 state(공연예정·공연중·공연완료)를
 * Figma 카드 표기와 동일한 문구로 옮긴다.
 *  - 공연중: "공연 중"
 *  - 공연완료: "공연 종료"
 *  - 공연예정: "{M}월 {D}일 오픈"(startDate 기준)
 */
export function formatPerformanceStateCaption(
  state: string,
  startDate: string,
): string {
  if (state === "공연완료") return "공연 종료";
  if (state === "공연중") return "공연 중";
  const date = parseISO(startDate);
  return `${date.getMonth() + 1}월 ${date.getDate()}일 오픈`;
}
