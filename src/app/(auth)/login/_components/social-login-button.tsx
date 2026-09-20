import * as React from "react";
import { cn } from "cn";

interface SocialLoginButtonProps extends React.ComponentProps<"button"> {
  /** 좌측에 고정 배치할 브랜드 아이콘 */
  icon: React.ReactNode;
}

/**
 * 소셜 로그인 CTA 버튼 공통 레이아웃.
 * 아이콘은 좌측 고정, 라벨은 버튼 전체 폭 기준 가운데 정렬(Figma).
 * 브랜드별 배경/글자색은 className으로 주입한다.
 */
export function SocialLoginButton({
  icon,
  className,
  children,
  type = "button",
  ...props
}: SocialLoginButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "relative flex h-11 w-full items-center justify-center rounded-sm text-sm font-medium outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring active:translate-y-px",
        className,
      )}
      {...props}
    >
      <span className="absolute inset-y-0 left-4 flex items-center">
        {icon}
      </span>
      {children}
    </button>
  );
}
