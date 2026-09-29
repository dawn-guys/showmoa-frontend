"use client";

import Image from "next/image";
import Link from "next/link";
import { HeartButton } from "@/shared/components/heart-button";
import type { WishlistCalendarResponse } from "../_types";
import { formatDayPeriod } from "../_lib/calendar";

interface CalendarPerformanceItemProps {
  performance: WishlistCalendarResponse;
  /** 찜 해제 콜백. 캘린더에는 찜을 추가하는 동선이 없어 해제만 받는다. */
  onRemove: () => void;
}

/**
 * 캘린더 공연 목록 항목. 포스터·제목·위치·기간·하트를 제공하며, 본문을 누르면
 * 상세로 이동한다. 주간 뷰와 날짜 바텀 시트에서 공통으로 사용하고 <ul> 안에서 쓴다.
 *
 * 캘린더 응답은 찜한 공연만 담고 있어 하트는 항상 채워진 상태로 시작한다
 * (isWished는 계약상 항상 true).
 */
export function CalendarPerformanceItem({
  performance,
  onRemove,
}: CalendarPerformanceItemProps) {
  const { performanceId, name, posterUrl, theatreName, startDate, endDate } =
    performance;

  return (
    <li className="flex items-center gap-3">
      <Link
        href={`/detail/${performanceId}`}
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
            {name}
          </span>
          <span className="truncate text-body3 font-light text-muted-foreground">
            {theatreName}
          </span>
          <span className="truncate text-body3 font-light text-muted-foreground">
            {formatDayPeriod(startDate, endDate)}
          </span>
        </span>
      </Link>
      <HeartButton
        isLiked={performance.isWished}
        onToggle={onRemove}
        size={26}
        className="-mr-2.5 shrink-0"
      />
    </li>
  );
}
