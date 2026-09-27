"use client";

import { useCallback } from "react";
import type { PerformanceListResponse } from "@/app/(tabs)/_types";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { SearchResultItem } from "./search-result-item";

interface SearchResultListProps {
  /** 지금까지 불러온 검색 결과(페이지들을 이어 붙인 것). */
  results: PerformanceListResponse[];
  /** 첫 페이지 조회 중 여부. 목록 대신 로딩 스피너를 보여준다. */
  isLoading: boolean;
  /** 다음 페이지가 남아 있는지. 남아 있으면 목록 끝에 로딩 영역을 둔다. */
  hasNextPage: boolean;
  /** 다음 페이지 조회 중 여부. 조회 중에는 스피너를 보여주고 감지를 멈춘다. */
  isFetchingNextPage: boolean;
  /** 로딩 영역이 화면에 가까워지면 호출된다. */
  onLoadMore: () => void;
}

/**
 * 바닥에 닿기 전에 미리 불러오는 거리. 스크롤이 목록 끝에서 멈춰 기다리지 않도록
 * 화면 한 장 정도 앞에서 다음 페이지를 요청한다.
 */
const PREFETCH_ROOT_MARGIN = "400px";

/**
 * 목록 끝의 로딩 영역. 감지 요소와 스피너 자리를 하나로 합쳤다. 스피너는 항상
 * 자리를 차지한 채 조회 중이 아닐 때만 숨겨(invisible) 행 높이가 스피너 높이로
 * 늘 같게 유지된다. 그래서 스피너가 나타나고 사라져도 목록 높이가 변하지 않아
 * 스크롤이 튀지 않는다.
 *
 * 조회 중에는 옵저버를 끊어 같은 페이지를 두 번 요청하지 않는다. 요소 자체는
 * 계속 붙어 있어 언마운트로 인한 높이 변화가 없고, 조회가 끝나면 옵저버가 다시
 * 붙어 아직 화면에 걸쳐 있으면 이어서 다음 페이지를 불러온다.
 */
function LoadMoreFooter({
  onIntersect,
  isFetching,
}: {
  onIntersect: () => void;
  isFetching: boolean;
}) {
  const attach = useCallback(
    (node: HTMLLIElement | null) => {
      if (!node || isFetching) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) onIntersect();
        },
        { rootMargin: PREFETCH_ROOT_MARGIN },
      );
      observer.observe(node);

      return () => observer.disconnect();
    },
    [onIntersect, isFetching],
  );

  return (
    <li
      ref={attach}
      // 조회 중이 아닐 때는 숨은 자리라 보조기기 목록에서 감춘다.
      aria-hidden={isFetching ? undefined : true}
      className="flex shrink-0 items-center justify-center"
    >
      <LoadingSpinner
        label="검색 결과 더 불러오는 중"
        className={isFetching ? undefined : "invisible"}
      />
    </li>
  );
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
    return (
      <div className="mt-5 flex justify-center">
        <LoadingSpinner label="검색 결과 불러오는 중" />
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
        />
      )}
    </ul>
  );
}
