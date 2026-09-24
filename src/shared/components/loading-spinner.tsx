import { cn } from "cn";

interface LoadingSpinnerProps {
  /** 스크린리더용 라벨. 기본 "로딩 중" */
  label?: string;
  className?: string;
}

// 세 개의 원이 시간차를 두고 퍼져나가는 파동 스피너. (Figma 디자인 시스템 기준)
// 각 원: 안쪽에서(scale 0.3, opacity 1) 바깥으로(scale 1, opacity 0) 퍼지며 사라진다.
const RING = cn(
  "absolute size-full rounded-full bg-primary",
  "animate-wave will-change-[transform,opacity] motion-reduce:animate-none",
);

/**
 * 파동이 순차적으로 퍼지는 로딩 스피너.
 * prefers-reduced-motion이면 애니메이션을 멈춘다.
 */
export function LoadingSpinner({
  label = "로딩 중",
  className,
}: LoadingSpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "relative inline-flex size-12.5 items-center justify-center",
        className,
      )}
    >
      <span aria-hidden className={cn(RING, "z-10")} />
      <span aria-hidden className={cn(RING, "z-20 [animation-delay:300ms]")} />
      <span aria-hidden className={cn(RING, "z-30 [animation-delay:600ms]")} />
    </span>
  );
}
