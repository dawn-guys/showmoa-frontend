"use client";

import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { parseAsString, useQueryState } from "nuqs";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  overlayUrlOptions,
  useOverlayFlag,
} from "@/shared/hooks/useOverlayFlag";
import { GuestGate } from "@/shared/components/guest-gate";
import { AnimatedToast } from "@/shared/components/toast";
import {
  useToggleWishlist,
  WISHLIST_ERROR_MESSAGE,
} from "@/shared/hooks/useToggleWishlist";
import type { CalendarViewMode } from "../_types";
import { getPerformancesForDay, toMonthParam } from "../_lib/calendar";
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

/** 찜 해제 실패 토스트가 떠 있는 시간(ms). 찜 목록·상세와 같은 길이로 맞춘다. */
const TOAST_DURATION_MS = 2500;

/** 로그인 캘린더 본문. 월간/주간 전환, 월 선택, 날짜별 공연 시트를 다룬다. */
function CalendarLoggedIn() {
  // 오늘(마운트 시점 고정). 오늘 강조·금주 계산의 기준이다.
  const today = useMemo(() => new Date(), []);

  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  // 월 선택 휠 피커는 1~12월만 다루므로 연도는 당해년으로 고정한다.
  const year = today.getFullYear();
  const [month, setMonth] = useState(today.getMonth());
  const [selectedWeekDate, setSelectedWeekDate] = useState<Date>(today);

  // 오버레이 열림 상태는 URL에 저장하되, 히스토리에는 쌓지 않는다(공통 옵션).
  const [pickerOpen, setPickerOpen] = useOverlayFlag("picker");
  // 선택된 날짜(바텀 시트). 값이 문자열이라 훅 대신 공통 옵션을 그대로 쓴다.
  const [dayParam, setDayParam] = useQueryState(
    "day",
    parseAsString.withOptions(overlayUrlOptions),
  );

  // 조회할 달. 주간 뷰는 선택한 요일이 기준이다. 한 주가 두 달에 걸칠 때
  // (예: 9/28~10/4) 선택한 날이 속한 달을 받아야 그 날의 공연이 빠지지 않는다.
  const monthParam = toMonthParam(
    viewMode === "week" ? selectedWeekDate : new Date(year, month, 1),
  );
  const { data, isLoading, isError } = useCalendar(monthParam);

  // 캘린더에는 찜을 추가하는 동선이 없어 공통 훅에서 remove만 꺼내 쓴다.
  const {
    remove: removeWishlist,
    isError: isRemoveError,
    reset: resetRemove,
  } = useToggleWishlist();

  // 실패 토스트는 잠시 후 스스로 사라진다. 뮤테이션 상태를 되돌려 닫는다.
  useEffect(() => {
    if (!isRemoveError) return;
    const timer = setTimeout(resetRemove, TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [isRemoveError, resetRemove]);

  const performances = data ?? [];

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
      ) : isError ? (
        // 조회 실패: 달력 자리에 안내 문구를 둔다(docs/spec/calendar.md 7항).
        <p
          role="alert"
          className="text-4.5 m-auto text-center text-muted-foreground"
        >
          공연 일정을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요
        </p>
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
          onRemove={removeWishlist}
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
        onRemove={removeWishlist}
      />

      {/* 찜 해제 실패 토스트 */}
      <AnimatedToast
        open={isRemoveError}
        message={WISHLIST_ERROR_MESSAGE}
        variant="error"
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
