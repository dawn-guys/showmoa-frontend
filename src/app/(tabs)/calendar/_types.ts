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
 * 실제 응답 확인 결과 여덟 필드 모두 채워져 내려오고 endDate가 빈 항목은
 * 없었다(오픈런 공연이 응답에 없었다). nullable로 두지 않는다.
 */
export interface WishlistCalendarResponse {
  performanceId: number;
  name: string;
  /** 공연장 이름. 상세 주소는 이 응답에 없다. */
  theatreName: string;
  posterUrl: string;
  /** 공연 시작일 yyyy-MM-dd */
  startDate: string;
  /** 공연 종료일 yyyy-MM-dd */
  endDate: string;
  /** 찜한 시각(ISO 8601). 서버 정렬 기준이라 화면은 읽지 않는다. */
  wishedAt: string;
  /** 찜 캘린더 응답이므로 항상 true */
  isWished: boolean;
}

/** 달력 표시 모드. 월간/주간 토글에 사용한다. */
export type CalendarViewMode = "month" | "week";
