import { DocumentTextLinearIcon, HeartsLinearIcon } from "@solar-icons/react";
import { SearchFilterChip } from "./search-filter-chip";

interface SearchFilterBarProps {
  /** 적용된 필터 라벨(장르·지역). 있으면 버튼 아래에 칩으로 노출한다. */
  chipLabels: string[];
  /** 장르 필터 바텀 시트를 연다. */
  onOpenGenre: () => void;
  /** 지역 필터 드로워를 연다. */
  onOpenRegion: () => void;
}

/** 필터 버튼 공통 스타일(장르·지역). */
const filterButtonClassName =
  "flex h-[38px] flex-1 items-center justify-center gap-1.5 rounded-[5px] bg-[#2C2C2E] text-body2 font-medium text-foreground transition-colors outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring active:bg-white/10";

/**
 * 검색 필터링 버튼 영역. 장르·지역 필터 버튼을 제공하고, 필터가 적용돼
 * 있으면 버튼 아래에 적용된 필터를 칩으로 보여준다. 검색창에 포커스가
 * 들어가기 전(기본 상태)에만 노출된다.
 */
export function SearchFilterBar({
  chipLabels,
  onOpenGenre,
  onOpenRegion,
}: SearchFilterBarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-[5px] border-2 border-[#2C2C2E] p-4">
      <h2 className="text-body2 font-medium text-foreground">검색 필터링</h2>

      <div className="flex items-center gap-[11px]">
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={onOpenGenre}
          className={filterButtonClassName}
        >
          <HeartsLinearIcon size={18} className="text-primary" />
          장르 필터
        </button>
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={onOpenRegion}
          className={filterButtonClassName}
        >
          <DocumentTextLinearIcon size={18} className="text-primary" />
          지역 필터
        </button>
      </div>

      {/* 적용된 필터가 있으면 칩으로 표시한다. */}
      {chipLabels.length > 0 && (
        <SearchFilterChip labels={chipLabels} className="self-start" />
      )}
    </div>
  );
}
