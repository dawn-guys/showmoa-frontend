"use client";

import { useAuth } from "@/shared/hooks/useAuth";
import { FeaturedSection } from "./featured-section";
import { PopularRankingSection } from "./popular-ranking-section";
import { CategorySection } from "./category-section";
import { LikedSection } from "./liked-section";
import { TodaySection } from "./today-section";

/**
 * 홈 섹션 구성. 로그인 여부(useAuth → src/shared/mocks/auth.ts 스위치)에 따라
 * 좋아요·오늘의 공연 섹션을 추가로 노출한다.
 */
export function HomeSections() {
  const { isLoggedIn } = useAuth();

  return (
    <div className="flex flex-col gap-8 py-4">
      <FeaturedSection />
      <PopularRankingSection />
      <CategorySection />
      {isLoggedIn && (
        <>
          <LikedSection />
          <TodaySection />
        </>
      )}
    </div>
  );
}
