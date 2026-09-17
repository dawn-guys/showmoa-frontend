"use client";

import { Heart } from "lucide-react";
import { cn } from "cn";

interface HeartButtonProps {
  /** 좋아요(찜) 상태 */
  isLiked: boolean;
  /** 상태 토글 콜백 */
  onToggle: () => void;
  /** 하트 아이콘 크기(px). 기본 24 */
  size?: number;
  className?: string;
}

/**
 * 공연 찜 토글 버튼. 상태는 props로 받고, aria-pressed로 노출한다.
 */
export function HeartButton({
  isLiked,
  onToggle,
  size = 24,
  className,
}: HeartButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isLiked}
      aria-label={isLiked ? "찜 해제" : "찜하기"}
      className={cn(
        "flex size-11 items-center justify-center rounded-full transition-transform outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-90",
        className,
      )}
    >
      <Heart
        size={size}
        className={cn(
          isLiked
            ? "fill-primary text-primary"
            : "fill-none text-muted-foreground",
        )}
      />
    </button>
  );
}
