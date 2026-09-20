"use client";

import { AppBar } from "@/app/_components/app-bar";
import { AgreementStep } from "./_components/agreement-step";
import { useSignupFunnel } from "./_hooks/use-signup-funnel";

/**
 * 회원가입 퍼널 호스트. 약관 동의 → 이메일 인증 → 비밀번호 설정 → 가입 완료의
 * 4단계를 ?step= 값에 따라 전환한다. 현재는 1단계(약관 동의)까지 구현했다.
 */
export default function SignupPage() {
  const { step, goTo } = useSignupFunnel();

  return (
    <div className="flex min-h-dvh flex-col pb-safe">
      <AppBar title="회원 가입" />
      <main className="flex flex-1 flex-col">
        {step === "agreement" ? (
          <AgreementStep onNext={() => goTo("email")} />
        ) : (
          // 이메일 인증·비밀번호 설정·가입 완료 단계는 디자인 확정 후 구현한다.
          <p className="px-4 pt-4 text-sm text-muted-foreground">
            다음 단계는 준비 중입니다.
          </p>
        )}
      </main>
    </div>
  );
}
