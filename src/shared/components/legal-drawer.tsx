"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { ChevronLeft } from "lucide-react";
import { cn } from "cn";

interface LegalDrawerProps {
  /** 열림 상태 (URL 등 바깥 상태와 연결) */
  open: boolean;
  /** 열림 상태 변경 콜백 */
  onOpenChange: (open: boolean) => void;
  /** 상단 바 제목 (드로워의 접근성 이름) */
  title: string;
  /** 약관 본문. 아직 확정 전이면 비워 둔다. */
  children?: React.ReactNode;
}

/**
 * 법적 고지(개인정보 처리 방침, 위치 정보 서비스 이용 약관 등)를 읽는
 * 공통 드로워 셸. 앱 컬럼 전체를 덮는 사이드 시트로 열리며, 뒤로가기
 * 버튼과 배경(백드롭)으로 닫는다. 본문은 확정 후 children으로 채운다.
 */
export function LegalDrawer({
  open,
  onOpenChange,
  title,
  children,
}: LegalDrawerProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-black/40 duration-200",
            "data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
          )}
        />
        <DialogPrimitive.Popup
          className={cn(
            "fixed inset-0 z-50 mx-auto flex max-w-app flex-col bg-background duration-200 outline-none",
            "data-open:animate-in data-open:slide-in-from-right data-closed:animate-out data-closed:slide-out-to-right",
          )}
        >
          {/* 앱바: 뒤로가기 버튼 + 제목(드로워 접근성 이름) */}
          <header className="flex h-17 items-center gap-6 px-4">
            <DialogPrimitive.Close
              aria-label="뒤로 가기"
              className="-ml-2.5 flex size-11 items-center justify-center rounded-full text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring active:bg-muted"
            >
              <ChevronLeft size={24} />
            </DialogPrimitive.Close>
            <DialogPrimitive.Title className="text-h1 text-foreground">
              {title}
            </DialogPrimitive.Title>
          </header>

          <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-safe">
            {children}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
