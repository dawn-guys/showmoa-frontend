// Contract: WishlistItemResponse, SliceResponseWishlistItemResponse (v3/api-docs)

/** 찜 목록 항목의 공연 상태. 계약에 열거된 세 값만 내려온다. */
export type WishlistStatus = "UPCOMING" | "ONGOING" | "ENDED";

/**
 * 찜 목록 항목. GET /api/wishlists 응답 content의 원소다.
 * 공연 날짜는 yyyy-MM-dd(시각·오프셋 없음)이고 wishedAt만 date-time이다.
 */
export interface WishlistItemResponse {
  performanceId: number;
  name: string;
  posterUrl: string;
  /**
   * 통합 장르 값(연극·뮤지컬·콘서트·클래식·국악·기타).
   * 검색 목록(PerformanceListResponse)과 같은 공연 데이터를 쓰고 그쪽에
   * genre가 null인 항목이 있어 여기서도 nullable로 둔다.
   */
  genre: string | null;
  status: WishlistStatus;
  /** 공연 시작일 yyyy-MM-dd */
  startDate: string;
  /** 공연 종료일 yyyy-MM-dd */
  endDate: string;
  /** 찜한 시각(ISO 8601). 서버 정렬 기준이라 화면은 읽지 않는다. */
  wishedAt: string;
  /** 찜 목록 응답이므로 항상 true */
  isWished: boolean;
}

/**
 * GET /api/wishlists 응답(Spring Slice). 총 개수는 세지 않고 hasNext만 내려온다.
 * 정렬은 미종료(공연 중·예정) 먼저, 종료 나중, 그룹 안에서는 최근 찜순이다.
 */
export interface SliceResponseWishlistItemResponse {
  content: WishlistItemResponse[];
  /** 0부터 시작하는 현재 페이지 번호 */
  page: number;
  size: number;
  hasNext: boolean;
}
