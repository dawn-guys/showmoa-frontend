"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  parseAsNativeArrayOf,
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
} from "nuqs";
import { Header } from "@/app/_components/header";
import { GenreFilterSheet } from "@/shared/components/genre-filter-sheet";
import { RegionFilterDrawer } from "@/shared/components/region-filter-drawer";
import { GENRE_CATEGORIES } from "@/shared/constants/genre";
import { MAX_DISTRICTS, sidoLabel } from "@/shared/constants/region";
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

/** 장르 필터에서 "전체"를 제외하고 고를 수 있는 카테고리 최대 개수. */
const MAX_GENRES = 2;

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

  // 적용된 필터. 새로고침·뒤로가기에도 유지되도록 URL에 저장한다.
  // 검색 API와 같은 이름의 반복 키(?genres=연극&genres=뮤지컬)로 싣는다.
  // 빈 배열이 기본값("전체"·지역 없음)이라 비면 URL에서도 빠진다.
  const [genresParam, setGenres] = useQueryState(
    "genres",
    parseAsNativeArrayOf(parseAsStringLiteral(GENRE_CATEGORIES)),
  );
  // 시/도는 단일 선택이라 배열이지만 원소는 최대 1개다.
  const [areasParam, setAreas] = useQueryState(
    "areas",
    parseAsNativeArrayOf(parseAsString),
  );
  const [districtsParam, setDistricts] = useQueryState(
    "districts",
    parseAsNativeArrayOf(parseAsString),
  );

  // URL을 직접 고쳐 개수를 넘겨도 선택 규칙(장르 2·시/도 1·구/군 3)을 지킨다.
  const genres = genresParam.slice(0, MAX_GENRES);
  const areas = areasParam.slice(0, 1);
  const districts = districtsParam.slice(0, MAX_DISTRICTS);

  // 장르 필터 바텀 시트·지역 필터 드로워 열림 상태(공통 훅으로 히스토리 미누적).
  const [filterOpen, setFilterOpen] = useOverlayFlag("filter");
  const [regionOpen, setRegionOpen] = useOverlayFlag("region-filter");

  // 적용된 필터 칩 라벨. 장르끼리, 지역(시/도·구/군)끼리 공백으로 이어 한 라벨로 만들고
  // 칩은 장르와 지역 사이에만 점(·)을 둔다. "전체"·빈 지역은 빈 문자열이라 칩에 넣지 않는다.
  // 시/도는 URL에 API 값으로 저장돼 있어 칩에는 스펙 표기로 바꿔 보여준다.
  const chipLabels = [
    genres.join(" "),
    [...areas.map(sidoLabel), ...districts].join(" "),
  ].filter(Boolean);

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
    useSearchPerformances({
      keyword: debouncedQuery,
      genres,
      areas,
      districts,
    });

  // 지역 목록은 드로워가 열릴 때만 조회한다.
  const { data: areaList, isPending: isAreasPending } = useAreas(regionOpen);

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
        multiple
        max={MAX_GENRES}
        onApply={setGenres}
      />

      <RegionFilterDrawer
        open={regionOpen}
        onOpenChange={setRegionOpen}
        areas={areaList ?? []}
        isPending={isAreasPending}
        onApply={({ sido, districts }) => {
          // 시/도와 구/군은 한 쌍이라 함께 갈아 끼운다.
          setAreas([sido]);
          setDistricts(districts);
        }}
      />
    </div>
  );
}
