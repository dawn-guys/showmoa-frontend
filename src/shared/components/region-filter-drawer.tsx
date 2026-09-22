"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { PointOnMapBoldDuotoneIcon } from "@solar-icons/react";
import { ChevronLeft } from "lucide-react";
import { cn } from "cn";
import { CtaButton } from "@/shared/components/cta-button";
import {
  formatRegionPath,
  isLeafRegion,
  REGIONS,
  type RegionNode,
} from "@/shared/constants/region";

interface RegionFilterDrawerProps {
  /** 열림 상태 (URL 등 바깥 상태와 연결) */
  open: boolean;
  /** 열림 상태 변경 콜백 */
  onOpenChange: (open: boolean) => void;
  /** 저장 버튼으로 선택한 지역 경로를 한 줄 문자열로 적용한다. */
  onApply: (label: string) => void;
}

/** 최대 선택 깊이. 시/도 → 구·시 → 동·구 3단계까지만 내려간다. */
const MAX_DEPTH = 3;

/** 더 내려갈 수 없는 최종 선택인지. 3단계까지 갔거나 잎(하위 없음)이면 최종이다. */
function isFinalPath(path: RegionNode[]): boolean {
  const last = path.at(-1);
  if (!last) return false;
  return path.length >= MAX_DEPTH || isLeafRegion(last);
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
  list: RegionNode[];
  selected: RegionNode | null;
  onSelect: (node: RegionNode) => void;
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
      {list.map((node) => (
        <button
          key={node.name}
          type="button"
          aria-pressed={selected?.name === node.name}
          onClick={() => onSelect(node)}
          className={cn(
            "flex min-h-11 w-full items-center px-4 text-left text-body2 leading-tight break-keep transition-colors outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring",
            selected?.name === node.name
              ? "font-medium text-primary"
              : "text-disabled",
          )}
        >
          {node.name}
        </button>
      ))}
    </div>
  );
}

/**
 * 드로워 본문. 드로워가 닫히면 언마운트되어 선택 경로가 초기화되므로,
 * 열 때마다 안내 문구 상태에서 다시 시작한다.
 */
function RegionFilterDrawerBody({
  onApply,
}: {
  onApply: (label: string) => void;
}) {
  // 시/도 → 구·시 → 동·구 로 이어지는 선택 경로(최대 3단계).
  const [path, setPath] = useState<RegionNode[]>([]);

  // 세 열은 각각 시/도·그 하위·그 하위를 보여준다. 상위 선택이 없으면 빈 열이다.
  const columns = [
    { label: "시/도 선택", list: REGIONS, selected: path[0] ?? null },
    {
      label: "구·시 선택",
      list: path[0]?.children ?? [],
      selected: path[1] ?? null,
    },
    {
      label: "동·구 선택",
      list: path[1]?.children ?? [],
      selected: path[2] ?? null,
    },
  ];

  // level 열에서 고르면 그 단계까지의 경로를 교체하고 아래 단계 선택은 버린다.
  const select = (level: number, node: RegionNode) =>
    setPath([...path.slice(0, level), node]);

  // 3단계까지 갔거나 잎을 골랐을 때만 지역 필터링을 적용할 수 있다.
  const canApply = isFinalPath(path);

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
            path.length > 0 ? "text-foreground" : "text-disabled",
          )}
        >
          {path.length > 0
            ? formatRegionPath(path)
            : "필터링 할 지역을 선택해 주세요"}
        </p>
      </div>

      {/* 지역 목록 세 열(시/도 · 구/시 · 동/구). 폭 비율은 피그마(118:80:80)를 따른다. */}
      <div className="flex min-h-0 flex-1 bg-[#272727]">
        {columns.map((column, level) => (
          <RegionColumn
            key={column.label}
            label={column.label}
            list={column.list}
            selected={column.selected}
            onSelect={(node) => select(level, node)}
            className={cn(level < 2 && "border-r border-white/10")}
          />
        ))}
      </div>

      {/* CTA: 3단계(또는 그 전 잎)까지 지역을 선택하면 하단에서 나타난다. */}
      {canApply && (
        <div className="bg-[#272727] px-4 pb-4.5">
          <CtaButton onClick={() => onApply(formatRegionPath(path))}>
            저장
          </CtaButton>
        </div>
      )}
    </>
  );
}

/**
 * 지역 필터 드로워. 앱 컬럼 전체를 덮으며 오른쪽에서 슬라이드로 열린다.
 * 시/도 · 구·시 · 동·구 세 열을 나란히 두고, 왼쪽에서 고르면 오른쪽 열에
 * 하위 지역이 채워진다. 3단계(또는 그 전 잎)까지 고르면 저장 버튼으로
 * 필터를 적용한다. 뒤로가기 버튼·배경·Esc로 닫는다. (공통 UI 지역 필터 드로워)
 */
export function RegionFilterDrawer({
  open,
  onOpenChange,
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

          <RegionFilterDrawerBody onApply={handleApply} />
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
