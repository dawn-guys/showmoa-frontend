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
}

/**
 * 라벨·인풋·에러 메시지를 묶은 텍스트 필드.
 * 포커스 시 주조색 테두리, 에러 시 에러색 테두리를 표현한다.
 */
export function TextField({
  label,
  error,
  hideLabel,
  endAdornment,
  id,
  className,
  ...props
}: TextFieldProps) {
  const reactId = React.useId();
  const inputId = id ?? reactId;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className={cn(
          "text-body3 font-medium text-foreground",
          hideLabel && "sr-only",
        )}
      >
        {label}
      </label>
      <div className="relative">
        <Input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "h-13 rounded-sm border-2 border-input bg-secondary px-4 text-sm font-medium text-foreground caret-primary placeholder:text-placeholder focus-visible:border-primary focus-visible:ring-0 aria-invalid:border-destructive aria-invalid:ring-0",
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
