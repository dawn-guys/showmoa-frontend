"use client";

import { Skeleton } from "@/shared/components/ui/skeleton";
import { useTodayPerformances } from "../_hooks/useTodayPerformances";

/**
 * 오늘 캘린더 공연 섹션(자리표시자, 로그인 전용).
 * TODO: 제목 옆 /calendar 이동 아이콘, 가로 슬라이드 카드 목록 구현.
 * 콘텐츠가 없으면 빈 상태 문구를 노출한다.
 */
export function TodaySection() {
  const { data, isLoading } = useTodayPerformances();
  const isEmpty = !isLoading && (data?.length ?? 0) === 0;

  return (
    <section aria-label="오늘의 공연" aria-busy={isLoading} className="px-4">
      {isLoading ? (
        <Skeleton className="h-40 w-full rounded-xl" aria-hidden />
      ) : isEmpty ? (
        <p className="text-body3 text-muted-foreground">
          오늘 공연 일정이 없습니다
        </p>
      ) : (
        <div className="rounded-xl border border-border p-4 text-body3 text-muted-foreground">
          [오늘의 공연] {data?.length ?? 0}개
        </div>
      )}
    </section>
  );
}
