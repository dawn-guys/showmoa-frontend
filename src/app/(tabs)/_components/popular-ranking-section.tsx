"use client";

import { Skeleton } from "@/shared/components/ui/skeleton";
import { usePopularRanking } from "../_hooks/usePopularRanking";
import { PopularRankingItem } from "./popular-ranking-item";

/**
 * 인기 공연 순위 섹션(로그인·비로그인 공용). 좋아요 많은 순 상위 5개를
 * 순위와 함께 리스트로 보여주고, 행을 누르면 상세로 이동한다.
 */
export function PopularRankingSection() {
  const { data, isLoading } = usePopularRanking();

  return (
    <section
      aria-labelledby="popular-ranking-heading"
      aria-busy={isLoading}
      className="flex flex-col gap-[30px] px-4"
    >
      <h2 id="popular-ranking-heading" className="text-h1 text-foreground">
        인기 있는 공연 순위
      </h2>
      {isLoading ? (
        <ul className="flex flex-col gap-5" aria-hidden>
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-center gap-4">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="h-4 flex-1 rounded-md" />
              <Skeleton className="size-11 rounded-md" />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="flex flex-col gap-5">
          {data?.map((performance) => (
            <PopularRankingItem
              key={performance.id}
              performance={performance}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
