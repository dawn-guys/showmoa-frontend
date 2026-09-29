"use client";

import { Skeleton } from "@/shared/components/ui/skeleton";
import { usePopularRanking } from "../_hooks/usePopularRanking";
import { PopularRankingItem } from "./popular-ranking-item";

/**
 * 인기 공연 순위 섹션(로그인·비로그인 공용). 찜 많은 순 상위 5개를 순위와
 * 함께 리스트로 보여주고, 행을 누르면 상세로 이동한다.
 *
 * 조회에 실패하거나 순위에 올릴 공연이 없으면 섹션을 통째로 감춘다.
 * docs/spec/home.md에 이 섹션의 에러·빈 상태 문구가 없어 문구를 지어내지 않는다.
 */
export function PopularRankingSection() {
  const { data, isPending } = usePopularRanking();

  if (isPending) {
    return (
      <section
        aria-label="인기 있는 공연 순위"
        aria-busy
        className="flex flex-col gap-[30px] px-4"
      >
        {/* 제목 자리까지 포함해 로드 후와 높이를 맞춘다 */}
        <Skeleton className="h-7 w-44 rounded-md" aria-hidden />
        <ul className="flex flex-col gap-5" aria-hidden>
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-center gap-4">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="h-4 flex-1 rounded-md" />
              <Skeleton className="size-11 rounded-md" />
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <section
      aria-labelledby="popular-ranking-heading"
      className="flex flex-col gap-[30px] px-4"
    >
      <h2 id="popular-ranking-heading" className="text-h1 text-foreground">
        인기 있는 공연 순위
      </h2>
      <ul className="flex flex-col gap-5">
        {data.map((performance, index) => (
          <PopularRankingItem
            key={performance.id}
            performance={performance}
            rank={index + 1}
          />
        ))}
      </ul>
    </section>
  );
}
