import { cn } from "cn";

interface LoadingSpinnerProps {
  /** 스크린리더용 라벨. 기본 "로딩 중" */
  label?: string;
  className?: string;
}

// 세 개의 원이 시간차를 두고 퍼져나가는 파동 스피너. (Figma 디자인 시스템 기준)
// 각 원: 안쪽에서(scale 0.3, opacity 1) 바깥으로(scale 1, opacity 0) 퍼지며 사라진다.
// 위상 오프셋은 음수 딜레이(-400ms, -800ms)로 준다. 그래야 첫 프레임부터 세 원이
// 서로 다른 위상(중간 과정)에서 시작해, 시작 직후 바로 파동이 퍼지는 모습이 보인다.
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
  // isolate: 원들의 z-index가 스피너 밖(하단 나브 등)으로 새지 않도록 쌓임 맥락을 가둔다.
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "relative isolate inline-flex size-12.5 items-center justify-center",
        className,
      )}
    >
      <span aria-hidden className={cn(RING, "z-10")} />
      <span aria-hidden className={cn(RING, "z-20 [animation-delay:-400ms]")} />
      <span aria-hidden className={cn(RING, "z-30 [animation-delay:-800ms]")} />
    </span>
  );
}
