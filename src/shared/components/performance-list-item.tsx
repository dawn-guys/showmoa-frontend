"use client";

import Image from "next/image";
import Link from "next/link";
import { HeartButton } from "@/shared/components/heart-button";

interface PerformanceListItemProps {
  id: string;
  title: string;
  /** 썸네일 이미지 URL. 없으면 플레이스홀더가 노출된다. */
  thumbnailUrl?: string;
  /** 보조 정보(장소·날짜 등) */
  caption?: string;
  /** 찜 상태 */
  isLiked: boolean;
  /** 찜 토글 콜백 */
  onToggleLike: () => void;
}

/**
 * 가로형 공연 리스트 항목. 항목 본문을 누르면 상세로 이동하고,
 * 하트 버튼으로 찜을 토글한다. <ul> 안에서 사용한다.
 */
export function PerformanceListItem({
  id,
  title,
  thumbnailUrl,
  caption,
  isLiked,
  onToggleLike,
}: PerformanceListItemProps) {
  return (
    <li className="flex items-center gap-3">
      <Link
        href={`/detail/${id}`}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="relative size-[50px] shrink-0 overflow-hidden rounded-lg bg-muted">
          {thumbnailUrl && (
            <Image
              src={thumbnailUrl}
              alt=""
              fill
              sizes="50px"
              className="object-cover"
            />
          )}
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-body2 font-semibold text-foreground">
            {title}
          </span>
          {caption && (
            <span className="truncate text-body3 font-light text-muted-foreground">
              {caption}
            </span>
          )}
        </span>
      </Link>
      <HeartButton
        isLiked={isLiked}
        onToggle={onToggleLike}
        size={22}
        className="-mr-2.5 shrink-0"
      />
    </li>
  );
}
