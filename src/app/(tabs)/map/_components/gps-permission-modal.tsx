"use client";

import { X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

interface GpsPermissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * GPS(현재 위치) 버튼으로 위치를 가져오지 못했을 때 뜨는 안내 전용 모달.
 *
 * 동의를 받는 모달이 아니라, 위치 권한이 막혀 있다는 상황만 알리고 사용자가
 * 직접 브라우저 설정에서 허용하도록 안내한다(코드로는 권한창을 다시 띄울 수 없다).
 * 별도 액션 버튼 없이 우상단 X로만 닫는다. (Figma 805:3716)
 */
export function GpsPermissionModal({
  open,
  onOpenChange,
}: GpsPermissionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 rounded-[10px] bg-popover p-5 pb-10"
      >
        {/* 우상단 X(배경/칩 없는 플레인 아이콘). Figma 805:3716 */}
        <DialogClose
          aria-label="닫기"
          className="absolute top-5 right-5 text-muted-foreground outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X size={24} aria-hidden />
        </DialogClose>
        <DialogHeader className="gap-10">
          <DialogTitle className="pr-8 text-body1 font-medium text-foreground">
            위치 정보 서비스 동의
          </DialogTitle>
          <DialogDescription className="text-body1 font-medium text-muted-foreground">
            위치 정보 접근 권한이 허용되어 있지 않습니다. 서비스 이용을 위해
            위치 정보 사용을 허용 하시고 다시 시도해 주세요.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
