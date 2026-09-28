"use client";

import { useState } from "react";
import { HeartBoldIcon, HeartLinearIcon } from "@solar-icons/react";
import { motion } from "motion/react";
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

/** 하트가 채워지는 시간(초). 버스트가 뜨기 전에 끝나 두 동작이 이어져 보인다. */
const FILL_DURATION = 0.25;

/**
 * 공연 찜 토글 버튼. 상태는 props로 받고, aria-pressed로 노출한다.
 *
 * 버스트는 클릭이 아니라 isLiked가 false → true로 바뀌는 순간에 재생한다.
 * 클릭 시점에 재생하면 요청이 실패해도 애니메이션이 돌고, 성공하더라도 하트가
 * 채워지는 시점(서버 응답 후 refetch)과 어긋나 두 동작이 따로 논다.
 * 같은 값에서 파생시키면 채워짐과 버스트가 항상 같은 순간에 시작한다.
 */
export function HeartButton({
  isLiked,
  onToggle,
  size = 24,
  className,
}: HeartButtonProps) {
  const { triggerKey, burst } = useHeartBurst();

  // isLiked 변화를 렌더 중에 감지한다(effect 없이). HeartBurst와 같은 방식이다.
  const [lastLiked, setLastLiked] = useState(isLiked);
  if (isLiked !== lastLiked) {
    setLastLiked(isLiked);
    // 찜을 "추가"하는 전환에서만 중앙 하트 애니메이션을 재생한다.
    if (isLiked) burst();
  }

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={isLiked}
        aria-label={isLiked ? "찜 해제" : "찜하기"}
        className={cn(
          "flex size-11 items-center justify-center rounded-full transition-transform outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring active:scale-90",
          className,
        )}
      >
        {/* 외곽선 하트와 채워진 하트를 겹쳐 두고 서로 교차 페이드시킨다.
            교체가 아니라 겹치기라야 채워지는 과정이 애니메이션으로 보인다.
            외곽선을 깔아 둔 채로 두면 채워진 뒤에도 회색 테두리가 남아
            주황색 안쪽과 따로 놀기 때문에, 채워질 때 외곽선을 같이 지운다. */}
        <span
          aria-hidden
          className="relative inline-flex"
          style={{ width: size, height: size }}
        >
          {/* 첫 렌더에서는 애니메이션 없이 현재 상태 그대로 그린다
              (목록 진입 시 깜빡임 방지). 아래 채워진 하트도 같다. */}
          <motion.span
            className="inline-flex"
            initial={false}
            animate={{ opacity: isLiked ? 0 : 1 }}
            transition={{ duration: FILL_DURATION, ease: "easeOut" }}
          >
            <HeartLinearIcon size={size} className="text-muted-foreground" />
          </motion.span>
          <motion.span
            className="absolute inset-0 inline-flex"
            initial={false}
            animate={{ opacity: isLiked ? 1 : 0, scale: isLiked ? 1 : 0.6 }}
            transition={{ duration: FILL_DURATION, ease: "easeOut" }}
          >
            <HeartBoldIcon size={size} className="text-primary" />
          </motion.span>
        </span>
      </button>
      <HeartBurst triggerKey={triggerKey} />
    </>
  );
}
