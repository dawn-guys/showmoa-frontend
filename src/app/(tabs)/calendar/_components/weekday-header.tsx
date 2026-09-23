"use client";

import { format, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "cn";
import { WEEKDAY_LABELS } from "../_lib/calendar";

interface WeekdayHeaderProps {
  /** 오늘. 월간 뷰에서 오늘 요일 라벨을 주조색으로 강조한다. */
  today: Date;
  /**
   * 주간 뷰에서 선택 가능한 이번 주 7일. 넘기면 각 요일이 버튼이 되어
   * 해당 날짜를 선택할 수 있다. 넘기지 않으면(월간 뷰) 정적 라벨만 표시한다.
   */
  weekDays?: Date[];
  /** 주간 뷰에서 선택된 날짜 */
  selectedDate?: Date;
  /** 주간 뷰에서 요일 선택 콜백 */
  onSelectDate?: (date: Date) => void;
}

/** Mon-first 인덱스(0=월 … 6=일). */
function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/** 요일 라벨 색상. 토·일은 빨강, 그 외는 기본색. */
function weekendClass(index: number): string {
  return index >= 5 ? "text-[#d10e12]" : "text-foreground";
}

/**
 * 달력 요일 헤더(월~일). 월간 뷰에서는 정적 라벨(오늘 요일 강조), 주간 뷰에서는
 * 날짜를 선택하는 버튼 행으로 동작한다. 토·일은 빨강으로 구분한다.
 */
export function WeekdayHeader({
  today,
  weekDays,
  selectedDate,
  onSelectDate,
}: WeekdayHeaderProps) {
  const todayIndex = mondayIndex(today);

  // 주간 뷰: 각 요일이 날짜 선택 버튼.
  if (weekDays && onSelectDate) {
    return (
      <div
        role="group"
        aria-label="요일 선택"
        className="-mx-4 flex border-b-2 border-[#201F1F] px-4"
      >
        {weekDays.map((day, index) => {
          const selected = selectedDate ? isSameDay(day, selectedDate) : false;
          return (
            <button
              key={day.toISOString()}
              type="button"
              aria-pressed={selected}
              aria-label={format(day, "M월 d일 EEEE", { locale: ko })}
              onClick={() => onSelectDate(day)}
              className="flex flex-1 flex-col items-center py-[15px] outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring active:opacity-80"
            >
              <span
                className={cn(
                  "border-b-2 pb-0.5 text-body1 font-semibold",
                  selected
                    ? "border-primary text-primary"
                    : cn("border-transparent", weekendClass(index)),
                )}
              >
                {WEEKDAY_LABELS[index]}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // 월간 뷰: 정적 라벨. 오늘 요일만 주조색으로 강조.
  return (
    <div className="-mx-4 flex border-b-2 border-[#201F1F] px-4" aria-hidden>
      {WEEKDAY_LABELS.map((label, index) => (
        <span
          key={label}
          className={cn(
            "flex flex-1 items-center justify-center py-[15px] text-body1 font-semibold",
            index === todayIndex ? "text-primary" : weekendClass(index),
          )}
        >
          {label}
        </span>
      ))}
    </div>
  );
}
