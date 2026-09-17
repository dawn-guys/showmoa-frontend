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
        // 토스트 배경(#EDEDED)은 대응 토큰이 없어 임시 하드코딩.
        "flex min-h-13 items-center justify-center rounded-sm bg-[#ededed] px-6 py-4 text-center text-sm font-semibold",
        VARIANT_TEXT[variant],
        className,
      )}
    >
      {message}
    </div>
  );
}

export type { ToastVariant };
