// Provisional: based on screen spec, not the API contract.
import type { PerformanceSummary } from "@/app/(tabs)/_types";

/**
 * 캘린더에서 사용하는 공연 정보. 홈/찜과 공유하는 요약 정보에, 달력 셀에서
 * 공연을 시각적으로 분류하기 위한 고유 색상(color)을 더한다.
 * docs/spec/calendar.md의 "공연 고유 색상" 요구사항에 대응한다.
 */
export interface CalendarPerformance extends PerformanceSummary {
  /** 달력 셀 칩의 좌측 보더 색상(공연별 고유 색상, hex) */
  color: string;
}

/** 달력 표시 모드. 월간/주간 토글에 사용한다. */
export type CalendarViewMode = "month" | "week";
