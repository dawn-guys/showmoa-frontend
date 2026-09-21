"use client";

import { useRouter } from "next/navigation";
import { AppBar } from "@/app/_components/app-bar";
import { EmailVerification } from "@/shared/components/email-verification";
import { PasswordSetup } from "@/shared/components/password-setup";
import { usePasswordResetFunnel } from "../_hooks/use-password-reset-funnel";

interface PasswordResetFlowProps {
  /** 앱바 제목. 비밀번호 찾기 / 비밀번호 변경만 다르다. */
  title: string;
}

/**
 * 비밀번호 재설정 공통 플로우 호스트. 이메일 인증 → 새 비밀번호 설정의 2단계를
 * ?step= 값에 따라 전환한다. 비밀번호 찾기(/password/find)와
 * 비밀번호 변경(/password/update)이 앱바 제목만 달리해 그대로 재사용한다.
 * UI는 회원가입의 이메일 인증·비밀번호 설정 공통 블록을 사용하고,
 * 비밀번호 문구는 "새로운 비밀번호" 변형(variant="reset")을 쓴다.
 */
export function PasswordResetFlow({ title }: PasswordResetFlowProps) {
  const router = useRouter();
  const { step, goTo } = usePasswordResetFunnel();

  const handleComplete = () => {
    // MOCK: 실제 비밀번호 재설정 요청은 Phase 2. 재설정 후 로그인 화면으로 이동한다.
    // replace라 뒤로가기로 재설정 퍼널로 돌아오지 않는다.
    router.replace("/login");
  };

  return (
    <div className="flex min-h-dvh flex-col pb-safe">
      <AppBar title={title} />
      <main className="flex flex-1 flex-col">
        {step === "email" && (
          <EmailVerification onVerified={() => goTo("password")} />
        )}
        {step === "password" && (
          <PasswordSetup variant="reset" onComplete={handleComplete} />
        )}
      </main>
    </div>
  );
}
