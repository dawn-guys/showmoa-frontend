import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@/shared/hooks/useAuth";
import { apiFetch } from "@/shared/lib/api";
import type { SliceResponseWishlistItemResponse } from "../_types";

/** 한 번에 불러오는 찜 목록 수. 목록 끝에 닿으면 다음 페이지를 이어 붙인다. */
const PAGE_SIZE = 20;

/**
 * GET /api/wishlists 로 찜한 공연 목록을 조회한다(무한 스크롤).
 *
 * 서버가 미종료(공연 중·예정) 먼저, 종료 나중, 그룹 안에서는 최근 찜순으로
 * 내려주므로 클라이언트에서 다시 정렬하지 않는다. 홈 섹션과 달리 종료된
 * 공연도 함께 내려오고, 찜 페이지는 그 항목을 디세이블로 표시한다.
 *
 * 인증이 필요한 조회라 비로그인 상태에서는 요청하지 않는다.
 */
export function useWishlist() {
  const { isLoggedIn, isLoading: isSessionLoading } = useAuth();

  const query = useInfiniteQuery({
    queryKey: ["wishlist"],
    queryFn: ({ pageParam, signal }) =>
      apiFetch<SliceResponseWishlistItemResponse>("/api/wishlists", {
        searchParams: { page: pageParam, size: PAGE_SIZE },
        signal,
      }),
    initialPageParam: 0,
    // 다음 페이지가 없으면 더 부르지 않는다. 페이지 번호는 0부터다.
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.page + 1 : undefined,
    enabled: isLoggedIn,
  });

  // 쿼리 객체를 통째로 펼치면 모든 변화를 구독해 불필요한 리렌더가 생긴다
  // (@tanstack/query/no-rest-destructuring). 화면이 쓰는 값만 골라 돌려준다.
  return {
    data: query.data,
    // 세션 확인 중에는 쿼리가 꺼져 있어 isLoading이 false다. 그대로 두면 빈 상태
    // 문구가 잠깐 보이므로, 확인이 끝날 때까지 로딩(스켈레톤)으로 본다.
    isLoading: isSessionLoading || query.isLoading,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
  };
}
