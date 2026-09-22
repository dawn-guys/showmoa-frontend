import { Skeleton } from "@/shared/components/ui/skeleton";

/**
 * 지도 로딩 스켈레톤. 지도 영역은 중앙의 주조색 펄스로, 바텀 시트는
 * 제목 바 + 공연 항목 플레이스홀더로 표현한다. 검색창은 실제 UI가
 * 위에 그대로 노출되므로 여기서는 다루지 않는다.
 */
export function MapSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="지도를 불러오는 중"
      className="absolute inset-0"
    >
      {/* 지도 로딩 표시: 중앙 주조색 펄스 점 */}
      <span
        aria-hidden
        className="absolute top-1/2 left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
      >
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/40" />
        <span className="relative inline-flex size-4 rounded-full bg-primary" />
      </span>

      {/* 바텀 시트 스켈레톤 */}
      <div className="absolute inset-x-0 bottom-[calc(var(--spacing-bottom-nav)+env(safe-area-inset-bottom))] mx-auto flex h-[138px] max-w-app flex-col gap-4 rounded-t-2xl bg-card px-4 pt-2.5">
        {/* 드래그 핸들 */}
        <span aria-hidden className="mx-auto h-1 w-9 rounded-full bg-primary" />
        <Skeleton className="h-5 w-40" aria-hidden />
        <div className="flex items-center gap-3">
          <Skeleton className="size-[50px] rounded-lg" aria-hidden />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-3/5" aria-hidden />
            <Skeleton className="h-3 w-2/5" aria-hidden />
          </div>
        </div>
      </div>
    </div>
  );
}
