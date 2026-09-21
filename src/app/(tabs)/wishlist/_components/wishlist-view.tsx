"use client";

import { useAuth } from "@/shared/hooks/useAuth";
import { WishlistGuest } from "./wishlist-guest";
import { WishlistLikedView } from "./wishlist-liked-view";

/**
 * 찜 페이지 본문. 로그인 여부(useAuth)에 따라 로그인 유도 화면과
 * 좋아요한 공연 목록을 분기한다. 세션 확인 중에는 별도 스피너 없이
 * 목록의 스켈레톤이 로딩 UI를 대신한다.
 */
export function WishlistView() {
  const { isLoggedIn, isLoading } = useAuth();

  // 세션 확인이 끝난 뒤 비로그인이면 로그인 유도 화면(중앙 정렬).
  if (!isLoading && !isLoggedIn) {
    return (
      <div className="flex min-h-[calc(100dvh-5rem-var(--spacing-bottom-nav))] flex-col items-center justify-center">
        <WishlistGuest />
      </div>
    );
  }

  // 세션 확인 중이거나 로그인 상태면 목록을 보여준다(로딩 중엔 스켈레톤).
  return <WishlistLikedView />;
}
