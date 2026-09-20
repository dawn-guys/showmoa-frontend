import * as React from "react";
import { cn } from "cn";
import { SocialLoginButton } from "./social-login-button";
import { GoogleIcon } from "./social-icons";

type GoogleLoginButtonProps = Omit<
  React.ComponentProps<typeof SocialLoginButton>,
  "icon" | "children"
>;

/** 구글 소셜 로그인 CTA 버튼. onClick 등 버튼 속성을 그대로 받는다. */
export function GoogleLoginButton({
  className,
  ...props
}: GoogleLoginButtonProps) {
  return (
    <SocialLoginButton
      icon={<GoogleIcon />}
      // 배경(브랜드 흰색)·글자색은 대응 토큰이 없어 하드코딩.
      className={cn("bg-[#f6f6f6] text-black/54", className)}
      {...props}
    >
      Google 로그인
    </SocialLoginButton>
  );
}
