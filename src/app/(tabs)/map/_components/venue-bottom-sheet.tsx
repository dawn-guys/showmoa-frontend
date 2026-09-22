"use client";

import { useRef, useState } from "react";
import type { MapVenue } from "@/app/(tabs)/map/_types";
import { VenuePerformanceItem } from "@/app/(tabs)/map/_components/venue-performance-item";

/** 시트 기본(접힘) 높이. globals.css --spacing-venue-sheet 토큰을 사용한다. */
const DEFAULT_HEIGHT = "var(--spacing-venue-sheet)";
/** 최대 높이 = 100dvh - (하단 나브 높이 + 상단 여백 74px). 기본 높이보다 작아지지 않는다. */
const MAX_HEIGHT =
  "max(var(--spacing-venue-sheet), calc(100dvh - (var(--spacing-bottom-nav) + 74px)))";

/** 스냅을 트리거하는 최소 드래그 거리(px). 이 이상 끌면 기본↔최대로 전환. */
const SNAP_THRESHOLD = 16;

interface VenueBottomSheetProps {
  /** 선택된 공연장. */
  venue: MapVenue;
}

/**
 * 공연장 공연 정보 바텀 시트. 유동적으로 높이를 조절하지 않고, 상단 핸들을
 * 위로 살짝 끌면 최대 높이로, 최대 높이에서 아래로 살짝 끌면 기본 높이로
 * 스르륵 전환되는 2단계 스냅 방식이다(키보드로도 조작 가능). 공연장 이름·
 * 공연 개수와 공연 목록을 보여주며 하단 나브 위에 고정된다.
 */
export function VenueBottomSheet({ venue }: VenueBottomSheetProps) {
  // 두 단계(기본/최대)만 갖는 스냅 상태.
  const [expanded, setExpanded] = useState(false);

  // 찜 상태(목업). 공연장을 바꿔도 유지되도록 시트 레벨에서 보관한다.
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  // 드래그 시작 지점만 담아 두고, 임계값을 넘는 순간 스냅을 확정한다.
  const dragStartY = useRef<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartY.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragStartY.current === null) return;
    // 위로 끌면(clientY 감소) delta가 양수.
    const delta = dragStartY.current - e.clientY;
    if (!expanded && delta > SNAP_THRESHOLD) {
      setExpanded(true);
      dragStartY.current = null;
    } else if (expanded && delta < -SNAP_THRESHOLD) {
      setExpanded(false);
      dragStartY.current = null;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    dragStartY.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // 키보드 대체 조작: ↑는 펼치기, ↓는 접기, Enter/Space는 토글.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setExpanded(true);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setExpanded(false);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setExpanded((prev) => !prev);
    }
  };

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section
      aria-label={`${venue.name} 공연 목록`}
      style={{ height: expanded ? MAX_HEIGHT : DEFAULT_HEIGHT }}
      className="fixed inset-x-0 bottom-[calc(var(--spacing-bottom-nav)+env(safe-area-inset-bottom))] z-20 mx-auto flex max-w-app flex-col rounded-t-[20px] bg-[#121212] shadow-[0_-4px_16px_rgba(0,0,0,0.3)] transition-[height] duration-300 ease-out motion-reduce:transition-none"
    >
      {/* 드래그 핸들(키보드 조작 가능). 위로 살짝 끌면 최대, 최대에서 아래로 살짝 끌면 기본. */}
      <button
        type="button"
        aria-label="바텀 시트 높이 조절"
        aria-expanded={expanded}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
        className="flex w-full shrink-0 touch-none items-start justify-center pt-4.25 pb-5 outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span aria-hidden className="h-1 w-10 rounded-full bg-primary" />
      </button>

      {/* 헤더: 공연장 이름 · 공연 개수 */}
      <h2 className="mb-5 shrink-0 px-4 text-body2 font-medium text-foreground">
        {venue.name}
        <span className="font-medium text-muted-foreground">
          {" · 공연 "}
          {venue.performances.length}개
        </span>
      </h2>

      {/* 공연 목록. 스크롤바 UI는 숨기되 부드럽게 스크롤된다. */}
      <ul className="flex min-h-0 flex-1 [scrollbar-width:none] flex-col gap-4 overflow-y-auto overscroll-contain scroll-smooth px-4 pt-1 pb-4 [&::-webkit-scrollbar]:hidden">
        {venue.performances.map((performance) => (
          <VenuePerformanceItem
            key={performance.id}
            performance={performance}
            isLiked={likedIds.has(performance.id)}
            onToggleLike={() => toggleLike(performance.id)}
          />
        ))}
      </ul>
    </section>
  );
}
