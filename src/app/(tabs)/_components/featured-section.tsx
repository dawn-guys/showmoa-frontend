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
        // 정보(제목·위치·장르) + 포스터 순서/간격을 로드 후와 맞춘다
        <div className="flex flex-col gap-[30px]" aria-hidden>
          <div className="flex flex-col gap-2.5">
            <Skeleton className="h-[22px] w-3/4 rounded-md" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
          <Skeleton className="aspect-[345/300] w-full rounded-xl" />
        </div>
      ) : (
        <div className="rounded-xl border border-border p-4 text-body3 text-muted-foreground">
          [주목받는 공연] {data?.title}
        </div>
      )}
    </section>
  );
}
