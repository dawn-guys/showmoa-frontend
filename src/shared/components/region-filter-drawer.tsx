"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { PointOnMapBoldDuotoneIcon } from "@solar-icons/react";
import { ChevronLeft } from "lucide-react";
import { cn } from "cn";
import type { AreaResponse } from "@/app/(tabs)/_types";
import { CtaButton } from "@/shared/components/cta-button";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import {
  formatRegionFilter,
  type RegionFilter,
} from "@/shared/constants/region";

interface RegionFilterDrawerProps {
  /** 열림 상태 (URL 등 바깥 상태와 연결) */
  open: boolean;
  /** 열림 상태 변경 콜백 */
  onOpenChange: (open: boolean) => void;
  /** GET /api/performances/areas 응답. 컴포넌트는 직접 조회하지 않는다. */
  areas: AreaResponse[];
  /** 지역 목록 조회 중 여부 */
  isPending: boolean;
  /** 저장 버튼으로 선택한 지역을 한 줄 문자열로 적용한다. */
  onApply: (label: string) => void;
}

/** 한 열의 지역 목록. 선택된 값만 주조색으로 강조한다. */
function RegionColumn({
  label,
  list,
  selected,
  onSelect,
  className,
}: {
  label: string;
  list: string[];
  selected: string | null;
  onSelect: (name: string) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      // 값이 높이를 넘으면 스크롤바 없이 부드럽게 스크롤한다.
      className={cn(
        "h-full min-w-0 flex-[1] overflow-y-auto overscroll-contain py-2",
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {list.map((name) => (
        <button
          key={name}
          type="button"
          aria-pressed={selected === name}
          onClick={() => onSelect(name)}
          className={cn(
            "flex min-h-11 w-full items-center px-4 text-left text-body2 leading-tight break-keep transition-colors outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring",
            selected === name ? "font-medium text-primary" : "text-disabled",
          )}
        >
          {name}
        </button>
      ))}
    </div>
  );
}

/**
 * 드로워 본문. 드로워가 닫히면 언마운트되어 선택이 초기화되므로,
 * 열 때마다 안내 문구 상태에서 다시 시작한다.
 */
function RegionFilterDrawerBody({
  areas,
  isPending,
  onApply,
}: {
  areas: AreaResponse[];
  isPending: boolean;
  onApply: (label: string) => void;
}) {
  // 시/도 → 구/시 선택 상태. API가 두 단계만 내려주므로 열도 두 개다.
  const [selected, setSelected] = useState<RegionFilter | null>(null);

  const districts =
    areas.find((area) => area.sido === selected?.sido)?.districts ?? [];

  return (
    <>
      {/* 위치 선택: 선택한 값이 여기에 순서대로 올라온다. */}
      <div className="flex items-center gap-2 px-4 pt-1 pb-4">
        <PointOnMapBoldDuotoneIcon
          size={24}
          className="shrink-0 text-primary"
          aria-hidden
        />
        <p
          className={cn(
            "text-body2 font-medium break-keep",
            selected ? "text-foreground" : "text-disabled",
          )}
        >
          {selected
            ? formatRegionFilter(selected)
            : "필터링 할 지역을 선택해 주세요"}
        </p>
      </div>

      {/* 지역 목록 두 열(시/도 · 구/시). */}
      <div className="flex min-h-0 flex-1 bg-[#272727]">
        {isPending ? (
          <div className="flex flex-1 items-start justify-center pt-10">
            <LoadingSpinner label="지역 목록 불러오는 중" />
          </div>
        ) : (
          <>
            <RegionColumn
              label="시/도 선택"
              list={areas.map((area) => area.sido)}
              selected={selected?.sido ?? null}
              // 시/도를 바꾸면 이전에 고른 구/시는 버린다.
              onSelect={(sido) => setSelected({ sido })}
              className="border-r border-white/10"
            />
            <RegionColumn
              label="구/시 선택"
              list={districts}
              selected={selected?.district ?? null}
              onSelect={(district) =>
                setSelected((prev) =>
                  prev ? { sido: prev.sido, district } : prev,
                )
              }
            />
          </>
        )}
      </div>

      {/* CTA: 구/시까지 골라야 나타난다. 시/도는 구/시를 찾아 내려가는 탐색용이라
          그 자체로는 필터가 되지 않는다. */}
      {selected?.district && (
        <div className="bg-[#272727] px-4 pb-4.5">
          <CtaButton onClick={() => onApply(formatRegionFilter(selected))}>
            저장
          </CtaButton>
        </div>
      )}
    </>
  );
}

/**
 * 지역 필터 드로워. 앱 컬럼 전체를 덮으며 오른쪽에서 슬라이드로 열린다.
 * GET /api/performances/areas 가 내려주는 시/도 · 구/시 두 열을 나란히 두고,
 * 왼쪽에서 고르면 오른쪽 열에 그 시/도의 구/시가 채워진다. 필터가 걸리는 단위는
 * 구/시이고 시/도는 그것을 찾아 내려가는 탐색 단계라, 구/시까지 고른 뒤에야
 * 저장 버튼이 나타난다. 뒤로가기 버튼·배경·Esc로 닫는다.
 * (공통 UI 지역 필터 드로워 — 스펙의 동 단계는 API에 없어 두 단계로 둔다)
 */
export function RegionFilterDrawer({
  open,
  onOpenChange,
  areas,
  isPending,
  onApply,
}: RegionFilterDrawerProps) {
  const handleApply = (label: string) => {
    onApply(label);
    onOpenChange(false);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-black/40 duration-200",
            "data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
          )}
        />
        <DialogPrimitive.Popup
          className={cn(
            "fixed inset-0 z-50 mx-auto flex max-w-app flex-col bg-background duration-200 outline-none",
            "data-open:animate-in data-open:slide-in-from-right data-closed:animate-out data-closed:slide-out-to-right",
          )}
        >
          {/* 앱바: 뒤로가기 버튼 + 제목(드로워 접근성 이름) */}
          <header className="flex h-17 shrink-0 items-center gap-6 px-4">
            <DialogPrimitive.Close
              aria-label="뒤로 가기"
              className="-ml-2.5 flex size-11 items-center justify-center rounded-full text-foreground outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring active:bg-muted"
            >
              <ChevronLeft size={30} />
            </DialogPrimitive.Close>
            <DialogPrimitive.Title className="text-h1 text-foreground">
              지역 필터
            </DialogPrimitive.Title>
          </header>

          <RegionFilterDrawerBody
            areas={areas}
            isPending={isPending}
            onApply={handleApply}
          />
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
