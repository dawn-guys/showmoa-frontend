import Image from "next/image";
import Link from "next/link";
import type { PerformanceListResponse } from "../_types";

interface PopularRankingItemProps {
  performance: PerformanceListResponse;
  /** 1부터 시작하는 순위. 응답에 순위 필드가 없어 목록 순서로 매긴다. */
  rank: number;
}

/**
 * 인기 순위 한 행: 순위 뱃지 + 제목 + 우측 썸네일. 누르면 상세로 이동한다.
 * <ul> 안에서 사용한다.
 */
export function PopularRankingItem({
  performance,
  rank,
}: PopularRankingItemProps) {
  return (
    <li>
      <Link
        href={`/detail/${performance.id}`}
        aria-label={`${rank}위 ${performance.name}`}
        className="flex items-center gap-4 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span
          aria-hidden
          className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-foreground"
        >
          {rank}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
          {performance.name}
        </span>
        <span className="relative size-11 shrink-0 overflow-hidden rounded-md bg-muted">
          <Image
            src={performance.posterUrl}
            alt=""
            fill
            sizes="44px"
            className="object-cover"
          />
        </span>
      </Link>
    </li>
  );
}
