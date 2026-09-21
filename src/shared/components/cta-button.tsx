import { cn } from "cn";
import { Button } from "@/shared/components/ui/button";

interface CtaButtonProps extends React.ComponentProps<typeof Button> {
  /** API 요청 중 로딩 애니메이션 표시 + 비활성화 */
  isLoading?: boolean;
}

/** 로딩 중 점 3개가 순차적으로 튀어오르는 인디케이터 */
function LoadingDots() {
  return (
    <span className="flex items-center gap-1.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-2.5 animate-bounce rounded-full bg-foreground motion-reduce:animate-none"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

/**
 * 화면 하단 주 동작 버튼. 기존 Button primitive 위에 풀폭·로딩 상태를 얹었다.
 * 비활성화 시 눌러도 동작하지 않으며, 로딩 중에는 점 애니메이션을 보여준다.
 */
export function CtaButton({
  className,
  isLoading = false,
  disabled,
  children,
  ...props
}: CtaButtonProps) {
  return (
    <Button
      className={cn(
        "h-13 w-full rounded-sm text-lg font-semibold text-[#f6f6f6] hover:cursor-pointer",
        isLoading
          ? "disabled:bg-primary disabled:opacity-100"
          : "disabled:bg-secondary disabled:text-disabled disabled:opacity-100",
        className,
      )}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? <LoadingDots /> : children}
    </Button>
  );
}
