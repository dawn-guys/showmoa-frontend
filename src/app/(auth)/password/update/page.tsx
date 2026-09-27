"use client";

import { useRouter } from "next/navigation";
import { AppBar } from "@/app/_components/app-bar";
import { GuestGate } from "@/shared/components/guest-gate";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { useAuth } from "@/shared/hooks/useAuth";
import { useLogin } from "@/shared/hooks/useLogin";
import { PasswordResetFlow } from "../_components/password-reset-flow";

/**
 * 비밀번호 변경(로그인 필요, proxy.ts 가드). 이메일 인증 → 새 비밀번호 설정
 * 공통 플로우를 재사용하며, 인증할 이메일은 현재 계정 이메일로 고정한다.
 * 비밀번호 찾기와 동일한 엔드포인트(POST /api/users/password/reset)를 쓴다.
 */
export default function UpdatePasswordPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { login } = useLogin();

  // 현재 계정 이메일이 확정돼야 인증 대상을 고정할 수 있어, 세션 확인이 끝날
  // 때까지 기다린다(docs/spec/common-ui.md · 로딩 스피너).
  if (isLoading) {
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
  if (!user) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center pb-safe">
        <GuestGate srHeading="비밀번호 변경" />
      </main>
    );
  }

  const handleReset = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    try {
      // 바뀐 비밀번호로 세션을 새로 딴다.
      await login({ email, password });
    } catch {
      // 비밀번호는 이미 바뀐 뒤다. 세션을 잇지 못했으면 직접 로그인하도록
      // 로그인 화면으로 보낸다.
      router.replace("/login");
      return;
    }
    router.replace("/setting");
  };

  return (
    <PasswordResetFlow
      title="비밀번호 변경"
      fixedEmail={user.email}
      onReset={handleReset}
    />
  );
}
