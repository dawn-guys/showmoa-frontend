"use client";

import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { useAuth } from "@/shared/hooks/useAuth";
import { WishlistGuest } from "./wishlist-guest";
import { WishlistLikedView } from "./wishlist-liked-view";

/**
 * 찜 페이지 본문. 로그인 여부(useAuth)에 따라 로그인 유도 화면과
 * 좋아요한 공연 목록을 분기한다. 세션 확인 중에는 스피너를 보여준다.
 */
export function WishlistView() {
  const { isLoggedIn, isLoading } = useAuth();

  // 비로그인·세션 확인 중에는 목록을 넓게 쓰지 않으므로 화면 중앙 정렬한다.
  if (isLoading || !isLoggedIn) {
    return (
      <div className="flex min-h-[calc(100dvh-5rem-var(--spacing-bottom-nav))] flex-col items-center justify-center">
        {isLoading ? <LoadingSpinner /> : <WishlistGuest />}
      </div>
    );
  }

  return <WishlistLikedView />;
}
