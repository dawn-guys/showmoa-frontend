"use client";

import { AnimatePresence, motion } from "motion/react";
import { cn } from "cn";

type ToastVariant = "default" | "success" | "error";

interface ToastProps {
  /** 표시 문구 */
  message: string;
  /** 토스트 종류. 기본 "default" */
  variant?: ToastVariant;
  className?: string;
}

// 종류별 텍스트 색상. success 초록(#008819)은 대응 토큰이 없어 임시 하드코딩.
const VARIANT_TEXT: Record<ToastVariant, string> = {
  default: "text-background",
  success: "text-[#008819]",
  error: "text-destructive",
};

/**
 * 동작의 결과·에러를 알리는 토스트(프레젠테이션 전용).
 * 노출 큐/타이머는 화면 작업 시 별도로 결정한다.
 */
export function Toast({ message, variant = "default", className }: ToastProps) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        // Figma 에러 토스트 기준: 흰 배경, 12px, radius 4.
        // 너비는 메시지 길이에 맞춰 줄어든다(inline-flex=hug). 컨테이너보다 길어지면
        // max-w-full로 넘침을 막고 줄바꿈된다. 가운데 정렬은 사용하는 쪽에서 처리.
        // text-[0.75rem]은 커스텀 text-body3와 달리 tailwind-merge가 폰트사이즈로 인식해
        // VARIANT_TEXT의 text-* 색상과 충돌 없이 유지된다.
        "inline-flex max-w-full items-center justify-center rounded bg-white px-3.5 py-2 text-center text-[0.75rem] font-normal shadow-[0_0_4px_0_rgba(0,0,0,0.25)]",
        VARIANT_TEXT[variant],
        className,
      )}
    >
      {message}
    </div>
  );
}

interface AnimatedToastProps {
  /** 노출 여부. 자동 닫힘(타이머)은 사용하는 쪽에서 이 값을 토글해 제어한다. */
  open: boolean;
  /** 표시 문구 */
  message: string;
  /** 토스트 종류. 기본 "default" */
  variant?: ToastVariant;
  /** 컨테이너 id. 입력 등에서 aria-describedby로 참조할 때 넘긴다. */
  id?: string;
  /** 고정 컨테이너 위치 등 오버라이드(예: safe-area 기준 top). 기본은 상단 top-10. */
  className?: string;
}

/**
 * 상단 중앙에 고정되어 위에서 스르륵 내려왔다가 다시 올라가 사라지는 토스트.
 * 여러 화면이 공통으로 쓰는 노출 애니메이션 + 앱 컬럼 폭 고정 + 위치를 캡슐화한다.
 * reduced-motion은 전역 MotionConfig가 처리한다.
 */
export function AnimatedToast({
  open,
  message,
  variant = "default",
  id,
  className,
}: AnimatedToastProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="toast"
          id={id}
          className={cn(
            "fixed inset-x-0 top-10 z-50 mx-auto flex max-w-app justify-center px-4",
            className,
          )}
          initial={{ y: "-150%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-150%", opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Toast message={message} variant={variant} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export type { ToastVariant };
