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
      // MonthGrid와 같은 자리·간격을 차지해 로딩 후 레이아웃이 튀지 않게 한다.
      className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden"
    >
      {Array.from({ length: WEEKS }).map((_, week) => (
        <div key={week} className="flex shrink-0 gap-[2px]">
          {Array.from({ length: DAYS }).map((__, day) => (
            // CalendarDayCell과 같은 구성. 날짜 숫자 자리는 높이만 비워 두어
            // 로딩 후 행 높이가 바뀌지 않게 한다.
            <div
              key={day}
              className="flex min-w-0 flex-1 flex-col items-center gap-1.5 px-0.5"
            >
              <div className="h-5.5" />
              <Skeleton aria-hidden className="h-[86px] w-full rounded-[3px]" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
