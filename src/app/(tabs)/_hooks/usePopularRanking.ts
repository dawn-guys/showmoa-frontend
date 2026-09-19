import { useQuery } from "@tanstack/react-query";
import { MOCK_POPULAR_RANKING } from "@/shared/mocks/home";

/** 인기 공연 순위 목록을 조회한다. */
export function usePopularRanking() {
  return useQuery({
    queryKey: ["home", "popular-ranking"],
    // MOCK: Phase 2에서 queryFn를 실제 인기 순위 요청으로 교체한다.
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return MOCK_POPULAR_RANKING;
    },
  });
}
