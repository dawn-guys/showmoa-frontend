import { useQuery } from "@tanstack/react-query";
import { MOCK_FEATURED_PERFORMANCE } from "@/shared/mocks/home";

/** 주목받는 공연 1개를 조회한다. */
export function useFeaturedPerformance() {
  return useQuery({
    queryKey: ["home", "featured"],
    // MOCK: Phase 2에서 queryFn를 실제 추천 공연 요청으로 교체한다.
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return MOCK_FEATURED_PERFORMANCE;
    },
  });
}
