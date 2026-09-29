"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "cn";
import { HeartButton } from "@/shared/components/heart-button";
import type { WishlistItemResponse, WishlistStatus } from "../_types";

// 찜 목록의 상태 문구. Figma 표기를 그대로 사용한다("상영"·"상연" 혼용).
const STATUS_LABEL: Record<WishlistStatus, string> = {
  ONGOING: "상영 중",
  UPCOMING: "상영 예정",
  ENDED: "상연 종료",
};

interface WishlistItemProps {
  performance: WishlistItemResponse;
  /** 하트 버튼을 눌러 찜을 해제한다. */
  onRemove: () => void;
}

/**
 * 찜 목록 항목. 항목 본문을 누르면 상세로 이동하고, 하트로 찜을 해제한다.
 * 종료된 공연은 상세로 넘어갈 수 없어 링크가 아닌 표시 항목으로 렌더하며,
 * 포스터에 딤을 얹고 텍스트를 흐리게 처리한다. 하트 해제는 여전히 가능하다.
 * <ul> 안에서 사용한다.
 */
export function WishlistItem({ performance, onRemove }: WishlistItemProps) {
  const { performanceId, name, posterUrl, status } = performance;
  const isEnded = status === "ENDED";

  const poster = (
    <span className="relative size-[50px] shrink-0 overflow-hidden rounded-lg bg-muted">
      {posterUrl && (
        <Image
          src={posterUrl}
          alt=""
          fill
          sizes="50px"
          className="object-cover"
        />
      )}
      {/* 종료 공연 포스터에 딤을 얹어 비활성 상태를 시각적으로 알린다. */}
      {isEnded && <span className="absolute inset-0 bg-background/70" />}
    </span>
  );

  const body = (
    <span className="flex min-w-0 flex-col gap-0.5">
      <span
        className={cn(
          "truncate text-body1 font-[500]",
          isEnded ? "text-disabled" : "text-foreground",
        )}
      >
        {name}
      </span>
      <span
        className={cn(
          "truncate text-body3 font-[200]",
          isEnded ? "text-disabled" : "text-muted-foreground",
        )}
      >
        {STATUS_LABEL[status]}
      </span>
    </span>
  );

  return (
    <li className="flex items-center gap-3">
      {isEnded ? (
        // 종료 공연은 상세로 넘어가지 않으므로 링크가 아닌 표시 항목으로 둔다.
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {poster}
          {body}
        </div>
      ) : (
        <Link
          href={`/detail/${performanceId}`}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {poster}
          {body}
        </Link>
      )}
      <HeartButton
        isLiked
        onToggle={onRemove}
        size={22}
        className="-mr-2.5 shrink-0 hover:cursor-pointer"
      />
    </li>
  );
}
