"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { cn } from "cn";
import { CtaButton } from "@/shared/components/cta-button";
import { useDebouncedCallback } from "@/shared/hooks/useDebouncedCallback";

/** 휠 항목 하나의 높이(px). 선택 영역(가운데 밴드)도 같은 높이다. */
const ITEM_HEIGHT = 40;

interface MonthPickerSheetProps {
  /** 열림 상태 (URL 등 바깥 상태와 연결) */
  open: boolean;
  /** 열림 상태 변경 콜백 */
  onOpenChange: (open: boolean) => void;
  /** 초기 선택 월(0=1월). 당월 또는 기존 선택 값이 선택 영역에서 시작한다. */
  initialMonth: number;
  /** 완료 버튼으로 선택한 월(0=1월)을 적용한다. */
  onApply: (month: number) => void;
}

/**
 * 월 휠 피커. 세로 스크롤(스와이프/휠)로 값을 고르며, 가운데 밴드에 놓인 월이
 * 선택 값이 된다. 각 월은 버튼이라 클릭·키보드로도 선택할 수 있다.
 */
function MonthWheel({
  value,
  onChange,
}: {
  value: number;
  onChange: (month: number) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // 휠 이벤트 핸들러가 최신 선택 값을 참조하도록 ref로 보관한다.
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);
  // 휠 한 번당 한 칸만 이동하도록 잠깐 잠근다(연속 휠 이벤트 무시).
  const wheelLock = useRef(false);

  // 마운트 시(시트 열릴 때) 초기 선택 월을 가운데로 스크롤한다.
  useLayoutEffect(() => {
    scrollRef.current?.scrollTo({ top: value * ITEM_HEIGHT });
    // 최초 1회만 정렬한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 스크롤(터치/트랙패드 드래그)이 멈추면 가운데 월을 선택 값으로 확정한다.
  const settle = useDebouncedCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollTop / ITEM_HEIGHT);
    const clamped = Math.min(11, Math.max(0, index));
    if (clamped !== value) onChange(clamped);
  }, 120);

  const selectMonth = (month: number) => {
    onChange(month);
    scrollRef.current?.scrollTo({
      top: month * ITEM_HEIGHT,
      behavior: "smooth",
    });
  };

  // 마우스 휠: 네이티브 휠은 한 번에 ~100px(2~3칸)를 스크롤하므로, 이벤트를
  // 가로채 한 번당 한 칸만 이동시킨다. (React onWheel은 passive라 preventDefault가
  // 안 먹으므로 non-passive 리스너를 직접 붙인다.)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (wheelLock.current) return;
      wheelLock.current = true;

      const dir = e.deltaY > 0 ? 1 : -1;
      const next = Math.min(11, Math.max(0, valueRef.current + dir));
      if (next !== valueRef.current) selectMonth(next);

      window.setTimeout(() => {
        wheelLock.current = false;
      }, 140);
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
    // selectMonth는 안정적인 onChange/ref만 사용하므로 마운트 시 한 번만 등록한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative h-[120px]">
      {/* 선택 영역(가운데 밴드) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-10 h-10 rounded-[5px] bg-[#d8d8d8]/6"
      />
      <div
        ref={scrollRef}
        role="listbox"
        aria-label="월 선택"
        onScroll={() => settle.run()}
        className="h-full snap-y snap-mandatory [scrollbar-width:none] overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:hidden"
      >
        {/* 첫·마지막 월도 가운데로 올 수 있게 위아래 여백 한 칸씩 둔다. */}
        <div className="h-10" aria-hidden />
        {Array.from({ length: 12 }, (_, month) => {
          const selected = month === value;
          return (
            <button
              key={month}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => selectMonth(month)}
              className={cn(
                "flex h-10 w-full snap-center items-center justify-center outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                selected
                  ? "text-xl font-medium text-foreground"
                  : "text-base font-medium text-muted-foreground",
              )}
            >
              {month + 1}월
            </button>
          );
        })}
        <div className="h-10" aria-hidden />
      </div>
    </div>
  );
}

/** 시트 본문. 열릴 때마다 초기 선택 월로 리셋되도록 시트가 닫히면 언마운트된다. */
function MonthPickerBody({
  initialMonth,
  onApply,
}: {
  initialMonth: number;
  onApply: (month: number) => void;
}) {
  const [selected, setSelected] = useState(initialMonth);

  return (
    <>
      {/* 제목 + 닫기 버튼 */}
      <div className="flex items-center justify-between">
        <DialogPrimitive.Title className="text-[20px] leading-tight font-semibold text-foreground">
          월 선택
        </DialogPrimitive.Title>
        <DialogPrimitive.Close
          aria-label="월 선택 닫기"
          className="-mr-1.5 flex size-11 items-center justify-center rounded-full text-foreground outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring active:bg-white/10"
        >
          <X size={24} color="#888888" />
        </DialogPrimitive.Close>
      </div>

      <MonthWheel value={selected} onChange={setSelected} />

      <CtaButton onClick={() => onApply(selected)}>완료</CtaButton>
    </>
  );
}

/**
 * 월 선택 휠 피커 바텀 시트. 하단에서 올라오며, 휠에서 월을 고르고 완료를
 * 누르면 해당 월의 달력을 보여준다. 배경/X 버튼/Esc로도 닫을 수 있다.
 */
export function MonthPickerSheet({
  open,
  onOpenChange,
  initialMonth,
  onApply,
}: MonthPickerSheetProps) {
  const handleApply = (month: number) => {
    onApply(month);
    onOpenChange(false);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-black/40 supports-backdrop-filter:backdrop-blur-[5px]",
            "transition-opacity duration-300 ease-out motion-reduce:transition-none",
            "data-ending-style:opacity-0 data-starting-style:opacity-0",
          )}
        />
        <DialogPrimitive.Popup
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-app flex-col gap-5 rounded-t-2xl bg-[#232323] px-4 pt-5 outline-none",
            "pb-[calc(1.25rem+env(safe-area-inset-bottom))]",
            "transition-transform duration-300 ease-out will-change-transform motion-reduce:transition-none",
            "data-ending-style:translate-y-full data-starting-style:translate-y-full",
          )}
        >
          <MonthPickerBody initialMonth={initialMonth} onApply={handleApply} />
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
