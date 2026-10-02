"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, Search } from "lucide-react";
import { CloseCircleOutlineIcon } from "@solar-icons/react";

interface SearchBarProps {
  /** 검색 모드(포커스) 여부. 켜지면 앞에 뒤로가기 화살표가 나타난다. */
  active: boolean;
  /** 인풋에 포커스가 들어와 검색 모드로 진입한다. */
  onActivate: () => void;
  /** 뒤로가기 화살표로 검색 모드를 빠져나간다. */
  onDeactivate: () => void;
  /** 인풋 값(제어 컴포넌트). */
  value: string;
  /** 인풋 값 변경. */
  onChange: (value: string) => void;
  /** 검색 실행(돋보기/Enter). */
  onSubmit: () => void;
}

/** 포커스 진입/이탈 시 공통으로 쓰는 부드러운 전환. */
const TRANSITION = { duration: 0.3, ease: [0.22, 1, 0.36, 1] } as const;

/**
 * 공연 검색창. 인풋에 포커스가 들어가면(active) 검색 모드로 바뀌며 앞에
 * 뒤로가기 화살표가 나타나고, 화살표를 누르면 인풋 포커스를 풀고 이전
 * 상태로 돌아간다. active 전환에 따른 레이아웃 변화는 Motion layout으로
 * 부드럽게 이어진다. 포커스가 들어가면 테두리가 주조색으로 강조된다.
 */
export function SearchBar({
  active,
  onActivate,
  onDeactivate,
  value,
  onChange,
  onSubmit,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleBack = () => {
    // 인풋 포커스를 먼저 풀어 모바일 키보드를 내리고, 검색 모드를 종료한다.
    inputRef.current?.blur();
    onDeactivate();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  // 지우기: 값만 비우고 포커스는 인풋에 남긴다(검색 모드 유지). 값이 바뀌면
  // 디바운스로 결과가 다시 계산되는 기존 동작을 그대로 따른다.
  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  return (
    // layoutDependency: 검색창이 상단에 붙은(sticky) 채 다시 렌더링될 때 스크롤로
    // 바뀐 위치를 레이아웃 변화로 보고 튀지 않도록, active 전환 때만 애니메이션한다.
    <motion.form
      layout
      layoutDependency={active}
      transition={TRANSITION}
      role="search"
      onSubmit={handleSubmit}
      className="flex items-center gap-3"
    >
      {/* 검색 모드에서만 나타나는 뒤로가기 화살표. popLayout으로 사라질 때
          인풋이 자연스럽게 폭을 되찾는다. */}
      <AnimatePresence initial={false} mode="popLayout">
        {active && (
          <motion.button
            key="back"
            layout
            layoutDependency={active}
            type="button"
            onClick={handleBack}
            aria-label="검색 닫기"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={TRANSITION}
            className="-ml-2.5 flex size-11 shrink-0 items-center justify-center rounded-full text-foreground outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring active:bg-muted"
          >
            <ChevronLeft size={28} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 인풋. 포커스가 들어가면 테두리를 주조색으로 강조하고 검색 모드로 진입한다.
          돋보기는 왼쪽 끝에 두고 검색을 실행하는 제출 버튼으로 동작하며, 값이
          있을 때만 오른쪽에 지우기 버튼이 나타난다. */}
      <motion.div
        layout
        layoutDependency={active}
        transition={TRANSITION}
        className="group flex h-12 min-w-0 flex-1 items-center rounded-[5px] border-2 border-[#292929] bg-[#2C2C2E] transition-colors focus-within:border-primary"
      >
        <button
          type="submit"
          aria-label="검색"
          className="flex size-12 shrink-0 items-center justify-center rounded-l-[3px] text-foreground outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring active:text-primary"
        >
          <Search size={24} />
        </button>
        <input
          ref={inputRef}
          type="search"
          inputMode="search"
          enterKeyHint="search"
          aria-label="공연 검색"
          placeholder="원하시는 공연을 검색해 보세요"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onActivate}
          className="min-w-0 flex-1 bg-transparent px-1 text-base font-medium text-foreground outline-none placeholder:text-placeholder [&::-webkit-search-cancel-button]:appearance-none"
        />
        {value && (
          <button
            type="button"
            aria-label="검색어 지우기"
            onClick={handleClear}
            className="flex size-12 shrink-0 items-center justify-center rounded-r-[3px] text-muted-foreground outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
          >
            <CloseCircleOutlineIcon size={24} />
          </button>
        )}
      </motion.div>
    </motion.form>
  );
}
