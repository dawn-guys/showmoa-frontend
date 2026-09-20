import * as React from "react";
import { cn } from "cn";
import { SocialLoginButton } from "./social-login-button";
import { KakaoIcon } from "./social-icons";

type KakaoLoginButtonProps = Omit<
  React.ComponentProps<typeof SocialLoginButton>,
  "icon" | "children"
>;

/** 카카오 소셜 로그인 CTA 버튼. onClick 등 버튼 속성을 그대로 받는다. */
export function KakaoLoginButton({
  className,
  ...props
}: KakaoLoginButtonProps) {
  return (
    <SocialLoginButton
      icon={<KakaoIcon />}
      // 배경(브랜드 노란색)·글자색은 대응 토큰이 없어 하드코딩.
      className={cn("bg-[#fee500] text-black/85", className)}
      {...props}
    >
      카카오 로그인
    </SocialLoginButton>
  );
}
