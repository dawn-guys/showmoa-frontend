import { useQuery } from "@tanstack/react-query";
import type { PerformanceResponse } from "@/app/(tabs)/_types";
import { apiFetch } from "@/shared/lib/api";

/**
 * 선택된 극장의 공연 목록을 조회한다(바텀 시트 본문, 인증 불필요).
 * 모든 상태(공연예정·공연중·공연완료)의 공연이 함께 내려온다.
 *
 * @param theatreId 선택된 극장 id. 선택이 없으면 null.
 */
export function useTheatrePerformances(theatreId: number | null) {
  return useQuery({
    queryKey: ["map", "theatres", theatreId, "performances"],
    queryFn: ({ signal }) =>
      apiFetch<PerformanceResponse[]>(
        `/api/theatres/${theatreId}/performances`,
        {
          signal,
        },
      ),
    enabled: theatreId !== null,
  });
}
