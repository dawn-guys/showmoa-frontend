import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import type { WishlistParams, WishlistResponse } from "@/app/(tabs)/_types";
import { apiFetch } from "@/shared/lib/api";

/**
 * 오늘 공연 중인(공연 기간에 오늘이 포함되는) 찜한 공연 목록을 조회한다.
 *
 * date는 사용자 타임존 기준 yyyy-MM-dd다. toISOString()은 UTC로 바꿔서
 * 자정 전후에 하루가 밀리므로 쓰지 않고, 로컬 시각을 그대로 포맷한다.
 */
export function useTodayPerformances() {
  const today = format(new Date(), "yyyy-MM-dd");

  return useQuery({
    queryKey: ["wishlists", "date", today],
    queryFn: ({ signal }) => {
      const searchParams: WishlistParams = { date: today };

      return apiFetch<WishlistResponse[]>("/api/wishlists", {
        searchParams,
        signal,
      });
    },
  });
}
