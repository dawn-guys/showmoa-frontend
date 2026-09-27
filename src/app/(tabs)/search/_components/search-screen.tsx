"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { Header } from "@/app/_components/header";
import { GenreFilterSheet } from "@/shared/components/genre-filter-sheet";
import { RegionFilterDrawer } from "@/shared/components/region-filter-drawer";
import { GENRE_FILTER_OPTIONS } from "@/shared/constants/genre";
import { formatRegionLabel } from "@/shared/constants/region";
import { useDebouncedCallback } from "@/shared/hooks/useDebouncedCallback";
import { useOverlayFlag } from "@/shared/hooks/useOverlayFlag";
import { useAreas } from "../_hooks/useAreas";
import { useSearchPerformances } from "../_hooks/useSearchPerformances";
import { SearchBar } from "./search-bar";
import { SearchFilterBar } from "./search-filter-bar";
import { SearchFilterChip } from "./search-filter-chip";
import { SearchResultList } from "./search-result-list";

/** 인풋 onChange 디바운스 지연(ms). 마지막 입력 뒤 이 시간이 지나면 검색한다. */
const SEARCH_DEBOUNCE_MS = 300;

/** 헤더↔검색창 전환에 쓰는 부드러운 전환(검색창과 동일 값). */
const TRANSITION = { duration: 0.3, ease: [0.22, 1, 0.36, 1] } as const;

/**
 * 검색 화면 본문. 검색창에 포커스가 들어가면 헤더가 사라지고 검색창이
 * 그 자리로 올라오는 검색 모드로 전환된다(뒤로가기 화살표로 복귀).
 * 장르 필터 버튼으로 바텀 시트를 열어 장르를 선택하며, 적용된 필터는
 * 칩으로 노출한다. 인풋 값이 바뀔 때마다 디바운스로 확정된 검색어와 장르·지역
 * 필터를 공연 검색 API에 보내 결과 목록으로 보여준다.
 */
export function SearchScreen() {
  // 검색 모드(포커스) 여부. 인풋 포커스로 진입, 뒤로가기 화살표로 이탈한다.
  const [active, setActive] = useState(false);
  // 인풋에 입력 중인 검색어(제어 컴포넌트).
  const [query, setQuery] = useState("");
  // 디바운스가 끝난 뒤 확정되는 검색어. 결과 목록은 이 값으로 계산한다.
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // 적용된 장르 필터. 새로고침·뒤로가기에도 유지되도록 URL에 저장한다.
  const [genre, setGenre] = useQueryState(
    "genre",
    parseAsStringLiteral(GENRE_FILTER_OPTIONS).withDefault("전체"),
  );

  // 적용된 지역 필터(선택 경로 한 줄 문자열). 새로고침에도 유지되도록 URL에 저장한다.
  const [region, setRegion] = useQueryState(
    "region",
    parseAsString.withDefault(""),
  );

  // 장르 필터 바텀 시트·지역 필터 드로워 열림 상태(공통 훅으로 히스토리 미누적).
  const [filterOpen, setFilterOpen] = useOverlayFlag("filter");
  const [regionOpen, setRegionOpen] = useOverlayFlag("region-filter");

  // 적용된 필터 칩 라벨(장르·지역). "전체"·빈 지역은 필터가 없는 상태라 칩에 넣지 않는다.
  // 지역은 URL에 API 값으로 저장돼 있어 칩에는 스펙 표기로 바꿔 보여준다.
  const chipLabels = [
    genre === "전체" ? null : genre,
    region ? formatRegionLabel(region) : null,
  ].filter((label): label is string => label !== null);

  // 인풋 onChange를 디바운스해 검색어를 확정한다(util로 뺀 디바운스 훅 사용).
  const debouncedSearch = useDebouncedCallback(
    setDebouncedQuery,
    SEARCH_DEBOUNCE_MS,
  );

  const handleChange = (value: string) => {
    setQuery(value); // 인풋은 즉시 반영(제어 컴포넌트)
    debouncedSearch.run(value); // 결과 계산은 디바운스
  };

  // 돋보기/Enter로 검색하면 대기 중인 디바운스를 건너뛰고 즉시 확정한다.
  const handleSubmit = () => debouncedSearch.flush();

  // 확정된 검색어와 장르·지역 필터로 공연을 검색한다(무한 스크롤).
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSearchPerformances({ keyword: debouncedQuery, genre, region });

  // 지역 목록은 드로워가 열릴 때만 조회한다.
  const { data: areas, isPending: isAreasPending } = useAreas(regionOpen);

  // 페이지들을 이어 붙여 하나의 목록으로 만든다.
  const results = data?.pages.flatMap((page) => page.content) ?? [];

  return (
    <div className="relative">
      {/* 헤더. 검색 모드로 진입하면 사라지고 그 자리로 검색창이 올라온다.
          popLayout으로 헤더가 흐름에서 빠지는 즉시 아래 검색창이 layout
          애니메이션으로 위로 미끄러진다. main을 위에 겹쳐(z-10) 검색창이
          사라지는 헤더를 덮으며 올라오도록 한다. */}
      <AnimatePresence initial={false} mode="popLayout">
        {!active && (
          <motion.div
            key="header"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={TRANSITION}
          >
            <Header />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 flex flex-col gap-4 bg-background px-4 pt-5 pb-safe-nav">
        {/* 화면의 대표 제목. 디자인상 노출되지 않아 보조기기 전용으로 둔다. */}
        <h1 className="sr-only">공연 검색</h1>
        <SearchBar
          active={active}
          onActivate={() => setActive(true)}
          onDeactivate={() => setActive(false)}
          value={query}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />

        {active ? (
          // 검색 모드: 필터 버튼 영역은 감추고 적용된 필터 칩과 결과 목록을 노출한다.
          <>
            {chipLabels.length > 0 && (
              <SearchFilterChip labels={chipLabels} className="self-start" />
            )}
            <SearchResultList
              results={results}
              isLoading={isLoading}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={fetchNextPage}
            />
          </>
        ) : (
          <SearchFilterBar
            chipLabels={chipLabels}
            onOpenGenre={() => setFilterOpen(true)}
            onOpenRegion={() => setRegionOpen(true)}
          />
        )}
      </main>

      <GenreFilterSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        onApply={setGenre}
      />

      <RegionFilterDrawer
        open={regionOpen}
        onOpenChange={setRegionOpen}
        areas={areas ?? []}
        isPending={isAreasPending}
        onApply={setRegion}
      />
    </div>
  );
}
