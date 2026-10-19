"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AppBar } from "@/app/_components/app-bar";
import { GuestGate } from "@/shared/components/guest-gate";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { useAuth } from "@/shared/hooks/useAuth";
import { useLogout } from "@/shared/hooks/useLogout";
import type { UserResponse } from "@/shared/types/auth";
import { PasswordResetFlow } from "../_components/password-reset-flow";

/**
 * 비밀번호 변경(로그인 필요, proxy.ts 가드). 이메일 인증 → 새 비밀번호 설정
 * 공통 플로우를 재사용하며, 인증할 이메일은 현재 계정 이메일로 고정한다.
 * 비밀번호 찾기와 동일한 엔드포인트(POST /api/users/password/reset)를 쓴다.
 *
 * 재설정에 성공하면 백엔드가 이 계정의 모든 세션을 끊는다. 자동으로 다시
 * 로그인하지 않고 로그아웃 상태로 로그인 화면에 보내, 새 비밀번호로 직접
 * 로그인하게 한다(오너 결정).
 */
export default function UpdatePasswordPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { logout } = useLogout();

  // 처음 확정된 계정. 성공 후 로그아웃하면 사용자 쿼리가 이동보다 먼저 비워지는데,
  // 그 사이 비로그인 화면(GuestGate)이 깜빡이지 않도록 붙잡아 둔다.
  const [account, setAccount] = React.useState<UserResponse | null>(null);
  if (user && account === null) setAccount(user);
  const current = account ?? user;

  // 소셜 계정은 비밀번호가 없어 비밀번호 변경을 지원하지 않는다. URL로 직접
  // 들어오면 설정 화면으로 돌려보낸다(proxy.ts는 쿠키만 봐서 계정 유형을 모른다).
  const isSocial = !!current && !current.hasPassword;
  React.useEffect(() => {
    if (isSocial) router.replace("/setting");
  }, [isSocial, router]);

  // 현재 계정 이메일이 확정돼야 인증 대상을 고정할 수 있어, 세션 확인이 끝날
  // 때까지 기다린다(docs/spec/common-ui.md · 로딩 스피너). 소셜 계정은 이동하는
  // 동안 스피너를 유지해 인증 메일이 자동 발송되지 않게 한다.
  if ((isLoading && !current) || isSocial) {
    return (
      <div className="flex min-h-dvh flex-col pb-safe">
        <AppBar title="비밀번호 변경" />
        <main className="flex flex-1 items-center justify-center">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  // proxy.ts가 비로그인 접근을 막지만, 리프레시 쿠키가 있는데 갱신이 실패하면
  // 가드를 통과한 뒤 여기로 온다. 제목(h1)은 GuestGate가 들고 있어 앱바를 두지 않는다.
  if (!current) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center pb-safe">
        <GuestGate srHeading="비밀번호 변경" />
      </main>
    );
  }

  const handleReset = async () => {
    // 남은 httpOnly 쿠키를 먼저 지운다. 쿠키가 남아 있으면 proxy.ts가 /login
    // 접근을 홈으로 돌려보낸다.
    try {
      await logout();
    } catch {
      // 쿠키는 로그아웃 라우트가 요청 실패와 무관하게 지운다.
    }
    // 로그인 화면이 변경 완료 토스트를 띄운다(login/page.tsx · notice).
    router.replace("/login?notice=password-changed");
  };

  return (
    <PasswordResetFlow
      title="비밀번호 변경"
      fixedEmail={current.email}
      onReset={handleReset}
    />
  );
}
