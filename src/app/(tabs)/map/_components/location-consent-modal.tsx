"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "cn";

interface LocationConsentModalProps {
  open: boolean;
  /** 동의하기: 현재 위치를 요청한다. */
  onAgree: () => void;
  /** 취소/배경 클릭/Esc: 기본 좌표를 유지한다. */
  onDecline: () => void;
}

/**
 * 위치 정보 서비스 동의 모달. 위치 권한이 미결정이거나 확인할 수 없을 때 노출된다.
 * 배경은 지도 블러(5px) + 검정 40%. 배경 클릭·Esc·취소는 거부로 처리한다.
 * 공통 UI 모달 스펙(제목·주 목적·취소/확인 버튼)을 따른다.
 */
export function LocationConsentModal({
  open,
  onAgree,
  onDecline,
}: LocationConsentModalProps) {
  return (
    <DialogPrimitive.Root
      open={open}
      // 사용자가 닫으면(배경/Esc/취소) 거부로 본다. 동의는 open을 외부에서 내려
      // 닫으므로 onOpenChange가 호출되지 않는다.
      onOpenChange={(next) => {
        if (!next) onDecline();
      }}
    >
      <DialogPrimitive.Portal>
        {/* 배경 딤 + 블러(Figma: BACKGROUND_BLUR 5, #000000 40%) */}
        <DialogPrimitive.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-black/40 supports-backdrop-filter:backdrop-blur-[5px]",
            "transition-opacity duration-200 ease-out motion-reduce:transition-none",
            "data-ending-style:opacity-0 data-starting-style:opacity-0",
          )}
        />
        <DialogPrimitive.Popup
          className={cn(
            "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-3rem)] -translate-x-1/2 -translate-y-1/2 gap-0 rounded-lg bg-popover p-5 outline-none sm:max-w-sm",
            "transition-opacity duration-200 ease-out motion-reduce:transition-none",
            "data-ending-style:opacity-0 data-starting-style:opacity-0",
          )}
        >
          <DialogPrimitive.Title className="text-body1 font-medium text-foreground">
            위치 정보 서비스 동의
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-5 text-body1 font-medium text-muted-foreground">
            위치 정보 사용에 동의가 필요한 서비스 입니다. 동의 하시겠습니까?
          </DialogPrimitive.Description>
          <div className="mt-14 flex items-center justify-end gap-5">
            <DialogPrimitive.Close className="px-1 py-2 text-body1 font-semibold text-foreground outline-none hover:cursor-pointer focus-visible:underline">
              취소하기
            </DialogPrimitive.Close>
            <button
              type="button"
              onClick={onAgree}
              className="px-1 py-2 text-body1 font-semibold text-primary outline-none hover:cursor-pointer focus-visible:underline"
            >
              동의하기
            </button>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
