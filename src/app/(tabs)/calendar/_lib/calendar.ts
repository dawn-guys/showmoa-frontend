import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { ShowDay, WishlistCalendarResponse } from "../_types";

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

/** Date.getDay() 순서(0=일요일)의 showDays 요일 이름. */
const DAY_NAMES: readonly ShowDay[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

/**
 * 날짜를 yyyy-MM-dd 키로 만든다. 로컬 연·월·일 그대로 포맷한다
 * (toISOString은 UTC라 한국 시간 오전 9시 전에는 하루 전이 된다).
 */
export function toDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * 공연이 그날(yyyy-MM-dd) 실제로 공연하는지 판단한다.
 * 1. 공연 기간 밖이면 아니다(endDate가 null이면 끝 제한 없음).
 * 2. showDays가 null이면(알 수 없음) 기간 전체를 공연일로 본다.
 * 3. 그날의 요일이 showDays에 있으면 공연일이다.
 * 4. 공휴일이고 showsOnHolidays면 공연일이다.
 *
 * yyyy-MM-dd는 사전순 비교가 곧 날짜 비교라 문자열로 바로 비교한다.
 */
export function isShowDay(
  performance: WishlistCalendarResponse,
  date: string,
  holidayDates: ReadonlySet<string>,
): boolean {
  if (date < performance.startDate) return false;
  if (performance.endDate && date > performance.endDate) return false;
  // 백엔드 PR 머지 전 응답에는 showDays가 없어(undefined) null과 같게 본다.
  if (performance.showDays == null) return true;

  const dayName = DAY_NAMES[parseISO(date).getDay()];
  if (performance.showDays.includes(dayName)) return true;

  return performance.showsOnHolidays && holidayDates.has(date);
}

/**
 * 특정 날짜에 공연하는 공연 목록을 반환한다(isShowDay 기준). 월 응답에는 그
 * 달에 걸치는 공연만 담겨 있어 날짜별 목록은 이 필터로 파생한다(하루치 조회
 * API는 계약에 없다). 응답 순서(최근 찜순)를 그대로 둔다.
 */
export function getPerformancesForDay(
  performances: WishlistCalendarResponse[],
  day: Date,
  holidayDates: ReadonlySet<string>,
): WishlistCalendarResponse[] {
  const date = toDateKey(day);
  return performances.filter((p) => isShowDay(p, date, holidayDates));
}

/**
 * 리스트 항목의 공연 기간 표기(yyyy.MM.dd). 단일일 공연은 한 날짜만 보여준다.
 * 끝나는 날이 없는 공연은 상세와 같이 "종료 기간 미정"으로 표시한다.
 */
export function formatDayPeriod(
  startDate: string,
  endDate: string | null,
): string {
  const start = format(parseISO(startDate), "yyyy.MM.dd");
  if (endDate === null) return `${start} - 종료 기간 미정`;
  const end = format(parseISO(endDate), "yyyy.MM.dd");
  return start === end ? start : `${start} - ${end}`;
}
