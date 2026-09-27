import { useInfiniteQuery } from "@tanstack/react-query";
import type {
  PagePerformanceListResponse,
  PerformanceSearchParams,
} from "@/app/(tabs)/_types";
import {
  toGenresParam,
  type GenreFilterOption,
} from "@/shared/constants/genre";
import { parseRegionFilter } from "@/shared/constants/region";
import { apiFetch } from "@/shared/lib/api";

/** 한 번에 불러오는 검색 결과 수. 목록 끝에 닿으면 다음 페이지를 이어 붙인다. */
const PAGE_SIZE = 20;

interface UseSearchPerformancesOptions {
  /** 확정된 검색어(디바운스 후). 비어 있으면 조회하지 않는다. */
  keyword: string;
  /** 장르 필터. "전체"면 genres 파라미터를 보내지 않는다. */
  genre: GenreFilterOption;
  /** 지역 필터 한 줄 문자열. 비어 있으면 areas/districts를 보내지 않는다. */
  region: string;
}

/**
 * GET /api/performances/search 로 공연을 검색한다(무한 스크롤).
 *
 * 인증이 필요 없는 공개 조회다. 정렬은 스펙에 기준이 없어 sort를 보내지 않고
 * 백엔드 기본 순서를 그대로 쓴다.
 */
export function useSearchPerformances({
  keyword,
  genre,
  region,
}: UseSearchPerformancesOptions) {
  const trimmed = keyword.trim();

  return useInfiniteQuery({
    queryKey: ["search", "performances", { keyword: trimmed, genre, region }],
    queryFn: ({ pageParam, signal }) => {
      // region 문자열에서 파생되는 값이라 queryKey에는 region만 넣는다.
      const regionFilter = parseRegionFilter(region);

      const searchParams: PerformanceSearchParams = {
        keyword: trimmed,
        genres: toGenresParam(genre),
        // districts는 areas 없이 보내면 400이므로 항상 함께 보낸다.
        areas: regionFilter ? [regionFilter.sido] : undefined,
        districts: regionFilter?.district ? [regionFilter.district] : undefined,
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
