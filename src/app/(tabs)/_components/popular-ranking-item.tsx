import Image from "next/image";
import Link from "next/link";
import type { RankedPerformance } from "../_types";

/**
 * 인기 순위 한 행: 순위 뱃지 + 제목 + 우측 썸네일. 누르면 상세로 이동한다.
 * <ul> 안에서 사용한다.
 */
export function PopularRankingItem({
  performance,
}: {
  performance: RankedPerformance;
}) {
  return (
    <li>
      <Link
        href={`/detail/${performance.id}`}
        aria-label={`${performance.rank}위 ${performance.title}`}
        className="flex items-center gap-4 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span
          aria-hidden
          className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-foreground"
        >
          {performance.rank}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
          {performance.title}
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
