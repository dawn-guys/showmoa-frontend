"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useLikedPerformances } from "../_hooks/useLikedPerformances";
import {
  HorizontalPerformanceList,
  HorizontalPerformanceListSkeleton,
} from "./horizontal-performance-list";

/**
 * 좋아요한 공연 섹션(로그인 전용). 제목 옆 화살표로 /wishlist 이동,
 * 카드가 폭을 넘으면 가로 스와이프. 목록이 비면 빈 상태 문구를 노출한다.
 *
 * 조회에 실패하면 목록 자리를 비워 둔다. docs/spec/home.md에 에러 문구가 없고,
 * 빈 상태 문구를 대신 쓰면 "좋아요한 공연이 없다"는 사실과 다른 안내가 되기 때문이다.
 */
export function LikedSection() {
  const { data, isLoading, isError } = useLikedPerformances();
  const isEmpty = !isLoading && !isError && (data?.length ?? 0) === 0;

  return (
    <section aria-labelledby="liked-heading" aria-busy={isLoading}>
      <div className="mb-4 flex items-center justify-between px-4">
        <h2 id="liked-heading" className="text-h1 text-foreground">
          내가 좋아요한 공연
        </h2>
        <Link
          href="/wishlist"
          aria-label="좋아요한 공연 전체 보기"
          className="-mr-1 flex size-8 items-center justify-center rounded-full text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring active:bg-muted"
        >
          <ChevronRight size={20} />
        </Link>
      </div>

      {isLoading ? (
        <HorizontalPerformanceListSkeleton />
      ) : isError ? null : isEmpty ? (
        <p className="px-4 py-10 text-center text-body3 text-muted-foreground">
          좋아요 한 공연이 없습니다
        </p>
      ) : (
        <HorizontalPerformanceList
          items={data ?? []}
          label="좋아요한 공연 목록"
        />
      )}
    </section>
  );
}
