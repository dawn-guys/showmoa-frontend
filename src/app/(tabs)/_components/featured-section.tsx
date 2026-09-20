"use client";

import Link from "next/link";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useFeaturedPerformance } from "../_hooks/useFeaturedPerformance";
import { FeaturedPoster } from "./featured-poster";

/**
 * 주목받는 공연 섹션(로그인·비로그인 공용). 공연 1개를 노출하며,
 * 제목과 포스터를 누르면 상세로 이동한다. 로딩 중에는 스켈레톤을 보여준다.
 */
export function FeaturedSection() {
  const { data, isLoading } = useFeaturedPerformance();

  if (isLoading || !data) {
    return (
      <section aria-label="주목받는 공연" aria-busy className="px-4">
        {/* 정보(제목·위치·장르) + 포스터 순서/간격을 로드 후와 맞춘다 */}
        <div className="flex flex-col gap-[30px]" aria-hidden>
          <div className="flex flex-col gap-2.5">
            <Skeleton className="h-[22px] w-3/4 rounded-md" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
          <Skeleton className="aspect-[345/300] w-full rounded-[15px]" />
        </div>
      </section>
    );
  }

  const detailHref = `/detail/${data.id}`;

  return (
    <section aria-label="주목받는 공연" className="px-4">
      <div className="flex flex-col gap-[30px]">
        <div className="flex flex-col gap-2.5">
          <Link
            href={detailHref}
            className="w-fit rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <h2 className="line-clamp-2 text-body2 font-medium text-foreground">
              {data.title}
            </h2>
          </Link>
          <p className="text-body3 font-light text-muted-foreground">
            {data.venue}
          </p>
          <Badge variant="secondary" className="w-fit bg-[#313131]">
            {data.genre}
          </Badge>
        </div>

        <Link
          href={detailHref}
          className="block rounded-[15px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <FeaturedPoster src={data.posterUrl} alt={`${data.title} 포스터`} />
        </Link>
      </div>
    </section>
  );
}
