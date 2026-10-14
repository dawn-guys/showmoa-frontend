import { format, isAfter, parseISO, startOfDay } from "date-fns";
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

/**
 * 예매처 버튼을 숨겨야 하는지 판단한다.
 * 오픈런이 아니고(openRun false 또는 없음) 오늘(로컬 자정 = Asia/Seoul)이 종료일을
 * 지났으면 true. 적재 시점 값이라 신뢰할 수 없는 state 원문에 의존하지 않고,
 * openRun·endDate 두 값만으로 판단한다.
 */
export function isTicketingHidden(
  openRun: boolean,
  endDate: string | null,
): boolean {
  if (openRun || !endDate) return false;
  return isAfter(startOfDay(new Date()), parseISO(endDate));
}

/**
 * showTimeGuidance의 공휴일 표기 "HOL"을 화면용 "공휴일"로 바꾼다.
 * 단어 경계로 감싸 "HOL"이 독립된 표기일 때만 치환한다.
 */
export function replaceHolidayLabel(text: string): string {
  return text.replace(/\bHOL\b/g, "공휴일");
}

/** 요일별로 분리한 상영 시간 한 줄(요일 라벨 + 시간들). */
export interface ShowTimeLine {
  /** 요일 라벨(예: "월요일", "월요일 ~ 금요일", "공휴일") */
  day: string;
  /** 시간들(", "로 구분, 예: "15:00, 17:00, 19:30") */
  times: string;
}

/**
 * showTimeGuidance 자유 문구를 요일별 줄로 분리한다.
 * 형식: "월요일 ~ 금요일(15:00,17:00,19:30), 토요일(13:00), 공휴일(14:00)"
 * (원문의 "HOL"은 호출부에서 replaceHolidayLabel로 먼저 바꾼다)
 *  - 세그먼트 구분은 ", "(콤마+공백), 시간 구분은 ","(공백 없음)이라
 *    ", "로 나누면 시간을 깨지 않고 세그먼트만 안전하게 분리된다.
 *  - 각 세그먼트는 "{요일}(시간들)" 꼴이다.
 *
 * 백엔드가 주는 자유 형식이라 구조가 보장되지 않는다. 하나라도 이 꼴이 아니면
 * 파싱을 포기하고 null을 돌려주며, 호출부는 원문을 그대로 표시(폴백)한다.
 */
export function parseShowTimeGuidance(text: string): ShowTimeLine[] | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const lines: ShowTimeLine[] = [];
  for (const segment of trimmed.split(", ")) {
    const match = segment.match(/^(.+?)\(([^()]*)\)$/);
    if (!match) return null;
    const day = match[1].trim();
    const times = match[2]
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .join(", ");
    if (!day || !times) return null;
    lines.push({ day, times });
  }
  return lines.length > 0 ? lines : null;
}
