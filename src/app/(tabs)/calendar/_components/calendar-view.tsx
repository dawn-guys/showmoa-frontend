"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import { useAuth } from "@/shared/hooks/useAuth";
import { GuestGate } from "@/shared/components/guest-gate";
import type { CalendarViewMode } from "../_types";
import { getPerformancesForDay } from "../_lib/calendar";
import { useCalendar } from "../_hooks/useCalendar";
import { CalendarTitleBar } from "./calendar-title-bar";
import { WeekdayHeader } from "./weekday-header";
import { MonthGrid } from "./month-grid";
import { WeekView } from "./week-view";
import { CalendarSkeleton } from "./calendar-skeleton";
import { MonthPickerSheet } from "./month-picker-sheet";
import { DayPerformanceSheet } from "./day-performance-sheet";

/** 로그인 캘린더 본문 높이(헤더 80px + 하단 나브 제외, 그리드 내부 스크롤). */
const CONTENT_HEIGHT =
  "h-[calc(100dvh-5rem-var(--spacing-bottom-nav)-env(safe-area-inset-bottom))]";

/** 로그인 캘린더 본문. 월간/주간 전환, 월 선택, 날짜별 공연 시트를 다룬다. */
function CalendarLoggedIn() {
  const { data, isLoading } = useCalendar();

  // 오늘(마운트 시점 고정). 오늘 강조·금주 계산의 기준이다.
  const today = useMemo(() => new Date(), []);

  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  // 월 선택 휠 피커는 1~12월만 다루므로 연도는 당해년으로 고정한다.
  const year = today.getFullYear();
  const [month, setMonth] = useState(today.getMonth());
  const [selectedWeekDate, setSelectedWeekDate] = useState<Date>(today);
  // 하트로 캘린더(찜)에서 제외한 공연 id. 달력·목록에서 즉시 감춘다.
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  // 오버레이 열림 상태는 URL에 저장해 뒤로가기로 닫을 수 있게 한다.
  const [pickerOpen, setPickerOpen] = useQueryState(
    "picker",
    parseAsBoolean.withDefault(false).withOptions({ history: "push" }),
  );
  const [dayParam, setDayParam] = useQueryState(
    "day",
    parseAsString.withOptions({ history: "push" }),
  );

  const performances = useMemo(
    () => (data ?? []).filter((p) => !removedIds.has(p.id)),
    [data, removedIds],
  );

  const handleRemove = (id: string) => {
    setRemovedIds((prev) => new Set(prev).add(id));
  };

  // 제목 기준 날짜: 주간은 오늘, 월간은 당월이면 오늘 아니면 해당 월 1일.
  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();
  const referenceDate =
    viewMode === "week" || isCurrentMonth ? today : new Date(year, month, 1);
  // 예: "수요일, 9월 23일". 영어 대신 한글 형식으로 가독성을 높인다.
  const label = format(referenceDate, "EEEE, M월 d일", { locale: ko });

  const handleToggleMode = () => {
    setViewMode((mode) => (mode === "month" ? "week" : "month"));
    // 뷰를 바꾸면 열려 있던 날짜 시트는 닫는다.
    setDayParam(null);
  };

  const handleApplyMonth = (nextMonth: number) => {
    setMonth(nextMonth);
    setViewMode("month");
  };

  const selectedDay = dayParam ? parseISO(dayParam) : null;
  const selectedDayPerformances = selectedDay
    ? getPerformancesForDay(performances, selectedDay)
    : [];

  return (
    <div className={`flex flex-col gap-4 px-4 pt-2 pb-4 ${CONTENT_HEIGHT}`}>
      <h1 className="sr-only">공연 캘린더</h1>

      <CalendarTitleBar
        label={label}
        onOpenPicker={() => setPickerOpen(true)}
        toggleLabel={viewMode === "month" ? "주간" : "월간"}
        onToggle={handleToggleMode}
      />

      {isLoading ? (
        <>
          <WeekdayHeader today={today} />
          <CalendarSkeleton />
        </>
      ) : viewMode === "month" ? (
        <>
          <WeekdayHeader today={today} />
          <MonthGrid
            year={year}
            month={month}
            today={today}
            performances={performances}
            onSelectDay={(date) => setDayParam(format(date, "yyyy-MM-dd"))}
          />
        </>
      ) : (
        <WeekView
          today={today}
          selectedDate={selectedWeekDate}
          onSelectDate={setSelectedWeekDate}
          performances={performances}
          onRemove={handleRemove}
        />
      )}

      <MonthPickerSheet
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        initialMonth={month}
        onApply={handleApplyMonth}
      />
      <DayPerformanceSheet
        open={selectedDay !== null}
        onOpenChange={(open) => {
          if (!open) setDayParam(null);
        }}
        date={selectedDay}
        performances={selectedDayPerformances}
        onRemove={handleRemove}
      />
    </div>
  );
}

/**
 * 캘린더 페이지 본문. 로그인 여부(useAuth)에 따라 로그인 유도 화면과 캘린더를
 * 분기한다. 세션 확인 중에는 캘린더의 스켈레톤이 로딩 UI를 대신한다.
 */
export function CalendarView() {
  const { isLoggedIn, isLoading } = useAuth();

  if (!isLoading && !isLoggedIn) {
    return (
      <div className="flex min-h-[calc(100dvh-5rem-var(--spacing-bottom-nav))] flex-col items-center justify-center">
        <GuestGate srHeading="공연 캘린더" />
      </div>
    );
  }

  return <CalendarLoggedIn />;
}
