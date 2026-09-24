"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { HeartBoldIcon, SkipPreviousLineDuotoneIcon } from "@solar-icons/react";

interface DetailCtaProps {
  /** 현재 좋아요 상태 */
  isLiked: boolean;
  /** 좋아요 토글 요청(비로그인 시 상위에서 로그인 모달로 분기). */
  onToggleLike: () => void;
}

/**
 * 뷰포트 하단에 고정되는 CTA. 뒤로 가기 + 좋아요 버튼으로 구성된다.
 * 좋아요 버튼 문구는 상태에 따라 "좋아요" ↔ "좋아요 취소"로 바뀌고,
 * 좋아요로 전환될 때 하트 애니메이션을 보여준다.
 */
export function DetailCta({ isLiked, onToggleLike }: DetailCtaProps) {
  const router = useRouter();
  // 하트 애니메이션 트리거. 좋아요로 "켜질" 때마다 key를 올려 새 하트를 띄운다.
  const [burstKey, setBurstKey] = useState(0);

  const handleLike = () => {
    if (!isLiked) setBurstKey((prev) => prev + 1);
    onToggleLike();
  };

  return (
    <div className="blur-3 fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-app gap-3 px-[15px] pb-[calc(18px+env(safe-area-inset-bottom))]">
      <button
        type="button"
        aria-label="뒤로 가기"
        onClick={() => router.back()}
        className="flex size-14 shrink-0 items-center justify-center rounded-md bg-secondary text-foreground outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring active:opacity-80"
      >
        <SkipPreviousLineDuotoneIcon size={24} aria-hidden />
      </button>

      <button
        type="button"
        onClick={handleLike}
        aria-pressed={isLiked}
        // 오렌지(주조색) 위 흰 글자는 디자인 기준. 20px/semibold 대형 텍스트라 대비 기준 충족.
        className="relative flex h-14 flex-1 items-center justify-center overflow-hidden rounded-md bg-primary text-h1 font-semibold text-foreground outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:bg-primary/90"
      >
        {isLiked ? "좋아요 취소" : "좋아요"}

        {/* 좋아요로 전환 시 떠오르며 사라지는 하트 */}
        <AnimatePresence>
          {burstKey > 0 && (
            <motion.span
              key={burstKey}
              aria-hidden
              initial={{ opacity: 0, scale: 0.4, y: 0 }}
              animate={{ opacity: [0, 1, 0], scale: 1.4, y: -28 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="pointer-events-none absolute text-foreground"
            >
              <HeartBoldIcon size={28} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
