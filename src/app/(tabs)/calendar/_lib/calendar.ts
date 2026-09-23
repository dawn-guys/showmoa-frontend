import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { CalendarPerformance } from "../_types";

/** 주 시작 요일(월요일). 달력은 월~일 순서로 표시한다. */
const WEEK_STARTS_ON = 1;

/** 달력 헤더 요일 라벨(월요일 시작). */
export const WEEKDAY_LABELS = [
  "월",
  "화",
  "수",
  "목",
  "금",
  "토",
  "일",
] as const;

/**
 * 해당 월(month0: 0=1월)의 달력 그리드를 주 단위 2차원 배열로 만든다.
 * 앞뒤로 인접한 달의 날짜가 채워질 수 있으며(월요일 시작), 셀에서 isSameMonth로
 * 당월 여부를 구분한다.
 */
export function buildMonthMatrix(year: number, month0: number): Date[][] {
  const first = new Date(year, month0, 1);
  const gridStart = startOfWeek(startOfMonth(first), {
    weekStartsOn: WEEK_STARTS_ON,
  });
  const gridEnd = endOfWeek(endOfMonth(first), {
    weekStartsOn: WEEK_STARTS_ON,
  });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

/** 기준일이 속한 주(월~일)의 7일을 반환한다. */
export function getWeekDays(ref: Date): Date[] {
  return eachDayOfInterval({
    start: startOfWeek(ref, { weekStartsOn: WEEK_STARTS_ON }),
    end: endOfWeek(ref, { weekStartsOn: WEEK_STARTS_ON }),
  });
}

/**
 * 특정 날짜에 열리는 공연 목록을 반환한다. 공연 기간(startDate~endDate)이
 * 해당 날짜를 포함하면 노출하며, 오픈런(endDate 없음)은 시작일 이후 항상 포함한다.
 */
export function getPerformancesForDay(
  performances: CalendarPerformance[],
  day: Date,
): CalendarPerformance[] {
  const target = startOfDay(day);
  return performances.filter((p) => {
    const start = startOfDay(parseISO(p.startDate));
    if (target < start) return false;
    if (!p.endDate) return true; // 오픈런
    return target <= startOfDay(parseISO(p.endDate));
  });
}

/**
 * 리스트 항목의 공연 기간 표기(yyyy.MM.dd). 단일일 공연은 한 날짜만,
 * 오픈런은 "시작일 - 오픈런"으로 표시한다.
 */
export function formatDayPeriod(
  startDate: string,
  endDate: string | null,
): string {
  const start = format(parseISO(startDate), "yyyy.MM.dd");
  if (!endDate) return `${start} - 오픈런`;
  const end = format(parseISO(endDate), "yyyy.MM.dd");
  return start === end ? start : `${start} - ${end}`;
}
