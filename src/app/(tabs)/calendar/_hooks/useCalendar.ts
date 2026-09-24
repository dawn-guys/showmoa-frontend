import { useQuery } from "@tanstack/react-query";
import {
  MOCK_CALENDAR_EMPTY,
  MOCK_CALENDAR_PERFORMANCES,
} from "@/shared/mocks/calendar";

/**
 * 캘린더 공연 목록을 조회한다. Phase 1에서는 전체 공연을 한 번에 받아
 * 월/주/일 단위 필터링은 클라이언트(_lib/calendar)에서 처리한다.
 * 진입 시 스켈레톤이 실제로 렌더되도록 인위적인 지연을 둔다.
 */
export function useCalendar() {
  return useQuery({
    queryKey: ["calendar"],
    // MOCK: Phase 2에서 queryFn를 실제 캘린더 공연 요청으로 교체한다.
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      if (MOCK_CALENDAR_EMPTY) return [];
      return MOCK_CALENDAR_PERFORMANCES;
    },
  });
}
