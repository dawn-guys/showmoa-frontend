"use client";

import { useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { ShareLinearIcon } from "@solar-icons/react";
import { useAuth } from "@/shared/hooks/useAuth";
import { useOverlayFlag } from "@/shared/hooks/useOverlayFlag";
import { AnimatedToast, type ToastVariant } from "@/shared/components/toast";
import { ConfirmModal } from "@/shared/components/confirm-modal";
import { HeartBurst, useHeartBurst } from "@/shared/components/heart-burst";
import { usePerformanceDetail } from "@/app/(tabs)/detail/[id]/_hooks/usePerformanceDetail";
import { useBlockedDetailFields } from "@/app/(tabs)/detail/[id]/_hooks/useBlockedDetailFields";
import {
  useToggleWishlist,
  WISHLIST_ERROR_MESSAGE,
} from "@/shared/hooks/useToggleWishlist";
import {
  formatPerformancePeriod,
  formatPerformanceStateCaption,
} from "@/app/(tabs)/detail/[id]/_lib/detail-format";
import { PosterViewer } from "@/app/(tabs)/detail/[id]/_components/poster-viewer";
import { PerformanceInfoSection } from "@/app/(tabs)/detail/[id]/_components/performance-info-section";
import { CastSection } from "@/app/(tabs)/detail/[id]/_components/cast-section";
import { VenueSection } from "@/app/(tabs)/detail/[id]/_components/venue-section";
import { DetailCta } from "@/app/(tabs)/detail/[id]/_components/detail-cta";
import { DetailSkeleton } from "@/app/(tabs)/detail/[id]/_components/detail-skeleton";

interface DetailScreenProps {
  id: string;
}

interface ToastState {
  message: string;
  variant: ToastVariant;
}

// 클립보드 복사(사용자 제스처 안에서만 호출). 미지원·거부 시 false를 돌려준다.
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (!navigator.clipboard?.writeText) return false;
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** 섹션 사이 전체 폭 구분 바(#090909). 대응 토큰이 없어 임시 하드코딩. */
function SectionDivider() {
  return <div aria-hidden className="-mx-[15px] h-2.5 bg-[#090909]" />;
}

/**
 * 디테일 페이지 오케스트레이터. 상세 데이터 로드·좋아요·공유/주소 복사 토스트·
 * 비로그인 좋아요 시 로그인 유도 모달을 연결한다.
 */
export function DetailScreen({ id }: DetailScreenProps) {
  const router = useRouter();
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const { data: detail, isLoading, isError } = usePerformanceDetail(id);
  // 계약에 없는 필드(상세 이미지·지번 주소·건물명·지도 딥링크 id)는 목업으로 채운다.
  const blocked = useBlockedDetailFields();
  const { add, remove, isPending: isToggling } = useToggleWishlist();
  // 좋아요 "추가" 성공 시에만 재생할 하트 버스트.
  const { triggerKey, burst } = useHeartBurst();

  const [toast, setToast] = useState<ToastState | null>(null);
  // 로그인 유도 모달 열림 상태(공통 훅으로 히스토리 미누적).
  const [loginOpen, setLoginOpen] = useOverlayFlag("login");

  // 토스트는 잠시 후 자동으로 사라진다.
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  // 상세 조회 실패(없는 공연 등)는 에러 페이지로 넘긴다.
  if (isError) notFound();
  if (isLoading || !detail) return <DetailSkeleton />;

  const isWished = detail.isWished;

  const handleShare = async () => {
    const ok = await copyToClipboard(window.location.href);
    setToast(
      ok
        ? { message: "주소를 복사 했습니다", variant: "success" }
        : { message: "예상치 못한 오류가 발생했습니다", variant: "error" },
    );
  };

  const handleCopyAddress = async (text: string) => {
    const ok = await copyToClipboard(text);
    setToast(
      ok
        ? { message: "공연장 주소를 복사 했습니다", variant: "success" }
        : { message: "예상치 못한 오류가 발생했습니다", variant: "error" },
    );
  };

  const handleToggleLike = () => {
    // 세션 확인 중에는 동작하지 않는다.
    if (authLoading) return;
    // 비로그인 사용자는 API 호출 없이 로그인 유도 모달로 분기한다.
    if (!isLoggedIn) {
      setLoginOpen(true);
      return;
    }
    const wasWished = isWished;
    // 이미 찜했으면 취소, 아니면 추가. 공통 훅이 두 요청과 무효화를 함께 맡는다.
    const mutateWishlist = wasWished ? remove : add;
    mutateWishlist(detail.id, {
      onSuccess: () => {
        // 좋아요로 "전환"되는 성공에서만 하트 애니메이션을 재생한다.
        if (!wasWished) burst();
      },
      onError: () =>
        setToast({ message: WISHLIST_ERROR_MESSAGE, variant: "error" }),
    });
  };

  return (
    <>
      <main className="flex flex-col gap-7 px-[15px] pt-2 pb-[calc(3.5rem+18px+env(safe-area-inset-bottom)+1.5rem)]">
        {/* 제목·공유·공연장·태그 */}
        <div className="">
          <div className="flex items-center justify-between">
            <h1 className="text-body1 font-medium break-keep text-foreground">
              {detail.name}
            </h1>
            {/* 아이콘은 20px지만 히트 영역은 44px(터치 최소치). -m으로 제목 줄과 정렬을 맞춘다. */}
            <button
              type="button"
              onClick={handleShare}
              aria-label="공유 링크 복사"
              className="-mr-2.5 flex size-11 shrink-0 items-center justify-center rounded-sm text-foreground outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring active:opacity-60"
            >
              <ShareLinearIcon size={20} aria-hidden color="#888888" />
            </button>
          </div>
          <p className="mb-3 text-body3 text-muted-foreground">
            {detail.theatre.name}
          </p>
          <ul className="flex flex-wrap gap-2.5">
            {/* 태그 배경 #313131은 대응 토큰이 없어 임시 하드코딩. */}
            <li className="rounded-[20px] bg-[#313131] px-2 py-0.5 text-body3 font-medium text-foreground">
              {detail.genre}
            </li>
            <li className="rounded-[20px] bg-[#313131] px-2 py-0.5 text-body3 font-medium text-foreground">
              {formatPerformanceStateCaption(detail.state, detail.startDate)}
            </li>
          </ul>
        </div>

        <PosterViewer
          posterUrl={detail.posterUrl}
          title={detail.name}
          detailImageUrls={blocked.detailImageUrls}
        />

        <PerformanceInfoSection
          periodText={formatPerformancePeriod(
            detail.startDate,
            detail.endDate,
            detail.openRun,
          )}
          showTimeGuidance={detail.showTimeGuidance}
          ageLimit={detail.ageLimit}
          ticketingSites={detail.ticketingSites}
        />

        {/* 출연진이 없으면(빈 배열) 섹션과 구분 바를 함께 숨겨 바가 겹치지 않게 한다. */}
        {detail.cast.length > 0 && (
          <>
            <SectionDivider />
            <CastSection cast={detail.cast} />
          </>
        )}

        <SectionDivider />

        <VenueSection
          theatre={detail.theatre}
          jibunAddress={blocked.jibunAddress}
          buildingName={blocked.buildingName}
          venueId={blocked.venueId}
          onCopyAddress={handleCopyAddress}
        />
      </main>

      <DetailCta
        isLiked={isWished}
        isPending={isToggling}
        onToggleLike={handleToggleLike}
      />

      {/* 좋아요 "추가" 성공 시 화면 중앙에서 떠오르며 사라지는 하트 */}
      <HeartBurst triggerKey={triggerKey} />

      {/* 공유/주소 복사·좋아요 실패 결과 토스트(상단 중앙, safe-area 기준). */}
      <AnimatedToast
        open={!!toast}
        message={toast?.message ?? ""}
        variant={toast?.variant}
        className="top-[calc(env(safe-area-inset-top)+12px)]"
      />

      {/* 비로그인 좋아요 시 로그인 유도 모달 */}
      <ConfirmModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        title="로그인"
        description="로그인이 필요한 서비스 입니다. 로그인 하시겠습니까?"
        confirmLabel="로그인 하기"
        onConfirm={() => router.push("/login")}
      />
    </>
  );
}
