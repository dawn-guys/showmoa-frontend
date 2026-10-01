"use client";

import { isSameDay } from "date-fns";
import type { WishlistCalendarResponse } from "../_types";
import { buildMonthMatrix, getPerformancesForDay } from "../_lib/calendar";
import { CalendarDayCell } from "./calendar-day-cell";

interface MonthGridProps {
  /** 표시 연도 */
  year: number;
  /** 표시 월(0=1월) */
  month: number;
  /** 선택된 날짜. 이 날짜의 숫자를 주조색으로 강조한다. */
  selectedDate: Date;
  /** 이 달의 찜 공연 목록. 날짜별 목록은 셀에서 파생한다. */
  performances: WishlistCalendarResponse[];
  /** 날짜 카드 선택 콜백. 해당 날짜의 공연 바텀 시트를 연다. */
  onSelectDay: (date: Date) => void;
}

/**
 * 월간 달력 그리드. 주 단위 행으로 날짜 카드를 배치하고, 화면을 넘치면
 * 세로 스크롤(스크롤바 숨김)로 볼 수 있게 한다.
 */
export function MonthGrid({
  year,
  month,
  selectedDate,
  performances,
  onSelectDay,
}: MonthGridProps) {
  const weeks = buildMonthMatrix(year, month);

  return (
    <div
      // 넘칠 경우에만 스크롤. 스크롤 UI는 숨긴다(스펙).
      className="flex min-h-0 flex-1 [scrollbar-width:none] flex-col gap-1.5 overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:hidden"
    >
      {weeks.map((week) => (
        <div key={week[0].toISOString()} className="flex shrink-0 gap-[2px]">
          {week.map((day) => (
            <CalendarDayCell
              key={day.toISOString()}
              date={day}
              isCurrentMonth={day.getMonth() === month}
              isSelected={isSameDay(day, selectedDate)}
              performances={getPerformancesForDay(performances, day)}
              onSelect={onSelectDay}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
