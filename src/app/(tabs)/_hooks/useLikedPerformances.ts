import { useQuery } from "@tanstack/react-query";
import type { SliceResponseWishlistItemResponse } from "@/app/(tabs)/wishlist/_types";
import { apiFetch } from "@/shared/lib/api";

/** 가로 슬라이드 한 줄에 채울 만큼만 받는다. 계약상 size는 1~50이다. */
const PAGE_SIZE = 20;

/**
 * 로그인 사용자가 좋아요한 공연 목록을 조회한다(GET /api/wishlists, 빈 목록 가능).
 *
 * 응답은 배열이 아니라 Slice(content·page·size·hasNext)라 content만 꺼내 쓴다.
 * 홈은 가로 슬라이드로 첫 페이지만 보여주므로 뒤 페이지는 읽지 않는다
 * (전체 목록은 /wishlist의 useWishlist가 무한 스크롤로 맡는다).
 * 서버 정렬(미종료 먼저 · 종료 나중 · 그룹 내 최근 찜순)을 그대로 쓴다.
 *
 * 무한 스크롤용 ["wishlist"] 키와 섞이면 useToggleWishlist의 낙관적 갱신이
 * InfiniteData로 간주하고 건드리므로, 홈 전용 키를 따로 쓴다. 홈에는 찜 버튼이
 * 없고 다른 화면에서 찜을 풀고 돌아오면 마운트 시 재조회된다.
 */
export function useLikedPerformances() {
  return useQuery({
    queryKey: ["home", "liked"],
    queryFn: ({ signal }) =>
      apiFetch<SliceResponseWishlistItemResponse>("/api/wishlists", {
        searchParams: { page: 0, size: PAGE_SIZE },
        signal,
      }),
    select: (slice) => slice.content,
  });
}
