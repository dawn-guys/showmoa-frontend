"use client";

import { CheckCircleLinearIcon } from "@solar-icons/react";

interface AgreementCheckboxProps {
  /** 약관 이름(체크박스 접근성 이름) */
  label: string;
  /** 동의 여부 */
  checked: boolean;
  /** 동의 여부 토글 */
  onCheckedChange: (checked: boolean) => void;
  /** [ 자세히 보기 ] 클릭 시 약관 드로워를 연다 */
  onDetail: () => void;
}

/**
 * 원형 체크 아이콘 + 약관 이름 + [ 자세히 보기 ]로 이루어진 약관 동의 한 줄.
 * 체크 토글과 자세히 보기는 서로 다른 동작이라 버튼을 분리한다.
 * 아이콘 자체는 24px로 두되 버튼 터치 영역은 상하 패딩으로 44px까지 넓힌다.
 */
export function AgreementCheckbox({
  label,
  checked,
  onCheckedChange,
  onDetail,
}: AgreementCheckboxProps) {
  return (
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onCheckedChange(!checked)}
        className="-my-2.5 flex items-center gap-2.5 rounded-sm py-2.5 outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
      >
        {/* 체크 여부는 색으로만 구분한다: 미선택 회색, 선택 시 주조색 아웃라인. */}
        <CheckCircleLinearIcon
          size={24}
          className={checked ? "text-primary" : "text-hint"}
        />
        <span className="text-base font-medium text-foreground">{label}</span>
      </button>
      <button
        type="button"
        onClick={onDetail}
        aria-label={`${label} 자세히 보기`}
        className="-my-2.5 rounded-sm px-1 py-2.5 text-base font-normal text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        [ 자세히 보기 ]
      </button>
    </div>
  );
}
