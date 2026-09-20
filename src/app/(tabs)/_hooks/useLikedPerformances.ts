import { useQuery } from "@tanstack/react-query";
import { MOCK_LIKED_EMPTY, MOCK_LIKED_PERFORMANCES } from "@/shared/mocks/home";

/** 로그인 사용자가 좋아요한 공연 목록을 조회한다(빈 목록 가능). */
export function useLikedPerformances() {
  return useQuery({
    queryKey: ["home", "liked"],
    // MOCK: Phase 2에서 queryFn를 실제 좋아요 목록 요청으로 교체한다.
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      if (MOCK_LIKED_EMPTY) return [];
      // 종료된 공연은 목록에 노출하지 않는다.
      return MOCK_LIKED_PERFORMANCES.filter((p) => p.status !== "ended");
    },
  });
}
