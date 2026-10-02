"use client";

import { useRef, useState } from "react";
import { Search } from "lucide-react";
import { CloseCircleOutlineIcon } from "@solar-icons/react";
import { useDebouncedCallback } from "@/shared/hooks/useDebouncedCallback";

interface WishlistSearchProps {
  /** 확정된 검색어로 목록을 필터링한다. */
  onSearch: (query: string) => void;
}

/** onChange 후 검색을 실행하기까지의 디바운스 지연(ms). */
const DEBOUNCE_MS = 300;

/**
 * 찜 목록 제목 검색창. 입력이 바뀔 때마다 디바운스를 걸어 검색을 실행한다.
 * 돋보기 클릭·Enter는 대기 중인 디바운스를 건너뛰고 즉시 반영한다.
 * 포커스가 들어가면 테두리와 아이콘을 주조색/밝은 색으로 강조한다.
 */
export function WishlistSearch({ onSearch }: WishlistSearchProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const search = useDebouncedCallback(onSearch, DEBOUNCE_MS);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setValue(next);
    search.run(next.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    // 폼 기본 새로고침을 막고, 대기 중인 디바운스를 건너뛰어 즉시 검색한다.
    e.preventDefault();
    search.cancel();
    onSearch(value.trim());
  };

  // 지우기: 값을 비우고 대기 중인 디바운스를 취소한 뒤 즉시 전체 목록으로
  // 되돌린다(제출과 같은 즉시 반영). 포커스는 인풋에 남긴다.
  const handleClear = () => {
    setValue("");
    search.cancel();
    onSearch("");
    inputRef.current?.focus();
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="group mb-3.75 flex h-[42px] items-center rounded-[5px] border-2 border-[#292929] bg-[#2C2C2E] transition-colors focus-within:border-primary"
    >
      {/* 돋보기: 기본은 흐린 색, 포커스가 들어가면 밝게(주조 테두리와 함께) 강조. */}
      <button
        type="submit"
        aria-label="검색"
        className="flex size-[42px] shrink-0 items-center justify-center rounded-l-[5px] text-muted-foreground transition-colors outline-none group-focus-within:text-foreground hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Search size={18} />
      </button>
      <input
        ref={inputRef}
        type="search"
        inputMode="search"
        enterKeyHint="search"
        aria-label="공연 제목 검색"
        placeholder="공연 제목을 검색해 주세요"
        value={value}
        onChange={handleChange}
        className="min-w-0 flex-1 bg-transparent pr-1 text-base font-medium text-foreground outline-none placeholder:text-disabled [&::-webkit-search-cancel-button]:appearance-none"
      />
      {/* 지우기: 값이 있을 때만 오른쪽에 노출. 누르면 값을 비우고 포커스 유지. */}
      {value && (
        <button
          type="button"
          aria-label="검색어 지우기"
          onClick={handleClear}
          className="flex size-[42px] shrink-0 items-center justify-center rounded-r-[5px] text-muted-foreground outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
        >
          <CloseCircleOutlineIcon size={24} />
        </button>
      )}
    </form>
  );
}
