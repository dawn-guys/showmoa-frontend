"use client";

import Image from "next/image";
import Link from "next/link";
import { HeartButton } from "@/shared/components/heart-button";
import type { CalendarPerformance } from "../_types";
import { formatDayPeriod } from "../_lib/calendar";

interface CalendarPerformanceItemProps {
  performance: CalendarPerformance;
  /** 찜 상태 */
  isLiked: boolean;
  /** 찜 토글 콜백 */
  onToggleLike: () => void;
}

/**
 * 캘린더 공연 목록 항목. 포스터·제목·위치·기간·하트를 제공하며, 본문을 누르면
 * 상세로 이동한다. 주간 뷰와 날짜 바텀 시트에서 공통으로 사용하고 <ul> 안에서 쓴다.
 */
export function CalendarPerformanceItem({
  performance,
  isLiked,
  onToggleLike,
}: CalendarPerformanceItemProps) {
  const { id, title, posterUrl, venue, startDate, endDate } = performance;

  return (
    <li className="flex items-center gap-3">
      <Link
        href={`/detail/${id}`}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="relative size-[74px] shrink-0 overflow-hidden rounded-[10px] bg-muted">
          {posterUrl && (
            <Image
              src={posterUrl}
              alt=""
              fill
              sizes="74px"
              className="object-cover"
            />
          )}
        </span>
        <span className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-body1 font-semibold text-foreground">
            {title}
          </span>
          <span className="truncate text-body3 font-light text-muted-foreground">
            {venue}
          </span>
          <span className="truncate text-body3 font-light text-muted-foreground">
            {formatDayPeriod(startDate, endDate)}
          </span>
        </span>
      </Link>
      <HeartButton
        isLiked={isLiked}
        onToggle={onToggleLike}
        size={26}
        className="-mr-2.5 shrink-0"
      />
    </li>
  );
}
