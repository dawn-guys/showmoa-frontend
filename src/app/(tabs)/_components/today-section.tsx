"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useTodayPerformances } from "../_hooks/useTodayPerformances";
import {
  HorizontalPerformanceList,
  HorizontalPerformanceListSkeleton,
} from "./horizontal-performance-list";

/**
 * 오늘 캘린더 공연 섹션(로그인 전용). 제목 옆 화살표로 /calendar 이동,
 * 카드가 폭을 넘으면 가로 스와이프. 목록이 비면 빈 상태 문구를 노출한다.
 */
export function TodaySection() {
  const { data, isLoading } = useTodayPerformances();
  const isEmpty = !isLoading && (data?.length ?? 0) === 0;

  return (
    <section
      className="mt-2.5"
      aria-labelledby="today-heading"
      aria-busy={isLoading}
    >
      <div className="mb-4 flex items-center justify-between px-4">
        <h2 id="today-heading" className="text-h1 text-foreground">
          오늘 나의 공연
        </h2>
        <Link
          href="/calendar"
          aria-label="오늘 나의 공연 전체 보기"
          className="-mr-1 flex size-8 items-center justify-center rounded-full text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring active:bg-muted"
        >
          <ChevronRight size={20} />
        </Link>
      </div>

      {isLoading ? (
        <HorizontalPerformanceListSkeleton />
      ) : isEmpty ? (
        <p className="px-4 py-10 text-center text-body3 text-muted-foreground">
          오늘 공연 일정이 없습니다
        </p>
      ) : (
        <HorizontalPerformanceList
          items={data ?? []}
          label="오늘 나의 공연 목록"
        />
      )}
    </section>
  );
}
