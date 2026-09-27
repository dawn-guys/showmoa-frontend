"use client";

import { useMutation } from "@tanstack/react-query";
import type {
  TheatreSearchParams,
  TheatreSearchResponse,
} from "@/app/(tabs)/map/_types";
import { apiFetch } from "@/shared/lib/api";

/**
 * 극장·공연명·지역 통합 검색. 돋보기/Enter로 한 번씩 실행되는 명령형 동작이라
 * useQuery가 아니라 useMutation을 쓴다. 조회지만 결과를 화면에 목록으로 그리는
 * 게 아니라 지도를 옮기는 데 쓰므로, 제출 핸들러에서 결과를 그대로 받아 처리하는
 * 편이 맞다(useQuery로 두면 결과에 반응하려 effect에서 setState를 해야 한다).
 *
 * isPending이 검색창 스피너를 구동한다.
 */
export function useTheatreSearch() {
  const search = useMutation({
    mutationFn: (searchParams: TheatreSearchParams) =>
      apiFetch<TheatreSearchResponse>("/api/theatres/search", { searchParams }),
  });

  return { searchTheatres: search.mutateAsync, isSearching: search.isPending };
}
