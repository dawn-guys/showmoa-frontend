"use client";

import * as React from "react";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { useAuth } from "@/shared/hooks/useAuth";
import type { UserResponse } from "@/shared/types/auth";
import { SocialWithdrawForm } from "./social-withdraw-form";
import { WithdrawForm } from "./withdraw-form";

/**
 * 회원 탈퇴 분기. 현재 계정의 hasPassword(GET /api/users/me)로 나눈다.
 * 비밀번호가 있는 일반 계정은 비밀번호 확인, 소셜 계정(google·kakao)은 이메일
 * 인증으로 본인을 확인한다.
 */
export function WithdrawFlow() {
  const { user, isLoading } = useAuth();

  // 처음 확정된 계정. 탈퇴에 성공하면 홈으로 떠나기 전에 사용자 쿼리가 먼저
  // 비워지는데, 그 사이 분기가 바뀌어 다른 폼이 깜빡이지 않도록 붙잡아 둔다.
  const [account, setAccount] = React.useState<UserResponse | null>(null);
  if (user && account === null) setAccount(user);
  const current = account ?? user;

  // 계정 유형을 알아야 화면을 고를 수 있어 세션 확인이 끝날 때까지 기다린다
  // (docs/spec/common-ui.md · 로딩 스피너).
  if (isLoading && !current) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (current && !current.hasPassword) {
    return <SocialWithdrawForm email={current.email} />;
  }

  return <WithdrawForm />;
}
