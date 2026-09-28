import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/shared/hooks/useAuth";
import { apiFetch } from "@/shared/lib/api";
import type { WishlistCalendarResponse } from "../_types";

/**
 * GET /api/wishlists/calendar 로 해당 월의 찜 공연을 조회한다.
 *
 * 공연 기간이 그 달에 걸치는 항목 전체가 페이징 없이 한 번에 내려오고,
 * 날짜별 그룹핑은 클라이언트(_lib/calendar)가 한다. 하루치만 받는 파라미터는
 * 계약에 없다(date는 어디에도 없고 month만 받는다).
 *
 * 인증이 필요한 조회라 비로그인 상태에서는 요청하지 않는다.
 *
 * @param month 조회할 달(yyyy-MM). 형식이 어긋나면 서버가 400을 준다.
 */
export function useCalendar(month: string) {
  const { isLoggedIn, isLoading: isSessionLoading } = useAuth();

  const query = useQuery({
    // 월이 키에 들어가 달을 바꾸면 그 달로 다시 조회한다. 찜 해제 후의
    // 무효화는 ["calendar"] 프리픽스로 걸려 이 키까지 함께 갱신된다.
    queryKey: ["calendar", month],
    queryFn: ({ signal }) =>
      apiFetch<WishlistCalendarResponse[]>("/api/wishlists/calendar", {
        searchParams: { month },
        signal,
      }),
    enabled: isLoggedIn,
  });

  // 쿼리 객체를 통째로 펼치면 모든 변화를 구독해 불필요한 리렌더가 생긴다
  // (@tanstack/query/no-rest-destructuring). 화면이 쓰는 값만 골라 돌려준다.
  return {
    data: query.data,
    // 세션 확인 중에는 쿼리가 꺼져 있어 isLoading이 false다. 그대로 두면 빈
    // 달력이 잠깐 보이므로, 확인이 끝날 때까지 로딩(스켈레톤)으로 본다.
    isLoading: isSessionLoading || query.isLoading,
    isError: query.isError,
  };
}
