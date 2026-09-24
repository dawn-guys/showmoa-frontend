import { useQuery } from "@tanstack/react-query";
import { getMockPerformanceDetail } from "@/shared/mocks/detail";

/** id에 해당하는 공연 상세 정보를 조회한다. 로딩 중에는 스켈레톤을 노출한다. */
export function usePerformanceDetail(id: string) {
  return useQuery({
    queryKey: ["detail", id],
    // MOCK: Phase 2에서 queryFn를 실제 공연 상세 요청으로 교체한다.
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return getMockPerformanceDetail(id);
    },
  });
}
