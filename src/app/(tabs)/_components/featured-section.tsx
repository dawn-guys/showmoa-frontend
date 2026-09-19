"use client";

import { Skeleton } from "@/shared/components/ui/skeleton";
import { useFeaturedPerformance } from "../_hooks/useFeaturedPerformance";

/**
 * 주목받는 공연 섹션(자리표시자).
 * TODO: 제목·공연장 위치·장르·포스터 UI 구현, 클릭 시 /detail/:id 이동.
 */
export function FeaturedSection() {
  const { data, isLoading } = useFeaturedPerformance();

  return (
    <section aria-label="주목받는 공연" aria-busy={isLoading} className="px-4">
      {isLoading ? (
        <Skeleton className="aspect-square w-full rounded-xl" aria-hidden />
      ) : (
        <div className="rounded-xl border border-border p-4 text-body3 text-muted-foreground">
          [주목받는 공연] {data?.title}
        </div>
      )}
    </section>
  );
}
