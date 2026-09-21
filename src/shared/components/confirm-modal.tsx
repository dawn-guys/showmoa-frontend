"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

interface ConfirmModalProps {
  /** 열림 상태 (URL 등 바깥 상태와 연결) */
  open: boolean;
  /** 열림 상태 변경 콜백 */
  onOpenChange: (open: boolean) => void;
  /** 모달 제목 */
  title: string;
  /** 주 목적 설명 */
  description: string;
  /** 주 목적(확인) 버튼 문구 */
  confirmLabel: string;
  /** 취소 버튼 문구. 기본 "취소하기" */
  cancelLabel?: string;
  /** 확인 버튼 동작. 실행 후 모달이 닫힌다. */
  onConfirm: () => void;
}

/**
 * 제목·설명·취소/확인으로 구성된 공통 확인 모달.
 * 배경(백드롭)을 누르면 닫힌다(Dialog 기본 동작).
 */
export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "취소하기",
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 rounded-lg bg-popover p-5"
      >
        <DialogHeader className="gap-5">
          <DialogTitle className="text-body1 font-medium text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="text-body1 font-medium text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-14 flex items-center justify-end gap-5">
          <DialogClose className="px-1 py-2 text-body1 font-semibold text-foreground outline-none hover:cursor-pointer focus-visible:underline">
            {cancelLabel}
          </DialogClose>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="px-1 py-2 text-body1 font-semibold text-primary outline-none hover:cursor-pointer focus-visible:underline"
          >
            {confirmLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
