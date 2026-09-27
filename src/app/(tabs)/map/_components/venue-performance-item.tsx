"use client";

import Image from "next/image";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { HeartButton } from "@/shared/components/heart-button";
import type { PerformanceResponse } from "@/app/(tabs)/_types";

interface VenuePerformanceItemProps {
  performance: PerformanceResponse;
  /** 찜 상태 */
  isLiked: boolean;
  /** 찜 토글 콜백 */
  onToggleLike: () => void;
}

/** 공연 기간 표기(yyyy.MM.dd). 날짜는 yyyy-MM-dd로 내려온다. */
function formatPeriod(startDate: string, endDate: string): string {
  const start = format(parseISO(startDate), "yyyy.MM.dd");
  return `${start} - ${format(parseISO(endDate), "yyyy.MM.dd")}`;
}

/**
 * 바텀 시트의 공연 항목. 본문을 누르면 상세로 이동하고, 하트로 찜을 토글한다.
 * <ul> 안에서 사용한다.
 */
export function VenuePerformanceItem({
  performance,
  isLiked,
  onToggleLike,
}: VenuePerformanceItemProps) {
  const { id, name, posterUrl, startDate, endDate } = performance;

  return (
    <li className="flex items-center gap-3">
      <Link
        href={`/detail/${id}`}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
          {posterUrl && (
            <Image
              src={posterUrl}
              alt=""
              fill
              sizes="64px"
              className="object-cover"
            />
          )}
        </span>
        <span className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-body1 font-semibold text-foreground">
            {name}
          </span>
          <span className="truncate text-body3 text-muted-foreground">
            {formatPeriod(startDate, endDate)}
          </span>
        </span>
      </Link>
      <HeartButton
        isLiked={isLiked}
        onToggle={onToggleLike}
        size={24}
        className="-mr-2.5 shrink-0"
      />
    </li>
  );
}
