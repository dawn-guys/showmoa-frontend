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
        "inline-flex max-w-full items-center justify-center rounded bg-white px-3.5 py-2 text-center text-[0.75rem] font-normal",
        VARIANT_TEXT[variant],
        className,
      )}
    >
      {message}
    </div>
  );
}

export type { ToastVariant };
