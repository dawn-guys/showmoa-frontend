import { useQuery } from "@tanstack/react-query";
import type {
  PagePerformanceListResponse,
  PerformanceSearchParams,
} from "@/app/(tabs)/_types";
import {
  toGenresParam,
  type GenreFilterOption,
} from "@/shared/constants/genre";
import { apiFetch } from "@/shared/lib/api";

/**
 * 카테고리 그리드(2행 가로 스크롤)에 한 번에 채우는 공연 수.
 * 슬라이딩으로 넘겨 볼 수 있을 만큼 가져온다.
 */
const PAGE_SIZE = 20;

/**
 * 선택한 장르의 공연 목록을 조회한다(로그인·비로그인 공용).
 * "전체"는 genres 파라미터를 보내지 않아 장르로 거르지 않은 전체를 받는다.
 * 정렬 기준이 스펙에 없어 sort는 보내지 않고 백엔드 기본 순서를 쓴다.
 */
export function useCategoryPerformances(genre: GenreFilterOption) {
  return useQuery({
    queryKey: ["home", "category-performances", genre],
    queryFn: ({ signal }) => {
      const searchParams: PerformanceSearchParams = {
        genres: toGenresParam(genre),
        page: 0,
        size: PAGE_SIZE,
      };

      return apiFetch<PagePerformanceListResponse>("/api/performances/search", {
        searchParams,
        signal,
      });
    },
    select: (page) => page.content,
  });
}
