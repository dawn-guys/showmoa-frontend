import { useQuery } from "@tanstack/react-query";
import { MOCK_LIKED_EMPTY, MOCK_LIKED_PERFORMANCES } from "@/shared/mocks/home";

/**
 * 찜 페이지의 좋아요한 공연 목록을 조회한다.
 * 홈 섹션(useLikedPerformances)과 달리 종료된 공연도 목록에 노출한다
 * (찜 페이지는 종료 공연을 디세이블 상태로 보여준다).
 */
export function useWishlist() {
  return useQuery({
    queryKey: ["wishlist"],
    // MOCK: Phase 2에서 queryFn를 실제 좋아요 목록 요청으로 교체한다.
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      if (MOCK_LIKED_EMPTY) return [];
      return MOCK_LIKED_PERFORMANCES;
    },
  });
}
