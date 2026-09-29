import { useQuery } from "@tanstack/react-query";
import type { PerformanceListResponse } from "@/app/(tabs)/_types";
import { apiFetch } from "@/shared/lib/api";

/**
 * 인기 있는 공연 순위를 조회한다(GET /api/performances/popular).
 *
 * 찜 개수 내림차순, 동점이면 시작일이 빠른 순으로 서버가 정렬해 내려주므로
 * 클라이언트에서 다시 정렬하지 않는다. 응답에 순위 필드가 없어 배열 순서가
 * 곧 순위다(표시는 화면에서 index + 1).
 *
 * 파라미터는 없고 개수도 서버가 상위 5개로 고정한다. 종료된 공연은 빠지고,
 * 찜이 한 번도 없는 공연은 애초에 후보가 아니라 아무도 찜하지 않았으면
 * 빈 배열이 온다.
 */
export function usePopularRanking() {
  return useQuery({
    queryKey: ["home", "popular-ranking"],
    queryFn: ({ signal }) =>
      apiFetch<PerformanceListResponse[]>("/api/performances/popular", {
        signal,
      }),
  });
}
