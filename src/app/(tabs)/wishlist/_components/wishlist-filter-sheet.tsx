"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { cn } from "cn";
import { CtaButton } from "@/shared/components/cta-button";
import {
  GENRE_FILTER_OPTIONS,
  type GenreFilterOption,
} from "@/shared/constants/genre";

interface WishlistFilterSheetProps {
  /** 열림 상태 (URL 등 바깥 상태와 연결) */
  open: boolean;
  /** 열림 상태 변경 콜백 */
  onOpenChange: (open: boolean) => void;
  /** 완료 버튼으로 선택한 장르를 적용한다. */
  onApply: (genre: GenreFilterOption) => void;
}

/**
 * 시트 본문. 시트가 닫히면 언마운트되므로 임시 선택 상태가 열 때마다
 * 초기화되어, CTA가 항상 비활성에서 시작한다.
 */
function FilterSheetBody({
  onApply,
}: {
  onApply: (genre: GenreFilterOption) => void;
}) {
  // 시트 안에서만 유지되는 임시 선택 상태. 항목을 고르기 전에는 CTA 비활성.
  const [selected, setSelected] = useState<GenreFilterOption | null>(null);

  return (
    <>
      {/* 제목 + 닫기 버튼 */}
      <div className="flex items-center justify-between">
        <DialogPrimitive.Title className="text-[1.375rem] leading-tight font-[500] text-white">
          필터링
        </DialogPrimitive.Title>
        <DialogPrimitive.Close
          aria-label="필터 닫기"
          className="-mr-1.5 flex size-11 items-center justify-center rounded-full text-foreground outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring active:bg-white/10"
        >
          <X size={24} />
        </DialogPrimitive.Close>
      </div>

      {/* 장르 목록. 하나만 선택할 수 있다. */}
      {/* 터치 영역 확보를 위해 각 옵션을 풀폭 행으로 만든다(레이아웃은 좌측 정렬 유지). */}
      <div
        role="group"
        aria-label="장르 필터"
        className="-my-1 flex flex-col gap-1 pl-[5px]"
      >
        {GENRE_FILTER_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={selected === option}
            onClick={() => setSelected(option)}
            className={cn(
              "rounded-sm py-2 text-left text-lg transition-colors outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring",
              selected === option ? "text-primary" : "text-disabled",
            )}
          >
            {option}
          </button>
        ))}
      </div>

      {/* CTA: 장르를 선택해야 활성화된다. */}
      <CtaButton
        disabled={!selected}
        onClick={() => selected && onApply(selected)}
      >
        완료
      </CtaButton>
    </>
  );
}

/**
 * 찜 목록 장르 필터 바텀 시트. 하단에서 올라오며, 목록에서 장르를 하나
 * 선택하면 주조색으로 강조되고 CTA가 활성화된다. 완료를 누르면 선택한
 * 장르를 적용하고 시트를 닫는다. 배경/X 버튼/Esc로도 닫을 수 있다.
 */
export function WishlistFilterSheet({
  open,
  onOpenChange,
  onApply,
}: WishlistFilterSheetProps) {
  const handleApply = (genre: GenreFilterOption) => {
    onApply(genre);
    onOpenChange(false);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* 배경 딤 + 블러(Figma BACKGROUND_BLUR 5). backdrop-filter 미지원
            브라우저에서는 딤만 남는다. opacity만 트랜지션해 컴포지터에서 처리된다. */}
        <DialogPrimitive.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-black/40 supports-backdrop-filter:backdrop-blur-[5px]",
            "transition-opacity duration-300 ease-out motion-reduce:transition-none",
            "data-ending-style:opacity-0 data-starting-style:opacity-0",
          )}
        />
        {/* 시트 슬라이드. keyframe(animate-in) 대신 transform만 트랜지션해
            filter 레이어 없이 GPU 컴포지터에서 부드럽게 돌린다.
            will-change로 레이어를 미리 승격해 첫 프레임 끊김을 없앤다. */}
        <DialogPrimitive.Popup
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-app flex-col gap-10 rounded-t-2xl bg-[#232323] px-3.5 pt-5 outline-none",
            "pb-[calc(1.25rem+env(safe-area-inset-bottom))]",
            "transition-transform duration-300 ease-out will-change-transform motion-reduce:transition-none",
            "data-ending-style:translate-y-full data-starting-style:translate-y-full",
          )}
        >
          <FilterSheetBody onApply={handleApply} />
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
