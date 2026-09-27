"use client";

import { useRef, useState } from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { PerformanceResponse } from "@/app/(tabs)/_types";
import type { TheatreMapResponse } from "@/app/(tabs)/map/_types";
import { VenuePerformanceItem } from "@/app/(tabs)/map/_components/venue-performance-item";

/** 시트 기본(접힘) 높이. globals.css --spacing-venue-sheet 토큰을 사용한다. */
const DEFAULT_HEIGHT = "var(--spacing-venue-sheet)";
/** 최대 높이 = 100dvh - (하단 나브 높이 + 상단 여백 74px). 기본 높이보다 작아지지 않는다. */
const MAX_HEIGHT =
  "max(var(--spacing-venue-sheet), calc(100dvh - (var(--spacing-bottom-nav) + 74px)))";

/** 스냅을 트리거하는 최소 드래그 거리(px). 이 이상 끌면 기본↔최대로 전환. */
const SNAP_THRESHOLD = 16;

interface VenueBottomSheetProps {
  /** 선택된 극장. */
  theatre: TheatreMapResponse;
  /** 이 극장의 공연 목록. 로딩 중이면 빈 배열. */
  performances: PerformanceResponse[];
  /** 공연 목록 조회 중 여부. */
  isLoading: boolean;
}

/**
 * 극장 공연 정보 바텀 시트. 유동적으로 높이를 조절하지 않고, 상단 핸들을
 * 위로 살짝 끌면 최대 높이로, 최대 높이에서 아래로 살짝 끌면 기본 높이로
 * 스르륵 전환되는 2단계 스냅 방식이다(키보드로도 조작 가능). 극장 이름·
 * 공연 개수와 공연 목록을 보여주며 하단 나브 위에 고정된다.
 */
export function VenueBottomSheet({
  theatre,
  performances,
  isLoading,
}: VenueBottomSheetProps) {
  // 두 단계(기본/최대)만 갖는 스냅 상태.
  const [expanded, setExpanded] = useState(false);

  // 찜 토글(POST/DELETE /api/wishlists)은 Todo F·G 범위라 아직 서버에 반영하지
  // 않는다. 초기 상태는 응답의 isWished를 쓰고, 토글은 화면에서만 유지한다.
  const [overriddenIds, setOverriddenIds] = useState<Set<number>>(new Set());

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

  const toggleLike = (id: number) => {
    setOverriddenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section
      aria-label={`${theatre.name} 공연 목록`}
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

      {/* 헤더: 극장 이름 · 공연 개수. 개수는 아래 목록과 어긋나지 않도록 목록
          길이를 쓴다(응답의 performanceCount는 "오늘 공연 중"인 수라 다르다). */}
      <h2 className="mb-5 shrink-0 px-4 text-body2 font-medium text-foreground">
        {theatre.name}
        {!isLoading && (
          <span className="font-medium text-muted-foreground">
            {" · 공연 "}
            {performances.length}개
          </span>
        )}
      </h2>

      {/* 공연 목록. 스크롤바 UI는 숨기되 부드럽게 스크롤된다. */}
      {isLoading ? (
        <div
          aria-busy="true"
          aria-label="공연 목록을 불러오는 중"
          className="flex flex-col gap-4 px-4 pt-1"
        >
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-16 shrink-0 rounded-lg" aria-hidden />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Skeleton className="h-4 w-3/5" aria-hidden />
                <Skeleton className="h-3 w-2/5" aria-hidden />
              </div>
              <Skeleton className="size-6 shrink-0 rounded-full" aria-hidden />
            </div>
          ))}
        </div>
      ) : (
        <ul className="flex min-h-0 flex-1 [scrollbar-width:none] flex-col gap-4 overflow-y-auto overscroll-contain scroll-smooth px-4 pt-1 pb-4 [&::-webkit-scrollbar]:hidden">
          {performances.map((performance) => (
            <VenuePerformanceItem
              key={performance.id}
              performance={performance}
              isLiked={
                overriddenIds.has(performance.id)
                  ? !performance.isWished
                  : performance.isWished
              }
              onToggleLike={() => toggleLike(performance.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
