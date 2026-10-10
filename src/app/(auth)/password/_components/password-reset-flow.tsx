"use client";

import * as React from "react";
import { AppBar } from "@/app/_components/app-bar";
import { EmailVerification } from "@/shared/components/email-verification";
import { PasswordSetup } from "@/shared/components/password-setup";
import { AnimatedToast } from "@/shared/components/toast";
import { isApiError } from "@/shared/lib/api-error";
import { usePasswordResetFunnel } from "../_hooks/use-password-reset-funnel";
import { usePasswordReset } from "../_hooks/use-password-reset";

// 재설정 실패 토스트 문구. docs/spec/auth.md에 이 경우의 문구가 없어 이메일
// 요청 실패 문구를 재사용한다(소유자 결정). 상태 코드로 문구를 나누지 않는다.
const RESET_ERROR = "유효하지 않은 이메일 입니다";

const TOAST_ID = "password-reset-error-toast";

interface PasswordResetFlowProps {
  /** 앱바 제목. 비밀번호 찾기 / 비밀번호 변경만 다르다. */
  title: string;
  /**
   * 인증할 이메일을 고정한다(비밀번호 변경). 넘기면 이메일 인풋이 수정 불가가
   * 되고, 입력할 값이 없으므로 진입하자마자 인증 메일을 자동 발송한다(회원
   * 탈퇴와 동일). 고정해도 인증 단계 자체는 건너뛰지 않는다.
   */
  fixedEmail?: string;
  /**
   * 재설정 성공 후 동작. 화면마다 달라서(로그인 화면 이동 / 로그아웃 후
   * 로그인 화면 이동) 호출 측이 정한다. 끝날 때까지 CTA 로딩이 유지된다.
   */
  onReset: (values: {
    email: string;
    password: string;
  }) => void | Promise<void>;
}

/**
 * 비밀번호 재설정 공통 플로우 호스트. 이메일 인증 → 새 비밀번호 설정의 2단계를
 * ?step= 값에 따라 전환한다. 비밀번호 찾기(/password/find)와
 * 비밀번호 변경(/password/update)이 그대로 재사용한다.
 * UI는 회원가입의 이메일 인증·비밀번호 설정 공통 블록을 사용하고,
 * 비밀번호 문구는 "새로운 비밀번호" 변형(variant="reset")을 쓴다.
 *
 * 두 화면 모두 POST /api/users/password/reset 하나로 처리한다. 계약의
 * PATCH /api/users/me/password는 currentPassword를 요구하는데 화면 정의서의
 * 비밀번호 변경 흐름에는 그 입력이 없어 쓰지 않는다(소유자 결정).
 *
 * 인증을 통과한 이메일은 이 컴포넌트의 상태로만 들고 있는다. URL(?step=)에
 * 담기는 것은 단계 이름뿐이라, ?step=password로 직접 들어오거나 새로고침하면
 * 이메일 인증부터 다시 받는다(fixedEmail이 있어도 마찬가지다).
 */
export function PasswordResetFlow({
  title,
  fixedEmail,
  onReset,
}: PasswordResetFlowProps) {
  const { step, goTo } = usePasswordResetFunnel();
  const { resetPassword, isResetting } = usePasswordReset();

  // 인증을 통과한 이메일. 재설정 요청은 이 값만 쓴다.
  const [verifiedEmail, setVerifiedEmail] = React.useState("");
  const [toast, setToast] = React.useState<string | null>(null);
  // 재설정 요청 실패. 확인 인풋 테두리에 에러 색을 넣는다
  // (docs/spec/common-ui.md · 인풋 3).
  const [resetFailed, setResetFailed] = React.useState(false);
  // 성공 후 동작(로그아웃·이동)이 끝날 때까지 CTA 로딩을 이어 둔다.
  const [isFinishing, setIsFinishing] = React.useState(false);

  // 토스트는 잠시 후 자동으로 사라진다.
  React.useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // 인증을 통과한 이메일이 없으면 비밀번호 단계를 진행할 수 없다. 렌더 시점에
  // 첫 단계로 되돌려 인증 없는 요청이 나가지 않게 한다.
  const currentStep = step === "password" && !verifiedEmail ? "email" : step;

  const handleVerified = (email: string) => {
    setVerifiedEmail(email);
    goTo("password");
  };

  const handleComplete = async (newPassword: string) => {
    setResetFailed(false);
    try {
      await resetPassword({ email: verifiedEmail, newPassword });
    } catch (error) {
      setResetFailed(true);
      setToast(RESET_ERROR);
      // 400은 이메일 인증이 만료됐거나 이미 소모된 경우다(형식·비밀번호 규칙
      // 위반은 화면 검증이 더 엄격해 여기까지 오지 않는다). 인증이 풀렸으면
      // 비밀번호 단계에 남아 있어도 다시 시도할 수 없으므로 이메일 인증
      // 단계로 되돌린다.
      if (isApiError(error) && error.status === 400) {
        setVerifiedEmail("");
        goTo("email");
      }
      return;
    }
    // 여기서부터는 비밀번호가 이미 바뀐 뒤다. onReset이 화면을 떠나므로
    // 로딩을 되돌리지 않는다.
    setIsFinishing(true);
    await onReset({ email: verifiedEmail, password: newPassword });
  };

  return (
    <div className="flex min-h-dvh flex-col pb-safe">
      <AppBar title={title} />
      {/* 상단 에러 토스트: 단계가 바뀌어도 유지되도록 퍼널 호스트가 들고 있는다. */}
      <AnimatedToast
        open={!!toast}
        message={toast ?? ""}
        variant="error"
        id={TOAST_ID}
      />
      <main className="flex flex-1 flex-col">
        {currentStep === "email" && (
          <EmailVerification
            purpose="PASSWORD_RESET"
            fixedEmail={fixedEmail}
            autoSend={fixedEmail !== undefined}
            onVerified={handleVerified}
          />
        )}
        {currentStep === "password" && (
          <PasswordSetup
            variant="reset"
            onComplete={handleComplete}
            isSubmitting={isResetting || isFinishing}
            submitFailed={resetFailed}
            errorToastId={TOAST_ID}
          />
        )}
      </main>
    </div>
  );
}
