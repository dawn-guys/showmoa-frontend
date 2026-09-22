import type { PerformanceSummary } from "@/app/(tabs)/_types";
import type { GenreFilterOption } from "@/shared/constants/genre";

/** 검색어·필터로 공연 목록을 좁힌다. */
interface SearchOptions {
  /** 장르 필터. "전체"거나 비어 있으면 장르로 거르지 않는다. */
  genre?: GenreFilterOption;
}

/**
 * 검색어가 제목에 포함되는 공연만 남긴다(앞뒤 공백 제거·대소문자 무시).
 * 검색어가 비어 있으면 결과가 없는 것으로 본다. 장르 필터가 있으면 함께 좁힌다.
 */
export function searchPerformances(
  performances: PerformanceSummary[],
  query: string,
  { genre }: SearchOptions = {},
): PerformanceSummary[] {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return [];

  return performances.filter((performance) => {
    if (genre && genre !== "전체" && performance.genre !== genre) return false;
    return performance.title.toLowerCase().includes(keyword);
  });
}
