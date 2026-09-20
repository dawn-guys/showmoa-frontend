"use client";

import * as React from "react";
import { cn } from "cn";
import { Input } from "@/shared/components/ui/input";

interface TextFieldProps extends Omit<
  React.ComponentProps<typeof Input>,
  "id"
> {
  /** 라벨 텍스트(접근성용). hideLabel이 true여도 마크업에는 남는다. */
  label: string;
  /** 검증 실패 메시지. 있으면 에러 스타일 + aria-invalid가 적용된다. */
  error?: string;
  /** 라벨을 시각적으로만 숨긴다(플레이스홀더만 노출하는 디자인). */
  hideLabel?: boolean;
  /** 인풋 오른쪽 끝에 배치할 요소(비밀번호 눈 토글 등). */
  endAdornment?: React.ReactNode;
  id?: string;
  /** RHF register 등에서 인풋 DOM에 접근하기 위한 ref. */
  ref?: React.Ref<HTMLInputElement>;
}

// 라벨 스타일: 12px(text-body3) + 미디움 + 자간 10% + 주조색.
const LABEL_CLASS = "text-body3 font-medium tracking-[0.1em] text-primary";

/**
 * 라벨·인풋·에러 메시지를 묶은 공통 텍스트 필드.
 * 포커스 시 주조색 테두리, 에러 시 에러색 테두리를 표현하며,
 * 입력 캐럿은 주조색(caret-primary)으로 통일한다.
 */
export function TextField({
  label,
  error,
  hideLabel,
  endAdornment,
  id,
  className,
  ref,
  ...props
}: TextFieldProps) {
  const reactId = React.useId();
  const inputId = id ?? reactId;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      {/* text-body3(커스텀 폰트사이즈)를 cn으로 text-primary와 함께 넘기면
          tailwind-merge가 같은 text-* 그룹으로 보고 text-body3를 지운다.
          보일 때는 평문 문자열로 적용해 병합을 거치지 않고, 숨길 때만 병합한다. */}
      <label
        htmlFor={inputId}
        className={hideLabel ? cn(LABEL_CLASS, "sr-only") : LABEL_CLASS}
      >
        {label}
      </label>
      <div className="relative">
        <Input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            // 기본 테두리는 투명이라 포커스/에러 시에만 색이 드러나 레이아웃이 흔들리지 않는다.
            // 인풋 글자는 iOS 자동 확대(16px 미만) 방지를 위해 text-base를 유지한다.
            "h-11 rounded-sm border-2 border-transparent bg-secondary px-4 text-base font-medium text-foreground caret-primary placeholder:text-placeholder focus-visible:border-primary focus-visible:ring-0 aria-invalid:border-destructive aria-invalid:ring-0",
            endAdornment && "pr-12",
            className,
          )}
          {...props}
        />
        {endAdornment && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            {endAdornment}
          </div>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-body3 text-primary">
          {error}
        </p>
      )}
    </div>
  );
}
