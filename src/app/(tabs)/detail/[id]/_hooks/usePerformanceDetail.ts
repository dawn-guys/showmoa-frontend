import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/shared/lib/api";
import type { PerformanceResponse } from "@/app/(tabs)/_types";

/**
 * id에 해당하는 공연 상세 정보를 조회한다(GET /api/performances/{id}).
 * 인증은 선택이며, 비로그인이면 isWished가 항상 false로 내려온다.
 * 로딩 중에는 상위에서 스켈레톤을 노출한다.
 */
export function usePerformanceDetail(id: string) {
  return useQuery({
    queryKey: ["detail", id],
    queryFn: () => apiFetch<PerformanceResponse>(`/api/performances/${id}`),
  });
}
