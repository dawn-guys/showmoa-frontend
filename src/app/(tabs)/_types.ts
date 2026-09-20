// Provisional: based on screen spec, not the API contract.
import type { GenreCategory } from "@/shared/constants/genre";

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
}

/** 주목받는 공연 (홈 상단 배너 1개) */
export type FeaturedPerformance = PerformanceSummary;

/** 인기 공연 순위 항목 */
export interface RankedPerformance extends PerformanceSummary {
  /** 1부터 시작하는 순위 */
  rank: number;
}
