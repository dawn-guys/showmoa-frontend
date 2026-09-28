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
import type { WishlistCalendarResponse } from "../_types";

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

/** 달력 월 파라미터(yyyy-MM). GET /api/wishlists/calendar의 month에 그대로 쓴다. */
export function toMonthParam(date: Date): string {
  return format(date, "yyyy-MM");
}

/**
 * 공연별 고유 색상 팔레트. 계약에 색상 필드가 없어 클라이언트가 정한다.
 * 색은 보조 단서이고 제목 텍스트가 주 식별자라, 한 칸(최대 4개 노출) 안에서
 * 같은 색이 겹치는 건 허용한다. 날짜별 순번으로 배정하면 겹침은 없지만
 * 찜을 하나 지울 때마다 모든 공연의 색이 바뀌어 더 나쁘다.
 */
const PERFORMANCE_COLORS = [
  "#ff6f6f",
  "#ffd166",
  "#06d6a0",
  "#4dd0e1",
  "#9abdff",
  "#b388ff",
  "#c792ea",
  "#43ffc0",
  "#ef476f",
] as const;

/**
 * 공연의 고유 색상(hex)을 performanceId에서 결정적으로 뽑는다. 같은 공연은
 * 달을 바꿔도, 월간/주간을 바꿔도 항상 같은 색이다.
 */
export function getPerformanceColor(performanceId: number): string {
  return PERFORMANCE_COLORS[performanceId % PERFORMANCE_COLORS.length];
}

/**
 * 특정 날짜에 열리는 공연 목록을 반환한다. 공연 기간(startDate~endDate)이
 * 해당 날짜를 포함하면 노출한다. 월 응답에는 그 달에 걸치는 공연만 담겨
 * 있어 날짜별 목록은 이 필터로 파생한다(하루치 조회 API는 계약에 없다).
 */
export function getPerformancesForDay(
  performances: WishlistCalendarResponse[],
  day: Date,
): WishlistCalendarResponse[] {
  const target = startOfDay(day);
  return performances.filter((p) => {
    if (target < startOfDay(parseISO(p.startDate))) return false;
    return target <= startOfDay(parseISO(p.endDate));
  });
}

/**
 * 리스트 항목의 공연 기간 표기(yyyy.MM.dd). 단일일 공연은 한 날짜만 보여준다.
 */
export function formatDayPeriod(startDate: string, endDate: string): string {
  const start = format(parseISO(startDate), "yyyy.MM.dd");
  const end = format(parseISO(endDate), "yyyy.MM.dd");
  return start === end ? start : `${start} - ${end}`;
}
