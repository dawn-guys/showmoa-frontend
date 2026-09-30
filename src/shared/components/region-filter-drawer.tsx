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
  isSelectableSido,
  MAX_DISTRICTS,
  sidoLabel,
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
  /** 저장 버튼으로 선택한 시/도·구/군을 적용한다. */
  onApply: (filter: RegionFilter) => void;
}

/**
 * 한 열의 지역 목록. 선택된 값만 주조색으로 강조한다. isFull이면 고르지 않은
 * 항목을 비활성화해 더 고를 수 없게 한다.
 */
function RegionColumn({
  label,
  list,
  selected,
  onSelect,
  isFull = false,
  getLabel = (name) => name,
  className,
}: {
  label: string;
  /** 항목 값(전송·비교에 쓰는 API 값). */
  list: string[];
  selected: string[];
  onSelect: (name: string) => void;
  /** 고를 수 있는 개수가 다 찼는지. */
  isFull?: boolean;
  /** 값을 화면 표기로 바꾼다. 기본은 값 그대로. */
  getLabel?: (name: string) => string;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      // 값이 높이를 넘으면 스크롤바 없이 부드럽게 스크롤한다. 열 너비는
      // 고정하지 않고 내용(글자+padding)에 맞춰 늘어나므로 긴 지역명도
      // 잘리지 않는다. 왼쪽부터 채우고 나머지 공간은 비운다.
      className={cn(
        "h-full w-fit shrink-0 overflow-y-auto overscroll-contain py-2",
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {list.map((name) => {
        const isSelected = selected.includes(name);

        return (
          <button
            key={name}
            type="button"
            aria-pressed={isSelected}
            disabled={isFull && !isSelected}
            onClick={() => onSelect(name)}
            className={cn(
              "flex min-h-11 w-full items-center px-4 text-left text-sm leading-tight break-keep transition-colors outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40",
              isSelected ? "font-medium text-primary" : "text-muted-foreground",
            )}
          >
            {getLabel(name)}
          </button>
        );
      })}
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
  onApply: (filter: RegionFilter) => void;
}) {
  // 시/도(단일) → 구/군(다중) 선택 상태. API가 두 단계만 내려주므로 열도 두 개다.
  const [selected, setSelected] = useState<RegionFilter | null>(null);

  const districts =
    areas.find((area) => area.sido === selected?.sido)?.districts ?? [];

  // 이미 고른 구/군은 다시 누르면 해제된다.
  const toggleDistrict = (district: string) =>
    setSelected((prev) =>
      prev
        ? {
            sido: prev.sido,
            districts: prev.districts.includes(district)
              ? prev.districts.filter((item) => item !== district)
              : [...prev.districts, district],
          }
        : prev,
    );

  return (
    <>
      {/* 위치 선택: 선택한 값이 여기에 순서대로 올라온다. */}
      <div className="flex items-center gap-1.5 px-4 py-4.5">
        <PointOnMapBoldDuotoneIcon
          size={24}
          className="shrink-0 text-primary"
          aria-hidden
        />
        <p className="text-sm font-medium break-keep text-foreground">
          {selected
            ? [sidoLabel(selected.sido), selected.districts.join(", ")]
                .filter(Boolean)
                .join(" ")
            : "필터링 할 지역을 선택해 주세요"}
        </p>
      </div>

      {/* 지역 목록 두 열(시/도 · 구/군). */}
      <div className="flex min-h-0 flex-1 bg-[#272727]">
        {isPending ? (
          <div className="flex flex-1 items-start justify-center pt-10">
            <LoadingSpinner label="지역 목록 불러오는 중" />
          </div>
        ) : (
          <>
            <RegionColumn
              label="시/도 선택"
              // 스펙에 표기가 없는 지역(해외 등)은 목록에서 뺀다.
              list={areas
                .filter((area) => isSelectableSido(area.sido))
                .map((area) => area.sido)}
              selected={selected ? [selected.sido] : []}
              // 시/도를 바꾸면 이전에 고른 구/군은 버린다(다른 시/도의 구/군이
              // 섞이지 않게). 같은 시/도를 다시 누르면 고른 구/군을 유지한다.
              onSelect={(sido) =>
                setSelected((prev) =>
                  prev?.sido === sido ? prev : { sido, districts: [] },
                )
              }
              // 전송은 API 값(서울)으로 하고 화면에는 스펙 표기(서울특별시)를 쓴다.
              getLabel={sidoLabel}
              className="border-r border-border"
            />
            <RegionColumn
              label="구/시 선택"
              list={districts}
              selected={selected?.districts ?? []}
              onSelect={toggleDistrict}
              isFull={(selected?.districts.length ?? 0) >= MAX_DISTRICTS}
              // 구/군이 채워졌을 때만 오른쪽 구분선을 둔다(빈 열엔 선을 긋지 않는다).
              className={cn(districts.length > 0 && "border-r border-border")}
            />
          </>
        )}
      </div>

      {/* CTA: 구/군을 하나 이상 골라야 나타난다. 시/도는 구/군을 찾아 내려가는
          탐색용이라 그 자체로는 필터가 되지 않는다. */}
      {selected && selected.districts.length > 0 && (
        <div className="bg-[#272727] px-4 pb-4.5">
          <CtaButton onClick={() => onApply(selected)}>저장</CtaButton>
        </div>
      )}
    </>
  );
}

/**
 * 지역 필터 드로워. 앱 컬럼 전체를 덮으며 오른쪽에서 슬라이드로 열린다.
 * GET /api/performances/areas 가 내려주는 시/도 · 구/군 두 열을 나란히 두고,
 * 왼쪽에서 시/도 하나를 고르면 오른쪽 열에 그 시/도의 구/군이 채워진다.
 * 구/군은 MAX_DISTRICTS개까지 고를 수 있고, 다 차면 나머지가 비활성화된다.
 * 필터가 걸리는 단위는 구/군이고 시/도는 그것을 찾아 내려가는 탐색 단계라,
 * 구/군을 하나 이상 고른 뒤에야 저장 버튼이 나타난다. 뒤로가기 버튼·배경·Esc로 닫는다.
 * (공통 UI 지역 필터 드로워 — 스펙의 동 단계는 API에 없어 두 단계로 둔다)
 */
export function RegionFilterDrawer({
  open,
  onOpenChange,
  areas,
  isPending,
  onApply,
}: RegionFilterDrawerProps) {
  const handleApply = (filter: RegionFilter) => {
    onApply(filter);
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
