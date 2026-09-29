import Image from "next/image";
import Link from "next/link";
import type { PerformanceListResponse } from "@/app/(tabs)/_types";
import { getCategoryCaption } from "../_lib/performance-status";

/**
 * 카테고리 카드: 포스터 + 제목 + 하단 문구(공연 중 / N월 N일 오픈).
 * 누르면 상세로 이동한다. 폭은 배치되는 그리드가 결정한다.
 */
export function CategoryCard({
  performance,
}: {
  performance: PerformanceListResponse;
}) {
  return (
    <Link
      href={`/detail/${performance.id}`}
      className="flex flex-col gap-2 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
        {performance.posterUrl && (
          <Image
            src={performance.posterUrl}
            alt=""
            fill
            sizes="91px"
            className="object-cover"
          />
        )}
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="truncate text-sm font-medium text-foreground">
          {performance.name}
        </h3>
        <p className="truncate text-xs text-muted-foreground">
          {getCategoryCaption(performance)}
        </p>
      </div>
    </Link>
  );
}
