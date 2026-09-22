"use client";

import { useMemo, useState } from "react";
import { parseAsBoolean, useQueryState } from "nuqs";
import { HamburgerMenuLinearIcon } from "@solar-icons/react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { GenreFilterOption } from "@/shared/constants/genre";
import type { PerformanceStatus } from "@/app/(tabs)/_types";
import { useWishlist } from "../_hooks/useWishlist";

// 목록 정렬 우선순위. 낮을수록 위로 온다.
// 같은 상태 안에서는 원본(최신 추가) 순서를 그대로 유지한다.
const STATUS_ORDER: Record<PerformanceStatus, number> = {
  ongoing: 0, // 상영 중
  upcoming: 1, // 상영 예정
  ended: 2, // 상영 종료(항상 마지막)
};
import { GenreFilterSheet } from "@/shared/components/genre-filter-sheet";
import { WishlistItem } from "./wishlist-item";
import { WishlistSearch } from "./wishlist-search";

/**
 * 찜-로그인 화면 본문. 좋아요한 공연 목록과 함께 장르 필터(바텀 시트)와
 * 제목 검색을 제공한다. 하트로 목록에서 제외할 수 있고, 종료 공연도 노출한다.
 */
export function WishlistLikedView() {
  const { data, isLoading } = useWishlist();

  // 적용된 장르 필터. 제목 옆에 현재 상태로 표시된다.
  const [genre, setGenre] = useState<GenreFilterOption>("전체");
  // 하트로 제외한 공연 id. 목록에서 즉시 감춘다(Phase 1 로컬 상태).
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  // 검색으로 확정된 질의어. 돋보기/Enter로 커밋한다.
  const [query, setQuery] = useState("");

  // 바텀 시트 열림 상태를 URL에 저장해 뒤로가기로 닫을 수 있게 한다.
  const [filterOpen, setFilterOpen] = useQueryState(
    "filter",
    parseAsBoolean.withDefault(false).withOptions({ history: "push" }),
  );

  const liked = useMemo(
    () => (data ?? []).filter((p) => !removedIds.has(p.id)),
    [data, removedIds],
  );

  const filtered = useMemo(
    () =>
      liked
        .filter((p) => genre === "전체" || p.genre === genre)
        .filter((p) => query === "" || p.title.includes(query))
        // 상태 순으로 안정 정렬(종료는 맨 뒤). 같은 상태 내 최신 추가 순 유지.
        .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]),
    [liked, genre, query],
  );

  const handleRemove = (id: string) => {
    setRemovedIds((prev) => new Set(prev).add(id));
  };

  const isEmpty = !isLoading && liked.length === 0;
  const isFilteredEmpty =
    !isLoading && liked.length > 0 && filtered.length === 0;

  return (
    <div className="flex min-h-[calc(100dvh-5rem-var(--spacing-bottom-nav))] flex-col gap-3.75 px-4">
      {/* 제목 / 카테고리(현재 필터) / 필터 버튼. 헤더처럼 앱 컬럼 폭을 꽉 채우는
          40px 밴드라 본문 좌우 여백(px-4)을 상쇄(-mx-4)하고 자체 여백을 준다.
          우측 pr는 30px 아이콘의 시각적 오른쪽 끝을 16px 라인에 맞추기 위해 9px. */}
      <div className="-mx-4 flex h-10 items-center gap-[18px] border-b-2 border-[#292929] pr-[9px] pl-4">
        {/* 제목: 40px 밴드 바닥에 주조색 밑줄이 붙는다(텍스트는 세로 중앙). */}
        <h1 className="-mb-0.5 inline-flex items-center self-stretch border-b-2 border-primary text-body1 font-medium text-foreground">
          좋아요 한 공연
        </h1>
        <p className="text-body1 font-medium text-disabled">{genre}</p>
        <button
          type="button"
          aria-label="장르 필터 열기"
          aria-haspopup="dialog"
          onClick={() => setFilterOpen(true)}
          className="ml-auto flex size-11 items-center justify-center rounded-full text-foreground outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring active:bg-muted"
        >
          <HamburgerMenuLinearIcon size={30} />
        </button>
      </div>

      {/* 제목 검색 */}
      <WishlistSearch onSearch={setQuery} />

      {/* 좋아요한 공연 목록 */}
      <section
        aria-label="좋아요한 공연 목록"
        aria-busy={isLoading}
        className="flex flex-1 flex-col"
      >
        {isLoading ? (
          // 로딩 스켈레톤: 검색창 아래 가로 꽉 찬 단일 블록(Figma 참조).
          <Skeleton className="h-[50px] w-full rounded-[5px]" aria-hidden />
        ) : isEmpty ? (
          // 빈 상태 문구는 검색창과 하단 나브 사이 영역 중앙에 둔다.
          <p className="text-4.5 m-auto text-center text-muted-foreground">
            좋아요 한 공연이 없습니다
          </p>
        ) : isFilteredEmpty ? (
          <p className="text-4.5 m-auto text-center text-muted-foreground">
            검색 결과가 없습니다
          </p>
        ) : (
          <ul className="flex flex-col gap-3.5">
            {filtered.map((performance) => (
              <WishlistItem
                key={performance.id}
                performance={performance}
                onRemove={() => handleRemove(performance.id)}
              />
            ))}
          </ul>
        )}
      </section>

      <GenreFilterSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        onApply={setGenre}
      />
    </div>
  );
}
