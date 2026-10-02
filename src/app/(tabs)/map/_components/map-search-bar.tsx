"use client";

import { useRef, useState } from "react";
import { Search } from "lucide-react";
import { CloseCircleOutlineIcon } from "@solar-icons/react";

interface MapSearchBarProps {
  /** 돋보기 클릭·Enter 시 확정된 검색어로 극장을 검색한다. */
  onSearch: (query: string) => void;
}

/**
 * 지도 상단의 극장 검색창. 지도 위에 떠 있는 흰색 알약형이며, 포커스가
 * 들어가면 주조색 테두리로 강조된다. 왼쪽 돋보기 클릭 또는 Enter로 검색한다.
 * 입력값이 있을 때만 오른쪽에 지우기 버튼이 나타난다.
 */
export function MapSearchBar({ onSearch }: MapSearchBarProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = value.trim();
    if (query) onSearch(query);
  };

  // 지우기: 입력값만 비우고 포커스는 인풋에 남긴다. 지도는 제출(돋보기/Enter)
  // 시에만 조회하므로, 입력을 비워도 이미 뜬 검색 결과는 그대로 둔다.
  const handleClear = () => {
    setValue("");
    inputRef.current?.focus();
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="group flex h-11 items-center rounded-[14px] border-2 border-[#E6E6E6] bg-white px-1 transition-colors focus-within:border-primary"
    >
      <button
        type="submit"
        aria-label="검색"
        className="flex size-10 shrink-0 items-center justify-center rounded-full text-[#121212] outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Search size={22} />
      </button>
      <input
        ref={inputRef}
        type="search"
        inputMode="search"
        enterKeyHint="search"
        aria-label="극장 검색"
        placeholder="원하시는 지역을 검색해 보세요"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="min-w-0 flex-1 bg-transparent px-1 text-base font-medium text-[#121212] outline-none placeholder:text-[#8a8a8a] [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value && (
        <button
          type="button"
          aria-label="검색어 지우기"
          onClick={handleClear}
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
        >
          <CloseCircleOutlineIcon size={24} />
        </button>
      )}
    </form>
  );
}
