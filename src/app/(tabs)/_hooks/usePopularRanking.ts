import { useQuery } from "@tanstack/react-query";
import { MOCK_ALL_PERFORMANCES } from "@/shared/mocks/home";
import type { RankedPerformance } from "../_types";

/** 전체 공연에서 좋아요(likeCount) 많은 순으로 상위 5개를 순위와 함께 조회한다. */
export function usePopularRanking() {
  return useQuery({
    queryKey: ["home", "popular-ranking"],
    // MOCK: Phase 2에서 queryFn를 실제 인기 순위 요청으로 교체한다.
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const ranked: RankedPerformance[] = [...MOCK_ALL_PERFORMANCES]
        .sort((a, b) => b.likeCount - a.likeCount)
        .slice(0, 5)
        .map((performance, index) => ({ ...performance, rank: index + 1 }));
      return ranked;
    },
  });
}
