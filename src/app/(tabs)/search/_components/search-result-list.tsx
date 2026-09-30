"use client";

import type { PerformanceListResponse } from "@/app/(tabs)/_types";
import { LoadMoreFooter } from "@/shared/components/load-more-footer";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { SearchResultItem } from "./search-result-item";

interface SearchResultListProps {
  /** 지금까지 불러온 검색 결과(페이지들을 이어 붙인 것). */
  results: PerformanceListResponse[];
  /** 첫 페이지 조회 중 여부. 목록 대신 스켈레톤 바를 보여준다. */
  isLoading: boolean;
  /** 다음 페이지가 남아 있는지. 남아 있으면 목록 끝에 로딩 영역을 둔다. */
  hasNextPage: boolean;
  /** 다음 페이지 조회 중 여부. 조회 중에는 스피너를 보여주고 감지를 멈춘다. */
  isFetchingNextPage: boolean;
  /** 로딩 영역이 화면에 가까워지면 호출된다. */
  onLoadMore: () => void;
}

/**
 * 검색 결과 목록. 확정된 검색어로 조회한 결과를 세로 리스트로 보여주고,
 * 바닥에 닿기 전에 다음 페이지를 미리 이어 붙인다. 결과가 없으면 아무것도
 * 렌더하지 않는다(검색 스펙에 빈 결과 문구가 없다).
 */
export function SearchResultList({
  results,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: SearchResultListProps) {
  if (isLoading) {
    // 검색 결과 자리에 스켈레톤 바 한 줄을 둔다(스피너 대신, 피그마 기준).
    return (
      <div className="mt-5" aria-busy="true">
        <Skeleton className="h-[50px] w-full rounded-[5px]" aria-hidden />
      </div>
    );
  }

  if (results.length === 0) return null;

  return (
    <ul className="mt-5 flex flex-col gap-6">
      {results.map((performance) => (
        <SearchResultItem key={performance.id} performance={performance} />
      ))}

      {hasNextPage && (
        <LoadMoreFooter
          onIntersect={onLoadMore}
          isFetching={isFetchingNextPage}
          label="검색 결과 더 불러오는 중"
        />
      )}
    </ul>
  );
}
