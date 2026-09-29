import { useQuery } from "@tanstack/react-query";
import { format, isWithinInterval, parseISO, startOfDay } from "date-fns";
import type { WishlistCalendarResponse } from "@/app/(tabs)/calendar/_types";
import { apiFetch } from "@/shared/lib/api";

/**
 * 공연 기간에 오늘이 포함되는 항목만 남긴다.
 *
 * 모듈 스코프 함수라 참조가 고정되고, React Query가 결과를 메모이즈하므로
 * 매 렌더마다 다시 걸러지지 않는다. parseISO는 yyyy-MM-dd를 로컬 자정으로
 * 읽으므로 비교 기준도 로컬 자정(startOfDay)으로 맞춘다.
 */
function pickToday(
  items: WishlistCalendarResponse[],
): WishlistCalendarResponse[] {
  const today = startOfDay(new Date());

  return items.filter((item) =>
    isWithinInterval(today, {
      start: parseISO(item.startDate),
      end: parseISO(item.endDate),
    }),
  );
}

/**
 * 오늘 공연 중인(공연 기간에 오늘이 포함되는) 찜한 공연 목록을 조회한다.
 *
 * 하루치만 받는 파라미터가 계약에 없다. GET /api/wishlists는 page·size만
 * 받고 date는 어디에도 없어서, 이번 달 찜 캘린더를 받아 클라이언트에서 오늘로
 * 거른다. 달·오늘 모두 사용자 타임존 기준이다. toISOString()은 UTC로 바꿔서
 * 자정 전후에 하루가 밀리므로 쓰지 않고 로컬 시각을 그대로 포맷한다.
 *
 * 키와 요청이 캘린더 화면(useCalendar)과 같아 중복 요청이 없고,
 * useToggleWishlist의 ["calendar"] 무효화·낙관적 제거도 함께 적용된다.
 */
export function useTodayPerformances() {
  const month = format(new Date(), "yyyy-MM");

  return useQuery({
    queryKey: ["calendar", month],
    queryFn: ({ signal }) =>
      apiFetch<WishlistCalendarResponse[]>("/api/wishlists/calendar", {
        searchParams: { month },
        signal,
      }),
    select: pickToday,
  });
}
