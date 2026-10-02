import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import type { WishlistCalendarResponse } from "@/app/(tabs)/calendar/_types";
import { isShowDay, toDateKey } from "@/app/(tabs)/calendar/_lib/calendar";
import { useHolidayDates } from "@/shared/hooks/useHolidayDates";
import { apiFetch } from "@/shared/lib/api";

/**
 * 오늘 공연하는 찜한 공연 목록을 조회한다. 공연 기간에 오늘이 들어 있어도
 * 오늘이 공연 요일이 아니면(공휴일 공연 포함 isShowDay 기준) 빠진다.
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
  const now = new Date();
  const month = format(now, "yyyy-MM");
  const today = toDateKey(now);

  // 오늘이 공휴일인지 알아야 하므로 올해 공휴일을 함께 받는다(캘린더와 캐시 공유).
  const { holidayDates, isLoading: isHolidayLoading } = useHolidayDates([
    now.getFullYear(),
  ]);

  // 공휴일이 바뀔 때만 select 참조가 바뀌어, 매 렌더마다 다시 걸러지지 않는다.
  const pickToday = useCallback(
    (items: WishlistCalendarResponse[]) =>
      items.filter((item) => isShowDay(item, today, holidayDates)),
    [today, holidayDates],
  );

  const query = useQuery({
    queryKey: ["calendar", month],
    queryFn: ({ signal }) =>
      apiFetch<WishlistCalendarResponse[]>("/api/wishlists/calendar", {
        searchParams: { month },
        signal,
      }),
    select: pickToday,
  });

  return {
    data: query.data,
    // 공휴일은 실패해도 빈 값으로 진행하므로 로딩만 함께 기다린다.
    isLoading: query.isLoading || isHolidayLoading,
    isError: query.isError,
  };
}
