"use client";

import { HeartBoldIcon, HeartLinearIcon } from "@solar-icons/react";
import { cn } from "cn";
import { HeartBurst, useHeartBurst } from "@/shared/components/heart-burst";

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
  const { triggerKey, burst } = useHeartBurst();

  const handleClick = () => {
    // 좋아요를 "추가"하는 동작(찜 안 됨 → 찜)일 때만 중앙 하트 애니메이션을 재생한다.
    if (!isLiked) burst();
    onToggle();
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={isLiked}
        aria-label={isLiked ? "찜 해제" : "찜하기"}
        className={cn(
          "flex size-11 items-center justify-center rounded-full transition-transform outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring active:scale-90",
          className,
        )}
      >
        {/* 찜 상태: 채워진 하트(Bold)와 외곽선 하트(Linear)로 구분 */}
        {isLiked ? (
          <HeartBoldIcon size={size} className="text-primary" />
        ) : (
          <HeartLinearIcon size={size} className="text-muted-foreground" />
        )}
      </button>
      <HeartBurst triggerKey={triggerKey} />
    </>
  );
}
