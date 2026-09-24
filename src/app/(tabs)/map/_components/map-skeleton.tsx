import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { Skeleton } from "@/shared/components/ui/skeleton";

/** 바텀 시트 위쪽(지도가 보이는) 영역의 하단 경계. 시트 높이 + 나브 + 안전영역. */
const MAP_SECTION_BOTTOM =
  "calc(var(--spacing-venue-sheet) + var(--spacing-bottom-nav) + env(safe-area-inset-bottom))";

/**
 * 지도 로딩 스켈레톤. 지도 영역은 중앙의 로딩 스피너로, 바텀 시트는
 * 실제 VenueBottomSheet와 동일한 레이아웃(핸들 + 제목 + 공연 항목)으로
 * 표현한다. 검색창은 실제 UI가 위에 그대로 노출되므로 여기서는 다루지 않는다.
 */
export function MapSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="지도를 불러오는 중"
      className="absolute inset-0"
    >
      {/* 지도 로딩 표시: 바텀 시트를 제외한 지도 영역의 가로·세로 중앙 */}
      <div
        aria-hidden
        style={{ bottom: MAP_SECTION_BOTTOM }}
        className="absolute inset-x-0 top-0 flex items-center justify-center"
      >
        <LoadingSpinner />
      </div>

      {/* 바텀 시트 스켈레톤: VenueBottomSheet와 동일한 컨테이너·간격 */}
      <div className="absolute inset-x-0 bottom-[calc(var(--spacing-bottom-nav)+env(safe-area-inset-bottom))] mx-auto flex h-venue-sheet max-w-app flex-col overflow-hidden rounded-t-[20px] bg-[#121212] shadow-[0_-4px_16px_rgba(0,0,0,0.3)]">
        {/* 드래그 핸들 */}
        <div className="flex shrink-0 items-start justify-center pt-4.25 pb-5">
          <span aria-hidden className="h-1 w-10 rounded-full bg-primary" />
        </div>

        {/* 헤더: 공연장 이름 · 공연 개수 */}
        <Skeleton className="mb-5 ml-4 h-5 w-40 shrink-0" aria-hidden />

        {/* 공연 목록 */}
        <div className="flex flex-col gap-4 px-4 pt-1">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-16 shrink-0 rounded-lg" aria-hidden />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Skeleton className="h-4 w-3/5" aria-hidden />
                <Skeleton className="h-3 w-2/5" aria-hidden />
              </div>
              <Skeleton className="size-6 shrink-0 rounded-full" aria-hidden />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
