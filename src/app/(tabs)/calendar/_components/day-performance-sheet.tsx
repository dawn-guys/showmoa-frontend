"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { ChevronDown } from "lucide-react";
import { cn } from "cn";
import type { CalendarPerformance } from "../_types";
import { CalendarPerformanceItem } from "./calendar-performance-item";

interface DayPerformanceSheetProps {
  /** 열림 상태 (URL 등 바깥 상태와 연결) */
  open: boolean;
  /** 열림 상태 변경 콜백 */
  onOpenChange: (open: boolean) => void;
  /** 선택된 날짜. 열려 있을 때만 유효하다. */
  date: Date | null;
  /** 선택된 날짜의 공연 목록(이미 제외 반영). */
  performances: CalendarPerformance[];
  /** 하트로 공연을 캘린더(찜)에서 제외한다. */
  onRemove: (id: string) => void;
}

/**
 * 월간 달력에서 날짜 카드를 눌렀을 때 나오는 공연 목록 바텀 시트. 선택한 날의
 * "M월 D일 일정"과 공연 목록을 보여주며, 헤더의 아래 화살표/배경/Esc로 닫는다.
 */
export function DayPerformanceSheet({
  open,
  onOpenChange,
  date,
  performances,
  onRemove,
}: DayPerformanceSheetProps) {
  const title = date ? `${date.getMonth() + 1}월 ${date.getDate()}일 일정` : "";

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-black/40",
            "transition-opacity duration-300 ease-out motion-reduce:transition-none",
            "data-ending-style:opacity-0 data-starting-style:opacity-0",
          )}
        />
        <DialogPrimitive.Popup
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[85dvh] max-w-app flex-col rounded-t-2xl bg-[#1f1f1f] outline-none",
            "transition-transform duration-300 ease-out will-change-transform motion-reduce:transition-none",
            "data-ending-style:translate-y-full data-starting-style:translate-y-full",
          )}
        >
          {/* 헤더: 선택한 날짜 + 닫기(아래 화살표) */}
          <div className="flex shrink-0 items-center justify-between px-4 pt-[19px] pb-3">
            <DialogPrimitive.Title className="text-h2 font-medium text-foreground">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label="일정 닫기"
              className="-mr-1.5 flex size-11 items-center justify-center rounded-full text-muted-foreground outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring active:bg-white/10"
            >
              <ChevronDown size={24} />
            </DialogPrimitive.Close>
          </div>

          {/* 공연 목록. 넘치면 스크롤(스크롤바 숨김). */}
          {performances.length === 0 ? (
            <p className="px-4 pt-6 pb-[calc(2rem+env(safe-area-inset-bottom))] text-center text-body1 text-muted-foreground">
              이 날은 공연이 없습니다
            </p>
          ) : (
            <ul className="flex min-h-0 flex-1 [scrollbar-width:none] flex-col gap-[30px] overflow-y-auto overscroll-contain px-4 pt-1 pb-[calc(2rem+env(safe-area-inset-bottom))] [&::-webkit-scrollbar]:hidden">
              {performances.map((performance) => (
                <CalendarPerformanceItem
                  key={performance.id}
                  performance={performance}
                  isLiked
                  onToggleLike={() => onRemove(performance.id)}
                />
              ))}
            </ul>
          )}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
