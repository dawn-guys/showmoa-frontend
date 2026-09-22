"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MapVenue } from "@/app/(tabs)/map/_types";
import { VenuePerformanceItem } from "@/app/(tabs)/map/_components/venue-performance-item";

/** 시트 최소 높이(px). Figma 기준. */
const MIN_HEIGHT = 138;
/** 최대 높이 계산에서 상단에 남겨 둘 여백(px) + 하단 나브 높이. */
const TOP_GAP = 74;
const NAV_HEIGHT = 62; // globals.css --spacing-bottom-nav

/** 키보드로 높이를 조절할 때의 한 스텝(px). */
const STEP = 80;

interface VenueBottomSheetProps {
  /** 선택된 공연장. */
  venue: MapVenue;
}

/**
 * 공연장 공연 정보 바텀 시트. 상단 핸들을 드래그해 최소~최대 높이 범위에서
 * 크기를 조절할 수 있고(키보드로도 조절 가능), 공연장 이름·공연 개수와
 * 공연 목록을 보여준다. 하단 나브 위에 고정된다.
 */
export function VenueBottomSheet({ venue }: VenueBottomSheetProps) {
  const [height, setHeight] = useState(MIN_HEIGHT);
  const [maxHeight, setMaxHeight] = useState(MIN_HEIGHT);

  // 찜 상태(목업). 공연장을 바꿔도 유지되도록 시트 레벨에서 보관한다.
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  // 최대 높이 = 100dvh - (하단 나브 높이 + 74px). 뷰포트 변화에 맞춰 갱신한다.
  useEffect(() => {
    const update = () => {
      const max = Math.max(
        MIN_HEIGHT,
        window.innerHeight - (NAV_HEIGHT + TOP_GAP),
      );
      setMaxHeight(max);
      setHeight((h) => Math.min(h, max));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const clamp = useCallback(
    (value: number) => Math.min(maxHeight, Math.max(MIN_HEIGHT, value)),
    [maxHeight],
  );

  // 드래그 시작 지점과 그 시점의 높이를 담아 두었다가 move에서 차이를 반영한다.
  const dragRef = useRef<{ startY: number; startHeight: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragRef.current = { startY: e.clientY, startHeight: height };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    // 위로 끌면(clientY 감소) 높이가 커진다.
    const delta = dragRef.current.startY - e.clientY;
    setHeight(clamp(dragRef.current.startHeight + delta));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    dragRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // 키보드 대체 조작: Enter/Space는 최소↔최대 토글, 방향키는 단계 조절.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHeight((h) => clamp(h + STEP));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHeight((h) => clamp(h - STEP));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setHeight((h) =>
        h > (MIN_HEIGHT + maxHeight) / 2 ? MIN_HEIGHT : maxHeight,
      );
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
      style={{ height }}
      className="fixed inset-x-0 bottom-[calc(var(--spacing-bottom-nav)+env(safe-area-inset-bottom))] z-20 mx-auto flex max-w-app flex-col rounded-t-2xl bg-card shadow-[0_-4px_16px_rgba(0,0,0,0.3)]"
    >
      {/* 드래그 핸들(키보드 조작 가능) */}
      <button
        type="button"
        aria-label="바텀 시트 높이 조절"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
        className="flex h-6 w-full shrink-0 touch-none items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span aria-hidden className="h-1 w-9 rounded-full bg-primary" />
      </button>

      {/* 헤더: 공연장 이름 · 공연 개수 */}
      <h2 className="shrink-0 px-4 pt-1 pb-3 text-h2 font-semibold text-foreground">
        {venue.name}
        <span className="font-medium text-muted-foreground">
          {" · 공연 "}
          {venue.performances.length}개
        </span>
      </h2>

      {/* 공연 목록 */}
      <ul className="flex flex-col gap-4 overflow-y-auto overscroll-contain px-4 pt-1 pb-4">
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
