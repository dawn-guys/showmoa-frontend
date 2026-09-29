// Contract: PerformanceListResponse, PagePerformanceListResponse, AreaResponse,
// TheatreInfo, PerformanceResponse, TicketingSiteInfo (v3/api-docs)

/**
 * 공연 진행 상태. 백엔드가 저장값이 아니라 오늘(Asia/Seoul)과 공연 기간을
 * 비교해 계산해서 내려준다. 적재 시점 값인 KOPIS 원문 state는 시간이 지나면
 * 실제와 어긋나서, 계약이 이 열거값으로 바뀌었다.
 */
export type PerformanceStatus = "UPCOMING" | "ONGOING" | "ENDED";

/**
 * 공연 목록 항목. GET /api/performances, /api/performances/search,
 * /api/performances/popular 가 같은 스키마를 쓴다.
 * 날짜는 yyyy-MM-dd(시각·오프셋 없음).
 */
export interface PerformanceListResponse {
  id: number;
  name: string;
  posterUrl: string;
  /**
   * 통합 장르 값(연극·뮤지컬·콘서트·클래식·국악·기타).
   * 백엔드 시드 데이터에 genre가 null인 항목이 있어 nullable이다.
   */
  genre: string | null;
  state: PerformanceStatus;
  /** 공연 시작일 yyyy-MM-dd */
  startDate: string;
  /** 공연 종료일 yyyy-MM-dd */
  endDate: string;
  /** 오픈런 여부. true면 endDate가 있어도 종료일을 확정 표기하지 않는다. */
  openRun: boolean;
  theatre: TheatreInfo;
}

/**
 * GET /api/performances/search 응답(Spring Page).
 * sort·pageable(SortObject·PageableObject)은 화면이 읽지 않아 넣지 않는다.
 */
export interface PagePerformanceListResponse {
  content: PerformanceListResponse[];
  totalPages: number;
  totalElements: number;
  size: number;
  /** 0부터 시작하는 현재 페이지 번호 */
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/**
 * GET /api/performances/search 쿼리 파라미터. 배열은 반복 키로 보낸다
 * (pageable 객체가 아니다). districts는 areas 없이 보내면 400이다.
 *
 * interface가 아니라 type으로 둔다. apiFetch의 QueryParams는 인덱스 시그니처를
 * 요구하고, 그 암시적 인덱스 시그니처는 type 별칭에만 붙는다.
 */
export type PerformanceSearchParams = {
  keyword?: string;
  genres?: string[];
  areas?: string[];
  districts?: string[];
  state?: string;
  /** yyyy-MM-dd */
  startDate?: string;
  /** yyyy-MM-dd */
  endDate?: string;
  /** 0부터 시작 */
  page?: number;
  size?: number;
  sort?: string[];
};

/**
 * GET /api/performances/areas 응답 원소. 실제 공연이 있는 지역만 내려오고,
 * 이 값을 areas/districts 파라미터에 그대로 써야 한다.
 * districts는 빈 배열일 수 있다(예: sido "해외").
 */
export interface AreaResponse {
  sido: string;
  districts: string[];
}

// Contract: TheatreInfo, PerformanceResponse (v3/api-docs)

/**
 * 공연이 열리는 극장 정보. PerformanceResponse에 중첩돼 내려온다.
 * 실제 응답 확인 결과 name·address·latitude·longitude는 항상 채워져 있고,
 * telno·websiteUrl은 비어 있는 극장이 있어 nullable이다.
 */
export interface TheatreInfo {
  name: string;
  /** 지번이 아닌 도로명 주소 */
  address: string;
  latitude: number;
  longitude: number;
  /** 대표 전화번호. 등록되지 않은 극장이 있다. */
  telno: string | null;
  /** 공식 홈페이지. 등록되지 않은 극장이 있다. */
  websiteUrl: string | null;
}

/**
 * 공연 상세 정보. GET /api/performances/{id} 와
 * GET /api/theatres/{id}/performances 가 같은 스키마를 쓴다.
 * 날짜는 yyyy-MM-dd(시각·오프셋 없음)이고 상영 시간은 자유 문구다.
 *
 * 실제 응답 확인 결과 ageLimit만 null인 공연이 있었고, cast는 null 없이
 * 빈 배열로 내려온다. endDate는 비어 있는 공연이 없어 optional로 두지 않는다.
 */
export interface PerformanceResponse {
  id: number;
  name: string;
  posterUrl: string;
  /** 통합 장르 값(연극·뮤지컬·콘서트·클래식·국악·기타) */
  genre: string;
  state: PerformanceStatus;
  /** 공연 시작일 yyyy-MM-dd */
  startDate: string;
  /** 공연 종료일 yyyy-MM-dd */
  endDate: string;
  /** 오픈런 여부. true면 endDate가 있어도 종료일을 확정 표기하지 않는다. */
  openRun: boolean;
  /** 공연 소개 이미지 URL 목록. 없으면 빈 배열이다. */
  introImageUrls: string[];
  /** 상영 시간 자유 문구(예: "화요일(19:00)") */
  showTimeGuidance: string;
  /** 관람 연령(예: "만 7세 이상"). 표기가 없는 공연이 있다. */
  ageLimit: string | null;
  /** 출연진. 정보가 없으면 빈 배열이다. */
  cast: string[];
  ticketingSites: TicketingSiteInfo[];
  theatre: TheatreInfo;
  /** 비로그인은 항상 false */
  isWished: boolean;
}

/** PerformanceResponse.ticketingSites 원소 */
export interface TicketingSiteInfo {
  name: string;
  url: string;
}
