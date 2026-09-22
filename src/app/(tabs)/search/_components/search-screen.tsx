"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  parseAsBoolean,
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
} from "nuqs";
import { Header } from "@/app/_components/header";
import { GenreFilterSheet } from "@/shared/components/genre-filter-sheet";
import { RegionFilterDrawer } from "@/shared/components/region-filter-drawer";
import { GENRE_FILTER_OPTIONS } from "@/shared/constants/genre";
import { SearchBar } from "./search-bar";
import { SearchFilterBar } from "./search-filter-bar";
import { SearchFilterChip } from "./search-filter-chip";

/** 헤더↔검색창 전환에 쓰는 부드러운 전환(검색창과 동일 값). */
const TRANSITION = { duration: 0.3, ease: [0.22, 1, 0.36, 1] } as const;

/**
 * 검색 화면 본문. 검색창에 포커스가 들어가면 헤더가 사라지고 검색창이
 * 그 자리로 올라오는 검색 모드로 전환된다(뒤로가기 화살표로 복귀).
 * 장르 필터 버튼으로 바텀 시트를 열어 장르를 선택하며, 적용된 필터는
 * 칩으로 노출한다. 검색 결과 목록은 디자인 확정 후 후속 작업이다.
 */
export function SearchScreen() {
  // 검색 모드(포커스) 여부. 인풋 포커스로 진입, 뒤로가기 화살표로 이탈한다.
  const [active, setActive] = useState(false);
  // 인풋에 입력 중인 검색어(제어 컴포넌트).
  const [query, setQuery] = useState("");

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

  // 장르 필터 바텀 시트 열림 상태를 URL에 저장해 뒤로가기로 닫을 수 있게 한다.
  const [filterOpen, setFilterOpen] = useQueryState(
    "filter",
    parseAsBoolean.withDefault(false).withOptions({ history: "push" }),
  );

  // 지역 필터 드로워 열림 상태도 URL에 저장해 뒤로가기로 닫을 수 있게 한다.
  const [regionOpen, setRegionOpen] = useQueryState(
    "region-filter",
    parseAsBoolean.withDefault(false).withOptions({ history: "push" }),
  );

  // 적용된 필터 칩 라벨(장르·지역). "전체"·빈 지역은 필터가 없는 상태라 칩에 넣지 않는다.
  const chipLabels = [genre === "전체" ? null : genre, region || null].filter(
    (label): label is string => label !== null,
  );

  const handleSubmit = () => {
    // Phase 1: 검색 결과 목록 디자인 확정 전이라 질의 확정만 담당한다.
  };

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
          onChange={setQuery}
          onSubmit={handleSubmit}
        />

        {active ? (
          // 검색 모드: 필터 버튼 영역은 감추고 적용된 필터만 칩으로 노출한다.
          chipLabels.length > 0 && (
            <SearchFilterChip labels={chipLabels} className="self-start" />
          )
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
        onApply={setRegion}
      />
    </div>
  );
}
