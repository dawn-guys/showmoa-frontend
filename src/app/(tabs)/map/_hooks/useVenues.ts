import { useQuery } from "@tanstack/react-query";
import { MOCK_MAP_VENUES } from "@/shared/mocks/map";

/** 지도에 표시할 공연장 목록을 조회한다. 스켈레톤 노출을 위해 인위적 지연을 둔다. */
export function useVenues() {
  return useQuery({
    queryKey: ["map", "venues"],
    // MOCK: Phase 2에서 queryFn를 실제 공연장 목록 요청으로 교체한다.
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 700));
      return MOCK_MAP_VENUES;
    },
  });
}
