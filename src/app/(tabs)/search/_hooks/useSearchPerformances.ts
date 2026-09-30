import { useInfiniteQuery } from "@tanstack/react-query";
import type {
  PagePerformanceListResponse,
  PerformanceSearchParams,
} from "@/app/(tabs)/_types";
import { GENRE_API_VALUES, type GenreCategory } from "@/shared/constants/genre";
import { apiFetch } from "@/shared/lib/api";

/** 한 번에 불러오는 검색 결과 수. 목록 끝에 닿으면 다음 페이지를 이어 붙인다. */
const PAGE_SIZE = 20;

interface UseSearchPerformancesOptions {
  /** 확정된 검색어(디바운스 후). 비어 있으면 조회하지 않는다. */
  keyword: string;
  /** 장르 카테고리. 빈 배열("전체")이면 genres 파라미터를 보내지 않는다. */
  genres: GenreCategory[];
  /** 시/도(원소 최대 1개). 비어 있으면 지역으로 거르지 않는다. */
  areas: string[];
  /** 고른 시/도 안의 구/군. */
  districts: string[];
}

/**
 * GET /api/performances/search 로 공연을 검색한다(무한 스크롤).
 *
 * 인증이 필요 없는 공개 조회다. 정렬은 스펙에 기준이 없어 sort를 보내지 않고
 * 백엔드 기본 순서를 그대로 쓴다.
 */
export function useSearchPerformances({
  keyword,
  genres,
  areas,
  districts,
}: UseSearchPerformancesOptions) {
  const trimmed = keyword.trim();

  return useInfiniteQuery({
    queryKey: [
      "search",
      "performances",
      { keyword: trimmed, genres, areas, districts },
    ],
    queryFn: ({ pageParam, signal }) => {
      // 빈 배열은 쿼리스트링에 아무것도 붙지 않아 "필터 없음"과 같다.
      const searchParams: PerformanceSearchParams = {
        keyword: trimmed,
        // 카테고리를 API 장르 표기로 바꾼다(클래식 → 클래식·국악).
        genres: genres.map((genre) => GENRE_API_VALUES[genre]),
        areas,
        // districts는 areas 없이 보내면 400이므로 시/도가 없으면 보내지 않는다.
        districts: areas.length > 0 ? districts : undefined,
        page: pageParam,
        size: PAGE_SIZE,
      };

      return apiFetch<PagePerformanceListResponse>("/api/performances/search", {
        searchParams,
        signal,
      });
    },
    initialPageParam: 0,
    // 마지막 페이지면 더 불러오지 않는다. 페이지 번호는 0부터다.
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
    // 검색어가 없으면 결과를 보여주지 않는 화면이라 요청도 하지 않는다.
    enabled: trimmed.length > 0,
  });
}
