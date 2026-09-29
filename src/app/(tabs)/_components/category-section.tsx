"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  GENRE_FILTER_OPTIONS,
  type GenreFilterOption,
} from "@/shared/constants/genre";
import { useCategoryPerformances } from "../_hooks/useCategoryPerformances";
import { CategoryCard } from "./category-card";

// 2행 가로 스크롤 그리드. 카드가 영역을 넘으면 스와이프로 넘긴다.
const gridClassName =
  "grid grid-flow-col grid-rows-2 auto-cols-[91px] gap-x-[18px] gap-y-5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

/**
 * 공연 카테고리 섹션(로그인·비로그인 공용). 제목 옆 장르 탭을 누르면 해당
 * 장르로 다시 조회한다(선택 상태는 nuqs ?genre=). 카드가 영역을 넘으면
 * 가로 스와이프로 볼 수 있고, 카드를 누르면 상세로 이동한다.
 *
 * 조회에 실패하면 목록 자리를 비워 둔다. docs/spec/home.md에 에러 문구가 없고,
 * 빈 상태 문구를 대신 쓰면 "공연이 없다"는 사실과 다른 안내가 되기 때문이다.
 */
export function CategorySection() {
  const [genre, setGenre] = useQueryState<GenreFilterOption>(
    "genre",
    parseAsStringLiteral(GENRE_FILTER_OPTIONS).withDefault("전체"),
  );
  const { data, isLoading, isError } = useCategoryPerformances(genre);

  const performances = data ?? [];

  return (
    <section
      aria-labelledby="category-heading"
      aria-busy={isLoading}
      className="flex flex-col gap-5"
    >
      <div className="flex items-center gap-3 px-4">
        <h2 id="category-heading" className="shrink-0 text-h1 text-foreground">
          공연 카테고리
        </h2>
        <div
          role="group"
          aria-label="장르 필터"
          className="flex min-w-0 [scrollbar-width:none] gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden"
        >
          {GENRE_FILTER_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={genre === option}
              onClick={() => setGenre(option)}
              className="shrink-0 rounded-sm text-[13px] whitespace-nowrap text-muted-foreground transition-colors outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring aria-pressed:font-medium aria-pressed:text-primary"
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className={gridClassName} aria-hidden>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-4/5 rounded-md" />
              <Skeleton className="h-3 w-1/2 rounded-md" />
            </div>
          ))}
        </div>
      ) : isError ? null : performances.length === 0 ? (
        <p className="px-4 py-6 text-body3 text-muted-foreground">
          해당 카테고리의 공연이 없습니다
        </p>
      ) : (
        <div className={gridClassName}>
          {performances.map((performance) => (
            <CategoryCard key={performance.id} performance={performance} />
          ))}
        </div>
      )}
    </section>
  );
}
