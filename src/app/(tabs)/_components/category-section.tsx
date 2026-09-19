"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  GENRE_FILTER_OPTIONS,
  type GenreFilterOption,
} from "@/shared/constants/genre";
import { useCategoryPerformances } from "../_hooks/useCategoryPerformances";

/**
 * 카테고리별 공연 섹션(자리표시자).
 * 선택된 장르는 nuqs 쿼리 파라미터(?genre=)로 관리하고, 목록 필터링은
 * 클라이언트에서 처리한다. 필터 버튼은 상태 연결 확인용 최소 마크업이다.
 * TODO: 장르 탭 UI와 카드 그리드(가로 슬라이드) 구현, 카드 클릭 시 /detail/:id.
 */
export function CategorySection() {
  const { data, isLoading } = useCategoryPerformances();
  const [genre, setGenre] = useQueryState<GenreFilterOption>(
    "genre",
    parseAsStringLiteral(GENRE_FILTER_OPTIONS).withDefault("전체"),
  );

  const filtered =
    genre === "전체"
      ? (data ?? [])
      : (data ?? []).filter((p) => p.genre === genre);

  return (
    <section
      aria-labelledby="category-heading"
      aria-busy={isLoading}
      className="px-4"
    >
      <h2 id="category-heading" className="mb-4 text-h1 text-foreground">
        공연 카테고리
      </h2>

      {/* 최소 필터 컨트롤(nuqs 연결 확인용) */}
      <div
        role="tablist"
        aria-label="장르 필터"
        className="mb-4 flex flex-wrap gap-2"
      >
        {GENRE_FILTER_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={genre === option}
            onClick={() => setGenre(option)}
            className="rounded-full px-3 py-1 text-body3 text-muted-foreground aria-selected:text-primary"
          >
            {option}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3" aria-hidden>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border p-4 text-body3 text-muted-foreground">
          [카테고리] {genre} · {filtered.length}개
        </div>
      )}
    </section>
  );
}
