// Contract: WishlistCalendarResponse (v3/api-docs)

/**
 * 찜 캘린더 항목. GET /api/wishlists/calendar?month=yyyy-MM 응답 배열의 원소다.
 * 공연 기간이 해당 월에 걸치는 찜 공연만, 페이징 없이 최근 찜순으로 내려온다.
 * 월간·주간 달력과 날짜 바텀 시트가 이 응답 하나를 함께 쓴다.
 *
 * 찜 목록 항목(WishlistItemResponse)과 달리 status·genre가 없고,
 * 대신 theatreName이 있다. 공연 날짜는 yyyy-MM-dd(시각·오프셋 없음)이고
 * wishedAt만 date-time이다.
 *
 * endDate는 끝나는 날이 없는 공연에서 null로 내려온다.
 *
 * showDays·showsOnHolidays는 백엔드 PR 머지 전이라 계약에 아직 없다.
 * 머지 전 실제 응답에는 두 필드가 빠져 있어(undefined) showDays를 null과
 * 같게 다룬다(기간 전체 표시, _lib/calendar의 isShowDay 참고).
 */
export interface WishlistCalendarResponse {
  performanceId: number;
  name: string;
  /** 공연장 이름. 상세 주소는 이 응답에 없다. */
  theatreName: string;
  posterUrl: string;
  /** 공연 시작일 yyyy-MM-dd */
  startDate: string;
  /** 공연 종료일 yyyy-MM-dd. 끝나는 날이 없는 공연은 null */
  endDate: string | null;
  /** 찜한 시각(ISO 8601). 서버 정렬 기준이라 화면은 읽지 않는다. */
  wishedAt: string;
  /** 찜 캘린더 응답이므로 항상 true */
  isWished: boolean;
  /**
   * 공연하는 요일. []이면 요일 공연 없이 공휴일에만 공연하고,
   * null이면 공연하는 날을 알 수 없어 기간 전체에 표시한다.
   */
  showDays: ShowDay[] | null;
  /** 공휴일에도 공연하면 true */
  showsOnHolidays: boolean;
}

/** 공연 요일. showDays 배열의 원소다. */
export type ShowDay =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

/** 달력 표시 모드. 월간/주간 토글에 사용한다. */
export type CalendarViewMode = "month" | "week";
