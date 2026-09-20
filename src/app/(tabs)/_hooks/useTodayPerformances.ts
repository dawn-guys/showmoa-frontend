import { useQuery } from "@tanstack/react-query";
import { MOCK_TODAY_EMPTY, MOCK_TODAY_PERFORMANCES } from "@/shared/mocks/home";

/** 캘린더에 저장한 오늘의 공연 목록을 조회한다(빈 목록 가능). */
export function useTodayPerformances() {
  return useQuery({
    queryKey: ["home", "today"],
    // MOCK: Phase 2에서 queryFn를 실제 오늘 일정 요청으로 교체한다.
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return MOCK_TODAY_EMPTY ? [] : MOCK_TODAY_PERFORMANCES;
    },
  });
}
