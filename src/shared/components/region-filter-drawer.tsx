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

/** 선택 경로(path)로부터 화면에 나란히 보일 두 열의 목록과 선택값을 계산한다. */
function derivePanes(path: RegionNode[]) {
  const last = path.at(-1) ?? null;
  // 잎(더 내려갈 곳이 없는 값)을 골랐으면 그 부모 레벨을 왼쪽에 유지해
  // 형제 잎들 사이에서 다시 고를 수 있게 한다. 아니면 마지막 값을 왼쪽에 둔다.
  const leftLevel =
    last && isLeafRegion(last)
      ? Math.max(path.length - 2, 0)
      : Math.max(path.length - 1, 0);
  const leftParent = leftLevel === 0 ? null : path[leftLevel - 1];
  const leftList = leftParent?.children ?? REGIONS;
  const leftSelected = path[leftLevel] ?? null;
  const rightList = leftSelected?.children ?? [];
  const rightSelected = path[leftLevel + 1] ?? null;
  return { leftLevel, leftList, leftSelected, rightList, rightSelected };
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
        "h-full overflow-y-auto overscroll-contain py-2",
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
  // 시/도 → 구/시 → 동/구 … 잎까지 이어지는 선택 경로.
  const [path, setPath] = useState<RegionNode[]>([]);
  const { leftLevel, leftList, leftSelected, rightList, rightSelected } =
    derivePanes(path);

  // 왼쪽 열에서 고르면 해당 레벨을 교체하고 그 아래 선택은 버린다.
  const selectLeft = (node: RegionNode) =>
    setPath([...path.slice(0, leftLevel), node]);
  // 오른쪽 열(하위)에서 고르면 경로를 한 단계 더 내려간다.
  const selectRight = (node: RegionNode) =>
    setPath([...path.slice(0, leftLevel + 1), node]);

  const last = path.at(-1) ?? null;
  // 잎까지 내려갔을 때만 지역 필터링을 적용할 수 있다.
  const canApply = last !== null && isLeafRegion(last);

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

      {/* 지역 목록 두 열. 왼쪽에서 고르면 오른쪽에 하위 지역이 나타난다. */}
      <div className="flex min-h-0 flex-1 bg-[#272727]">
        <RegionColumn
          label="시/도 선택"
          list={leftList}
          selected={leftSelected}
          onSelect={selectLeft}
          className="w-[32%] shrink-0 border-r border-white/10"
        />
        <RegionColumn
          label="하위 지역 선택"
          list={rightList}
          selected={rightSelected}
          onSelect={selectRight}
          className="flex-1"
        />
      </div>

      {/* CTA: 잎까지 지역을 선택하면 하단에서 나타난다. */}
      {canApply && (
        <div className="px-4 pt-3 pb-safe">
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
 * 시/도부터 잎(동·읍·면 등)까지 두 열을 오가며 깊이 있게 내려가 지역을
 * 고르고, 잎을 선택하면 저장 버튼으로 필터를 적용한다. 뒤로가기 버튼·
 * 배경·Esc로 닫는다. (공통 UI 지역 필터 드로워)
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
