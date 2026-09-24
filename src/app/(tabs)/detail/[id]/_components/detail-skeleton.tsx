import { Skeleton } from "@/shared/components/ui/skeleton";

/**
 * 디테일 진입 시 데이터 로드 동안 노출하는 스켈레톤. 실제 콘텐츠와 같은 여백으로
 * 제목·포스터·상세 보기 버튼·공연 정보 자리를 잡는다. 하단 CTA는 자리만 맞춘
 * 정적 플레이스홀더로 둔다.
 */
export function DetailSkeleton() {
  return (
    <>
      <main
        aria-busy="true"
        aria-label="공연 정보를 불러오는 중"
        className="flex flex-col gap-5 px-[15px] pt-2 pb-[calc(3.5rem+18px+env(safe-area-inset-bottom)+1.5rem)]"
      >
        {/* 제목·주소·태그 */}
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-5.5 w-3/5" aria-hidden />
          <Skeleton className="h-4 w-2/5" aria-hidden />
          <Skeleton className="h-5 w-16 rounded-full" aria-hidden />
        </div>

        {/* 포스터 */}
        <Skeleton
          className="aspect-[345/300] w-full rounded-[15px]"
          aria-hidden
        />

        {/* 상세 보기 버튼 */}
        <Skeleton className="h-11 w-full rounded-md" aria-hidden />

        {/* 공연 정보 */}
        <div className="flex flex-col gap-4">
          <Skeleton className="h-6 w-20" aria-hidden />
          <Skeleton className="h-4 w-3/5" aria-hidden />
          <Skeleton className="h-4 w-3/5" aria-hidden />
        </div>
      </main>

      {/* 하단 CTA 자리(비활성 플레이스홀더). 라이브 CTA와 동일한 여백으로 맞춰 로드 시 위치가 흔들리지 않게 한다. */}
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-app gap-3 bg-[#121212] px-[15px] pb-[calc(18px+env(safe-area-inset-bottom))]">
        <Skeleton className="size-14 rounded-md" aria-hidden />
        <Skeleton className="h-14 flex-1 rounded-md" aria-hidden />
      </div>
    </>
  );
}
