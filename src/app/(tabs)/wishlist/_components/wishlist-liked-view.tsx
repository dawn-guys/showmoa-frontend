"use client";

import { useEffect, useMemo, useState } from "react";
import { HamburgerMenuLinearIcon } from "@solar-icons/react";
import { GenreFilterSheet } from "@/shared/components/genre-filter-sheet";
import { LoadMoreFooter } from "@/shared/components/load-more-footer";
import { AnimatedToast } from "@/shared/components/toast";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  GENRE_API_VALUES,
  type GenreFilterOption,
} from "@/shared/constants/genre";
import { useOverlayFlag } from "@/shared/hooks/useOverlayFlag";
import { useRemoveWishlist } from "../_hooks/useRemoveWishlist";
import { useWishlist } from "../_hooks/useWishlist";
import { WishlistItem } from "./wishlist-item";
import { WishlistSearch } from "./wishlist-search";

/** 찜 해제 실패 토스트가 떠 있는 시간(ms). 상세 화면과 같은 길이로 맞춘다. */
const TOAST_DURATION_MS = 2500;

/** 찜 해제 요청이 실패했을 때의 문구. 상세 화면 좋아요 실패와 같은 문구다. */
const REMOVE_ERROR = "네트워크 문제가 생겼습니다. 다시 시도해 주세요";

/**
 * 찜-로그인 화면 본문. 좋아요한 공연 목록과 함께 장르 필터(바텀 시트)와
 * 제목 검색을 제공한다. 하트로 찜을 해제할 수 있고, 종료 공연도 노출한다.
 *
 * 목록 순서는 서버가 준 그대로 쓴다(미종료 먼저 · 종료 나중 · 최근 찜순).
 * 장르와 제목은 서버가 필터 파라미터를 받지 않아 클라이언트에서 거른다.
 */
export function WishlistLikedView() {
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useWishlist();
  const {
    mutate: removeWishlist,
    isError: isRemoveError,
    reset: resetRemove,
  } = useRemoveWishlist();

  // 적용된 장르 필터. 제목 옆에 현재 상태로 표시된다.
  const [genre, setGenre] = useState<GenreFilterOption>("전체");
  // 검색으로 확정된 질의어. 돋보기/Enter로 커밋한다.
  const [query, setQuery] = useState("");

  // 바텀 시트 열림 상태(공통 훅으로 히스토리 미누적).
  const [filterOpen, setFilterOpen] = useOverlayFlag("filter");

  // 실패 토스트는 잠시 후 스스로 사라진다. 뮤테이션 상태를 되돌려 닫는다.
  useEffect(() => {
    if (!isRemoveError) return;
    const timer = setTimeout(resetRemove, TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [isRemoveError, resetRemove]);

  const liked = useMemo(() => {
    const pages = data?.pages.flatMap((page) => page.content) ?? [];
    // 스크롤 도중 찜 해제로 페이지 경계가 밀리면 같은 공연이 두 번 올 수 있다.
    // 계약이 공연 id로 프론트가 dedupe하는 것을 전제한다.
    return [
      ...new Map(pages.map((item) => [item.performanceId, item])).values(),
    ];
  }, [data]);

  const filtered = useMemo(
    () =>
      liked
        .filter(
          (item) => genre === "전체" || item.genre === GENRE_API_VALUES[genre],
        )
        .filter((item) => query === "" || item.name.includes(query)),
    [liked, genre, query],
  );

  const isEmpty = !isLoading && !isError && liked.length === 0;
  const isFilteredEmpty =
    !isLoading && !isError && liked.length > 0 && filtered.length === 0;

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
        ) : isError ? (
          // 조회 실패: 빈 상태와 같은 자리에 안내 문구를 둔다(지도 실패와 같은 결).
          <p
            role="alert"
            className="text-4.5 m-auto text-center text-muted-foreground"
          >
            좋아요 한 공연을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요
          </p>
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
                key={performance.performanceId}
                performance={performance}
                onRemove={() => removeWishlist(performance.performanceId)}
              />
            ))}

            {hasNextPage && (
              <LoadMoreFooter
                onIntersect={fetchNextPage}
                isFetching={isFetchingNextPage}
                label="좋아요 한 공연 더 불러오는 중"
              />
            )}
          </ul>
        )}
      </section>

      <GenreFilterSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        onApply={setGenre}
      />

      {/* 찜 해제 실패 토스트 */}
      <AnimatedToast
        open={isRemoveError}
        message={REMOVE_ERROR}
        variant="error"
      />
    </div>
  );
}
