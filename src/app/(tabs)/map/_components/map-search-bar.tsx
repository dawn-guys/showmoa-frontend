"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { LoadingSpinner } from "@/shared/components/loading-spinner";

interface MapSearchBarProps {
  /** 돋보기 클릭·Enter 시 확정된 검색어로 극장을 검색한다. */
  onSearch: (query: string) => void;
  /** 검색 요청 진행 중 여부(스피너 노출). */
  searching: boolean;
}

/**
 * 지도 상단의 극장 검색창. 지도 위에 떠 있는 흰색 알약형이며, 포커스가
 * 들어가면 주조색 테두리로 강조된다. 돋보기 클릭 또는 Enter로 검색한다.
 */
export function MapSearchBar({ onSearch, searching }: MapSearchBarProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = value.trim();
    if (query) onSearch(query);
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="group flex h-11 items-center gap-1 rounded-[14px] border-2 border-[#E6E6E6] bg-white pr-1 pl-3.75 transition-colors focus-within:border-primary"
    >
      <input
        type="search"
        inputMode="search"
        enterKeyHint="search"
        aria-label="극장 검색"
        placeholder="원하시는 지역을 검색해 보세요"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="min-w-0 flex-1 bg-transparent text-base font-medium text-[#121212] outline-none placeholder:text-[#8a8a8a] [&::-webkit-search-cancel-button]:appearance-none"
      />
      <button
        type="submit"
        aria-label="검색"
        disabled={searching}
        className="flex size-10 shrink-0 items-center justify-center rounded-full text-[#121212] outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed"
      >
        {searching ? (
          <LoadingSpinner size={22} label="검색 중" />
        ) : (
          <Search size={22} />
        )}
      </button>
    </form>
  );
}
