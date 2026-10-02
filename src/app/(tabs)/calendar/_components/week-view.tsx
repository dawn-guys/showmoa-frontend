"use client";

import type { WishlistCalendarResponse } from "../_types";
import { getPerformancesForDay, getWeekDays } from "../_lib/calendar";
import { WeekdayHeader } from "./weekday-header";
import { CalendarPerformanceItem } from "./calendar-performance-item";

interface WeekViewProps {
  /** 오늘. 이번 주(월~일)를 계산하는 기준이다. */
  today: Date;
  /** 선택된 요일(이번 주 안의 날짜) */
  selectedDate: Date;
  /** 요일 선택 콜백 */
  onSelectDate: (date: Date) => void;
  /** 이 달의 찜 공연 목록. 선택한 요일의 목록은 여기서 파생한다. */
  performances: WishlistCalendarResponse[];
  /** 공휴일 날짜(yyyy-MM-dd). 공휴일에도 공연하는 공연을 거르는 데 쓴다. */
  holidayDates: ReadonlySet<string>;
  /** 하트로 공연의 찜을 해제한다. */
  onRemove: (performanceId: number) => void;
}

/**
 * 주간 달력 뷰. 이번 주 요일을 선택하면 그 날의 공연 목록을 보여준다.
 * 목록 항목은 포스터·제목·위치·기간·하트를 제공한다.
 */
export function WeekView({
  today,
  selectedDate,
  onSelectDate,
  performances,
  holidayDates,
  onRemove,
}: WeekViewProps) {
  const weekDays = getWeekDays(today);
  const dayPerformances = getPerformancesForDay(
    performances,
    selectedDate,
    holidayDates,
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <WeekdayHeader
        today={today}
        weekDays={weekDays}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
      />

      <section
        aria-label="선택한 요일의 공연 목록"
        className="flex min-h-0 flex-1 flex-col pt-5"
      >
        {dayPerformances.length === 0 ? (
          <p className="m-auto text-center text-body1 text-muted-foreground">
            이 날은 공연이 없습니다
          </p>
        ) : (
          <ul className="flex min-h-0 flex-1 [scrollbar-width:none] flex-col gap-[30px] overflow-y-auto overscroll-contain pt-1 pb-4 [&::-webkit-scrollbar]:hidden">
            {dayPerformances.map((performance) => (
              <CalendarPerformanceItem
                key={performance.performanceId}
                performance={performance}
                onRemove={() => onRemove(performance.performanceId)}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
