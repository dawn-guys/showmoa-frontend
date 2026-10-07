"use client";

import * as React from "react";
import { AppBar } from "@/app/_components/app-bar";
import { EmailVerification } from "@/shared/components/email-verification";
import { PasswordSetup } from "@/shared/components/password-setup";
import { AnimatedToast } from "@/shared/components/toast";
import { isApiError } from "@/shared/lib/api-error";
import { AgreementStep } from "./_components/agreement-step";
import { SignupComplete } from "./_components/signup-complete";
import { useSignupFunnel } from "./_hooks/use-signup-funnel";
import { useSignup } from "./_hooks/use-signup";

// 가입 실패 토스트 문구. docs/spec/auth.md에 이 경우의 문구가 없어 기존 스펙
// 문구의 말투에 맞춰 정했다(확정되면 docs/spec으로 옮긴다).
const DUPLICATE_EMAIL_ERROR = "이미 가입된 이메일 입니다. 로그인 해 주세요";
const UNVERIFIED_EMAIL_ERROR =
  "인증 시간이 만료 됐어요. 이메일 인증을 다시 해 주세요";
const SIGNUP_ERROR = "가입에 실패했어요. 잠시 후 다시 시도해 주세요";

const TOAST_ID = "signup-error-toast";

/**
 * 회원가입 퍼널 호스트. 약관 동의 → 이메일 인증 → 비밀번호 설정 → 가입 완료의
 * 4단계를 ?step= 값에 따라 전환한다.
 *
 * 인증된 이메일과 비밀번호는 이 컴포넌트의 상태로만 들고 있는다. URL(?step=)에
 * 담기는 것은 단계 이름뿐이고, 비밀번호는 스토리지에도 남기지 않는다. 그래서
 * 새로고침으로 상태가 사라지면 해당 단계를 진행할 수 없어 첫 단계부터 다시 받는다.
 */
export default function SignupPage() {
  const { step, goTo } = useSignupFunnel();
  const { signup, isSigningUp } = useSignup();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [toast, setToast] = React.useState<string | null>(null);

  // 토스트는 잠시 후 자동으로 사라진다.
  React.useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // 앞 단계의 입력이 없으면(새로고침·URL 직접 접근) 그 단계를 진행할 수 없다.
  // 렌더 시점에 첫 단계로 되돌려 잘못된 요청이 나가지 않게 한다.
  const currentStep =
    (step === "password" && !email) || (step === "done" && !password)
      ? "agreement"
      : step;

  const handleVerified = (verifiedEmail: string) => {
    setEmail(verifiedEmail);
    goTo("password");
  };

  const handlePasswordComplete = async (newPassword: string) => {
    try {
      await signup({ email, password: newPassword });
    } catch (error) {
      // 409는 이미 가입된 이메일, 400은 이메일 인증이 만료됐거나 이미 소모된
      // 경우다(형식·비밀번호 규칙 위반은 화면 검증이 더 엄격해 여기까지 오지
      // 않는다). 인증이 풀렸으면 비밀번호 단계에 남아 있어도 다시 시도할 수
      // 없으므로 이메일 인증 단계로 되돌린다.
      if (isApiError(error) && error.status === 409) {
        setToast(DUPLICATE_EMAIL_ERROR);
      } else if (isApiError(error) && error.status === 400) {
        setToast(UNVERIFIED_EMAIL_ERROR);
        setEmail("");
        goTo("email");
      } else {
        setToast(SIGNUP_ERROR);
      }
      return;
    }
    setPassword(newPassword);
    goTo("done");
  };

  return (
    <div className="flex min-h-dvh flex-col pb-safe">
      <AppBar title="회원 가입" />
      {/* 상단 에러 토스트: 단계가 바뀌어도 유지되도록 퍼널 호스트가 들고 있는다. */}
      <AnimatedToast
        open={!!toast}
        message={toast ?? ""}
        variant="error"
        id={TOAST_ID}
      />
      <main className="flex flex-1 flex-col">
        {currentStep === "agreement" && (
          <AgreementStep onNext={() => goTo("email")} />
        )}
        {currentStep === "email" && (
          <EmailVerification purpose="SIGNUP" onVerified={handleVerified} />
        )}
        {currentStep === "password" && (
          <PasswordSetup
            onComplete={handlePasswordComplete}
            isSubmitting={isSigningUp}
          />
        )}
        {currentStep === "done" && (
          <SignupComplete email={email} password={password} />
        )}
      </main>
    </div>
  );
}
