import { useQuery } from "@tanstack/react-query";
import type { AreaResponse } from "@/app/(tabs)/_types";
import { apiFetch } from "@/shared/lib/api";

/**
 * 지역 필터 드로워에 쓸 시/도 · 구/군 목록을 조회한다(인증 불필요).
 * 실제 공연이 있는 지역만 내려오고, 이 값을 검색의 areas/districts에 그대로 쓴다.
 *
 * @param enabled 드로워가 열릴 때만 조회하도록 여닫힘 상태를 넘긴다.
 */
export function useAreas(enabled: boolean) {
  return useQuery({
    queryKey: ["search", "areas"],
    queryFn: ({ signal }) =>
      apiFetch<AreaResponse[]>("/api/performances/areas", { signal }),
    enabled,
  });
}
