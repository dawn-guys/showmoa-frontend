"use client";

import { format } from "date-fns";
import { cn } from "cn";
import type { WishlistCalendarResponse } from "../_types";
import { getPerformanceColor } from "../_lib/calendar";

interface CalendarDayCellProps {
  date: Date;
  /** 표시 중인 달에 속한 날짜인지. false면 흐리게 처리하고 누를 수 없다. */
  isCurrentMonth: boolean;
  /** 선택된 날짜인지. 날짜 숫자를 주조색으로 강조한다. */
  isSelected: boolean;
  /** 이 날짜에 열리는 공연 목록 */
  performances: WishlistCalendarResponse[];
  /** 셀을 눌렀을 때(당월 날짜만). 해당 날짜의 공연 바텀 시트를 연다. */
  onSelect: (date: Date) => void;
}

/** 공연 칩. 좌측 2px 보더에 공연 고유 색상을 입히고 제목을 말줄임한다. */
function PerformanceChip({
  performance,
}: {
  performance: WishlistCalendarResponse;
}) {
  return (
    <span
      className="flex h-4 shrink-0 items-center border-l-2 pl-1"
      style={{ borderColor: getPerformanceColor(performance.performanceId) }}
    >
      {/* 색상은 보조 수단이므로 제목 텍스트는 항상 읽히게 두고, 잘린 제목의
          전체값은 title 속성으로 보조기기에 전달한다. */}
      <span
        className="truncate text-body4 text-foreground"
        title={performance.name}
      >
        {performance.name}
      </span>
    </span>
  );
}

/** 달력 카드 내용(공연 칩 목록). 당월/비당월 공통 레이아웃. */
function DayCard({
  performances,
  dimmed,
}: {
  performances: WishlistCalendarResponse[];
  dimmed?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex h-[86px] w-full flex-col gap-0.5 overflow-hidden rounded-[3px] bg-[#242424] p-0.5",
        dimmed && "opacity-50",
      )}
    >
      {/* 칩을 모두 렌더하고, 카드 높이를 넘치면 overflow-hidden으로 잘라 숨긴다. */}
      {!dimmed &&
        performances.map((p) => (
          <PerformanceChip key={p.performanceId} performance={p} />
        ))}
    </span>
  );
}

/**
 * 월간 달력의 하루 셀. 당월 날짜는 버튼으로, 다른 달 날짜는 흐린 비활성
 * 표시로 렌더한다. 카드 안에 공연 칩을, 아래에 날짜 숫자를 보여준다.
 */
export function CalendarDayCell({
  date,
  isCurrentMonth,
  isSelected,
  performances,
  onSelect,
}: CalendarDayCellProps) {
  const dayNumber = date.getDate();

  // 다른 달 날짜: 흐리게, 누를 수 없음.
  if (!isCurrentMonth) {
    return (
      <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5 px-0.5">
        <span className="flex h-5.5 w-max items-center justify-center text-body2 font-semibold text-[#6b6b6b]">
          {dayNumber}
        </span>
        <DayCard performances={performances} dimmed />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(date)}
      aria-label={`${format(date, "M월 d일")}, 공연 ${performances.length}건`}
      // 선택 상태를 색만으로 전달하지 않도록 보조기기에도 알린다.
      aria-current={isSelected ? "date" : undefined}
      className="flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-[2px] px-0.5 outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring active:opacity-80"
    >
      <span
        className={cn(
          "flex h-5.5 w-max items-center justify-center text-body2 font-semibold",
          isSelected ? "text-primary" : "text-[#bfbfbf]",
        )}
      >
        {dayNumber}
      </span>
      <DayCard performances={performances} />
    </button>
  );
}
