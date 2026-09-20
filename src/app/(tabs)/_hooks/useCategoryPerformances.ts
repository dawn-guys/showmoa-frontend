import { useQuery } from "@tanstack/react-query";
import { MOCK_CATEGORY_PERFORMANCES } from "@/shared/mocks/home";

/**
 * 카테고리별 공연 전체를 조회한다. 장르 필터링은 nuqs 상태를 읽는
 * 섹션 컴포넌트에서 클라이언트 측으로 처리한다(탭 전환 시 재조회 없음).
 */
export function useCategoryPerformances() {
  return useQuery({
    queryKey: ["home", "category-performances"],
    // MOCK: Phase 2에서 queryFn를 실제 카테고리 공연 요청으로 교체한다.
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return MOCK_CATEGORY_PERFORMANCES;
    },
  });
}
