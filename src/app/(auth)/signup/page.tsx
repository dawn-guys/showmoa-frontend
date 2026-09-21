"use client";

import { AppBar } from "@/app/_components/app-bar";
import { EmailVerification } from "@/shared/components/email-verification";
import { PasswordSetup } from "@/shared/components/password-setup";
import { AgreementStep } from "./_components/agreement-step";
import { SignupComplete } from "./_components/signup-complete";
import { useSignupFunnel } from "./_hooks/use-signup-funnel";

/**
 * 회원가입 퍼널 호스트. 약관 동의 → 이메일 인증 → 비밀번호 설정 → 가입 완료의
 * 4단계를 ?step= 값에 따라 전환한다.
 */
export default function SignupPage() {
  const { step, goTo } = useSignupFunnel();

  return (
    <div className="flex min-h-dvh flex-col pb-safe">
      <AppBar title="회원 가입" />
      <main className="flex flex-1 flex-col">
        {step === "agreement" && <AgreementStep onNext={() => goTo("email")} />}
        {step === "email" && (
          <EmailVerification onVerified={() => goTo("password")} />
        )}
        {step === "password" && (
          // MOCK: 실제 가입 요청은 Phase 2. 비밀번호 확인까지 통과하면 가입 완료로 넘어간다.
          <PasswordSetup onComplete={() => goTo("done")} />
        )}
        {step === "done" && <SignupComplete />}
      </main>
    </div>
  );
}
