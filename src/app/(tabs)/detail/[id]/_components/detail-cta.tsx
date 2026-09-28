"use client";

import { useRouter } from "next/navigation";
import { SkipPreviousLineDuotoneIcon } from "@solar-icons/react";

interface DetailCtaProps {
  /** 현재 좋아요 상태 */
  isLiked: boolean;
  /** 좋아요 요청 진행 중 여부(중복 요청 방지) */
  isPending: boolean;
  /** 좋아요 토글 요청(비로그인 시 상위에서 로그인 모달로 분기). */
  onToggleLike: () => void;
}

/**
 * 뷰포트 하단에 고정되는 CTA. 뒤로 가기 + 좋아요 버튼으로 구성된다.
 * 좋아요 버튼 문구는 상태에 따라 "좋아요" ↔ "좋아요 취소"로 바뀐다.
 * 하트 애니메이션은 요청 성공 시에만 재생하므로 상위(DetailScreen)에서 다룬다.
 */
export function DetailCta({
  isLiked,
  isPending,
  onToggleLike,
}: DetailCtaProps) {
  const router = useRouter();

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
        onClick={onToggleLike}
        disabled={isPending}
        aria-pressed={isLiked}
        // 오렌지(주조색) 위 흰 글자는 디자인 기준. 20px/semibold 대형 텍스트라 대비 기준 충족.
        className="flex h-14 flex-1 items-center justify-center rounded-md bg-primary text-h1 font-semibold text-foreground outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLiked ? "좋아요 취소" : "좋아요"}
      </button>
    </div>
  );
}
