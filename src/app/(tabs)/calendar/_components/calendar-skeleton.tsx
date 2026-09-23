import { Skeleton } from "@/shared/components/ui/skeleton";

/** 스켈레톤 그리드의 주/일 수. Figma 스켈레톤(4주 × 7일)을 따른다. */
const WEEKS = 4;
const DAYS = 7;

/**
 * 캘린더 로딩 스켈레톤(그리드 영역). 제목 바와 요일 헤더는 실제 UI가 그대로
 * 노출되고, 데이터가 채워지는 달력 그리드 자리에만 스켈레톤 카드를 보여준다.
 */
export function CalendarSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="달력 불러오는 중"
      className="flex flex-col gap-4"
    >
      {Array.from({ length: WEEKS }).map((_, week) => (
        <div key={week} className="flex gap-1">
          {Array.from({ length: DAYS }).map((__, day) => (
            <Skeleton
              key={day}
              aria-hidden
              className="h-[86px] flex-1 rounded-[2px]"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
