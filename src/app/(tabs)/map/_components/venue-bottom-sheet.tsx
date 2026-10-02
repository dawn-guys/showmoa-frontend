"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/shared/components/confirm-modal";
import { AnimatedToast } from "@/shared/components/toast";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useAuth } from "@/shared/hooks/useAuth";
import { useOverlayFlag } from "@/shared/hooks/useOverlayFlag";
import {
  useToggleWishlist,
  WISHLIST_ERROR_MESSAGE,
} from "@/shared/hooks/useToggleWishlist";
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

/** 찜 실패 토스트가 떠 있는 시간(ms). 다른 화면과 같은 길이로 맞춘다. */
const TOAST_DURATION_MS = 2500;

interface VenueBottomSheetProps {
  /**
   * 선택된 극장. null이면 공연장 미선택 상태(현재 위치 이동 직후)라, 같은 시트에서
   * 공연 목록 대신 "공연장을 선택해 주세요" 안내만 보여준다(시트 자체는 유지).
   */
  theatre: TheatreMapResponse | null;
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
 *
 * 극장이 선택되지 않았을 때(theatre=null)는 같은 시트를 유지한 채 안내 문구만
 * 보여준다. 이때는 펼칠 내용이 없어 기본 높이로 고정한다. (Figma 803:3555)
 */
export function VenueBottomSheet({
  theatre,
  performances,
  isLoading,
}: VenueBottomSheetProps) {
  // 두 단계(기본/최대)만 갖는 스냅 상태.
  const [expanded, setExpanded] = useState(false);

  // 극장 미선택(안내) 상태에서는 펼칠 내용이 없으므로 접힘으로 되돌린다.
  // (effect가 아니라 렌더 중 상태 조정이라 추가 커밋 없이 반영된다.)
  if (!theatre && expanded) {
    setExpanded(false);
  }

  const router = useRouter();
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  // 디테일과 같은 공통 훅. 지도 시트는 추가·취소 둘 다 쓴다.
  const {
    add,
    remove,
    isError: isToggleError,
    reset: resetToggle,
  } = useToggleWishlist();
  // 비로그인 사용자의 로그인 유도 모달(공통 훅으로 히스토리 미누적).
  const [loginOpen, setLoginOpen] = useOverlayFlag("login");

  // 찜 실패 토스트는 잠시 후 스스로 사라진다. 뮤테이션 상태를 되돌려 닫는다.
  useEffect(() => {
    if (!isToggleError) return;
    const timer = setTimeout(resetToggle, TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [isToggleError, resetToggle]);

  // 드래그 시작 지점만 담아 두고, 임계값을 넘는 순간 스냅을 확정한다.
  const dragStartY = useRef<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!theatre) return;
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
    if (!theatre) return;
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

  const handleToggleLike = (performance: PerformanceResponse) => {
    // 세션 확인 중에는 동작하지 않는다.
    if (authLoading) return;
    // 비로그인 사용자는 요청 없이 로그인 유도 모달로 분기한다.
    if (!isLoggedIn) {
      setLoginOpen(true);
      return;
    }
    // 성공하면 공통 훅이 이 극장의 공연 목록을 무효화해 isWished를 다시 받아온다.
    const mutateWishlist = performance.isWished ? remove : add;
    mutateWishlist(performance.id);
  };

  return (
    <section
      aria-label={theatre ? `${theatre.name} 공연 목록` : "공연장 선택 안내"}
      style={{ height: theatre && expanded ? MAX_HEIGHT : DEFAULT_HEIGHT }}
      className="fixed inset-x-0 bottom-[calc(var(--spacing-bottom-nav)+env(safe-area-inset-bottom))] z-20 mx-auto flex max-w-app flex-col rounded-t-[20px] bg-[#121212] shadow-[0_-4px_16px_rgba(0,0,0,0.3)] transition-[height] duration-300 ease-out motion-reduce:transition-none"
    >
      {/* 드래그 핸들(키보드 조작 가능). 위로 살짝 끌면 최대, 최대에서 아래로 살짝 끌면 기본.
          극장 미선택 상태에서는 조절할 내용이 없어 조작하지 않는다(핸들은 디자인상 유지). */}
      <button
        type="button"
        aria-label="바텀 시트 높이 조절"
        aria-expanded={theatre ? expanded : undefined}
        disabled={!theatre}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
        className="flex w-full shrink-0 touch-none items-start justify-center pt-4.25 pb-5 outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default"
      >
        <span aria-hidden className="h-1 w-10 rounded-full bg-primary" />
      </button>

      {theatre ? (
        <>
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
            // 시트 높이를 넘는 스켈레톤이 아래로 새어 하단 나브 위에 그려지지 않도록
            // 목록(ul)과 같이 남은 높이만 차지하고 넘치는 부분은 잘라낸다.
            <div
              aria-busy="true"
              aria-label="공연 목록을 불러오는 중"
              className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-4 pt-1"
            >
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton
                    className="size-16 shrink-0 rounded-lg"
                    aria-hidden
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <Skeleton className="h-4 w-3/5" aria-hidden />
                    <Skeleton className="h-3 w-2/5" aria-hidden />
                  </div>
                  <Skeleton
                    className="size-6 shrink-0 rounded-full"
                    aria-hidden
                  />
                </div>
              ))}
            </div>
          ) : (
            <ul className="flex min-h-0 flex-1 [scrollbar-width:none] flex-col gap-4 overflow-y-auto overscroll-contain scroll-smooth px-4 pt-1 pb-4 [&::-webkit-scrollbar]:hidden">
              {performances.map((performance) => (
                <VenuePerformanceItem
                  key={performance.id}
                  performance={performance}
                  isLiked={performance.isWished}
                  onToggleLike={() => handleToggleLike(performance)}
                />
              ))}
            </ul>
          )}
        </>
      ) : (
        /* 극장 미선택 안내. 같은 시트를 유지한 채 문구만 보여준다. (Figma 803:3555) */
        <p className="flex min-h-0 flex-1 items-center justify-center px-4 pb-4 text-center text-h2 font-medium break-keep text-hint">
          공연장을 선택해 주세요
        </p>
      )}

      {/* 찜 실패 토스트. 상단 검색창·검색 실패 토스트와 겹치지 않게 아래로 둔다. */}
      <AnimatedToast
        open={isToggleError}
        message={WISHLIST_ERROR_MESSAGE}
        variant="error"
        className="top-[calc(env(safe-area-inset-top)+124px)]"
      />

      {/* 비로그인 사용자가 하트를 누르면 로그인 유도 모달(디테일과 같은 문구) */}
      <ConfirmModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        title="로그인"
        description="로그인이 필요한 서비스 입니다. 로그인 하시겠습니까?"
        confirmLabel="로그인 하기"
        // 모달 닫기(?login 제거)가 URL에 반영된 뒤 이동한다. 먼저 이동하면 뒤늦은
        // URL 갱신이 현재 페이지로 덮어써 /login 이동이 취소된다.
        onConfirm={() => setLoginOpen(false).then(() => router.push("/login"))}
      />
    </section>
  );
}
