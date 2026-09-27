import { useQuery } from "@tanstack/react-query";
import type { WishlistResponse } from "@/app/(tabs)/_types";
import { apiFetch } from "@/shared/lib/api";

/**
 * 로그인 사용자가 좋아요한 공연 목록을 조회한다(빈 목록 가능).
 * 백엔드가 공연 시작일 오름차순으로 내려주므로 다시 정렬하지 않는다.
 */
export function useLikedPerformances() {
  return useQuery({
    queryKey: ["wishlists"],
    queryFn: ({ signal }) =>
      apiFetch<WishlistResponse[]>("/api/wishlists", { signal }),
  });
}
