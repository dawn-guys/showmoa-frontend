// Contract: PerformanceListResponse, PagePerformanceListResponse, AreaResponse,
// WishlistResponse (v3/api-docs)
import type { GenreCategory } from "@/shared/constants/genre";

/**
 * 공연 목록 항목. GET /api/performances/search 응답 content의 원소다.
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
  /** 공연 상태(공연예정·공연중·공연완료) */
  state: string;
  /** 공연 시작일 yyyy-MM-dd */
  startDate: string;
  /** 공연 종료일 yyyy-MM-dd */
  endDate: string;
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

/** 찜한 공연의 진행 상태. 계약에 열거값으로 선언돼 있다. */
export type WishlistStatus = "UPCOMING" | "ONGOING" | "ENDED";

/**
 * GET /api/wishlists 응답 원소(찜한 공연). 공연 시작일 오름차순으로 내려온다.
 * 목록에 genre가 없어 카드의 장르 태그는 이 응답으로 채울 수 없다.
 */
export interface WishlistResponse {
  performanceId: number;
  name: string;
  posterUrl: string;
  status: WishlistStatus;
  theatreName: string;
  /** 공연 시작일 yyyy-MM-dd */
  startDate: string;
  /** 공연 종료일 yyyy-MM-dd */
  endDate: string;
}

/**
 * GET /api/wishlists 쿼리 파라미터. 둘 다 없으면 전체, month는 해당 월과
 * 겹치는 공연, date는 그 날짜가 공연 기간에 포함되는 공연이다.
 * month와 date를 함께 보내면 400이다.
 *
 * apiFetch의 QueryParams가 요구하는 암시적 인덱스 시그니처 때문에
 * interface가 아니라 type으로 둔다.
 */
export type WishlistParams = {
  /** yyyy-MM */
  month?: string;
  /** yyyy-MM-dd */
  date?: string;
};

// Provisional: based on screen spec, not the API contract.

/** 공연 진행 상태. 날짜에서 파생되지만 목업 편의를 위해 명시한다. */
export type PerformanceStatus = "upcoming" | "ongoing" | "ended";

/**
 * 홈의 카드·리스트가 공통으로 사용하는 공연 요약 정보.
 * docs/spec/home.md에 언급된 필드(제목·공연장 위치·장르·포스터)와
 * 목업 엣지 케이스(오픈런·공연 종료) 표현에 필요한 날짜/상태로 구성한다.
 */
export interface PerformanceSummary {
  id: string;
  /** 공연 제목 */
  title: string;
  /** 포스터 이미지 URL */
  posterUrl: string;
  /** 장르 카테고리 */
  genre: GenreCategory;
  /** 공연장 위치 */
  venue: string;
  /** 공연 시작일 (ISO 8601) */
  startDate: string;
  /** 공연 종료일 (ISO 8601). 오픈런이면 null */
  endDate: string | null;
  status: PerformanceStatus;
  /** 좋아요(찜) 수. 인기 순위 산정 기준. */
  likeCount: number;
}

/** 주목받는 공연 (홈 상단 배너 1개) */
export type FeaturedPerformance = PerformanceSummary;

/** 인기 공연 순위 항목 */
export interface RankedPerformance extends PerformanceSummary {
  /** 1부터 시작하는 순위 */
  rank: number;
}
