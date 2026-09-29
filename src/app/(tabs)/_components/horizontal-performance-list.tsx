import { PerformanceCard } from "@/shared/components/performance-card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { WishlistItemResponse } from "@/app/(tabs)/wishlist/_types";
import { getWishlistStatusLabel } from "../_lib/performance-status";

/**
 * 좋아요(찜 목록)와 오늘 나의 공연(찜 캘린더)이 함께 쓰는 카드 항목.
 * 캘린더 응답(WishlistCalendarResponse)에는 genre·status가 없어 선택 필드로 둔다.
 */
type HorizontalPerformanceListItem = Pick<
  WishlistItemResponse,
  "performanceId" | "name" | "posterUrl"
> &
  Partial<Pick<WishlistItemResponse, "genre" | "status" | "startDate">>;

interface HorizontalPerformanceListProps {
  items: HorizontalPerformanceListItem[];
  /** 스크린리더용 목록 이름 */
  label: string;
}

/** 진행 상태 뱃지 문구. status가 없는 캘린더 항목은 뱃지를 숨긴다. */
function toStatusLabel(item: HorizontalPerformanceListItem) {
  if (!item.status || !item.startDate) return undefined;

  return getWishlistStatusLabel({
    status: item.status,
    startDate: item.startDate,
  });
}

// 가로 스크롤 컨테이너. 카드가 화면 폭을 넘으면 스와이프로 넘긴다.
// 왼쪽 패딩(px-4)으로 iOS 뒤로가기 스와이프와 충돌하지 않게 한다.
// scroll-pl-4: snap-mandatory가 로드 시 첫 카드를 스냅 정렬하며 왼쪽 패딩을
// 밀어내는 문제를 막는다(스냅포트 시작선을 패딩 안쪽으로 당겨 정렬).
const scrollerClassName =
  "flex gap-[15px] overflow-x-auto px-4 pb-1 snap-x snap-mandatory scroll-pl-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

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
        <li key={performance.performanceId} className={cardItemClassName}>
          <PerformanceCard
            id={performance.performanceId}
            title={performance.name}
            posterUrl={performance.posterUrl}
            genre={performance.genre ?? undefined}
            statusLabel={toStatusLabel(performance)}
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
