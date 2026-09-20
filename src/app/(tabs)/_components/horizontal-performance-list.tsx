import { PerformanceCard } from "@/shared/components/performance-card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { PerformanceSummary } from "../_types";
import { getPerformanceStatusLabel } from "../_lib/performance-status";

interface HorizontalPerformanceListProps {
  items: PerformanceSummary[];
  /** 스크린리더용 목록 이름 */
  label: string;
}

// 가로 스크롤 컨테이너. 카드가 화면 폭을 넘으면 스와이프로 넘긴다.
// 왼쪽 패딩(px-4)으로 iOS 뒤로가기 스와이프와 충돌하지 않게 한다.
const scrollerClassName =
  "flex gap-[15px] overflow-x-auto px-4 pb-1 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

/** 카드 폭(144px). Figma 좋아요/오늘 카드 기준. */
const cardItemClassName = "w-36 shrink-0 snap-start";

/** 좋아요/오늘 공연 등에서 쓰는 가로 슬라이드 카드 목록. */
export function HorizontalPerformanceList({
  items,
  label,
}: HorizontalPerformanceListProps) {
  return (
    <ul aria-label={label} className={scrollerClassName}>
      {items.map((performance) => (
        <li key={performance.id} className={cardItemClassName}>
          <PerformanceCard
            id={performance.id}
            title={performance.title}
            genre={performance.genre}
            posterUrl={performance.posterUrl}
            statusLabel={getPerformanceStatusLabel(performance)}
          />
        </li>
      ))}
    </ul>
  );
}

/** 가로 슬라이드 카드 목록 스켈레톤. */
export function HorizontalPerformanceListSkeleton({
  count = 3,
}: {
  count?: number;
}) {
  return (
    <div className={scrollerClassName} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cardItemClassName}>
          <div className="flex flex-col gap-2.5">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <Skeleton className="h-4 w-4/5 rounded-md" />
            <Skeleton className="h-5 w-10 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
