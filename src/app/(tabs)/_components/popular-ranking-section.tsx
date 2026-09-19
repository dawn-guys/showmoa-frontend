"use client";

import { Skeleton } from "@/shared/components/ui/skeleton";
import { usePopularRanking } from "../_hooks/usePopularRanking";

/**
 * 인기 공연 순위 섹션(자리표시자).
 * TODO: 순위·제목·포스터 리스트 UI 구현, 행 클릭 시 /detail/:id 이동.
 */
export function PopularRankingSection() {
  const { data, isLoading } = usePopularRanking();

  return (
    <section
      aria-labelledby="popular-ranking-heading"
      aria-busy={isLoading}
      className="px-4"
    >
      <h2 id="popular-ranking-heading" className="mb-4 text-h1 text-foreground">
        인기 있는 공연 순위
      </h2>
      {isLoading ? (
        <div className="flex flex-col gap-4" aria-hidden>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[50px] w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border p-4 text-body3 text-muted-foreground">
          [인기 순위] {data?.length ?? 0}개
        </div>
      )}
    </section>
  );
}
