"use client";

import * as React from "react";
import { notFound } from "next/navigation";
import { motion } from "motion/react";
import { z } from "zod";
import { TextField } from "@/shared/components/text-field";
import { CtaButton } from "@/shared/components/cta-button";
import { AnimatedToast } from "@/shared/components/toast";
import { VerificationTimer } from "@/shared/components/verification-timer";
import { useEmailVerification } from "@/shared/hooks/useEmailVerification";
import { cn } from "cn";

// UI 문구(docs/spec/auth.md · 회원가입/비밀번호 찾기/비밀번호 변경-공통).
const EMAIL_MAIN = "이메일을 인증해 주세요";
const EMAIL_SUB = "메일을 입력하면 인증 번호가 발송 돼요";
const EMAIL_PLACEHOLDER = "이메일을 입력해 주세요";
const EMAIL_FORMAT_ERROR = "이메일 형식을 확인해 주세요";
const EMAIL_REQUEST_ERROR = "유효하지 않은 이메일 입니다";
// CTA 문구는 spec에 없어 Figma(node 488:5172, 488:5572) 값을 따른다.
const SEND_CTA = "인증 메일 발송";

const CODE_MAIN = "인증 번호를 작성해 주세요";
const CODE_SUB = "전송 된 메일을 확인하고 번호를 작성해 주세요";
const CODE_PLACEHOLDER = "인증 번호 6자리를 작성해 주세요";
const CODE_FORMAT_ERROR = "숫자 6자리를 작성해 주세요";
const CODE_REQUEST_ERROR = "유효하지 않은 인증 번호 입니다";
const VERIFY_CTA = "완료";

const TOAST_ID = "email-verification-toast";

// 백엔드는 같은 이메일로 60초 안에 다시 발송하면 429로 거절한다. 이 값은 계약에
// 없어(응답에 담겨 오지 않는다) 상수로 둔다. 거절 상황의 문구가 docs/spec에
// 없으므로 재발송 버튼을 그동안 비활성으로 두어 요청 자체를 막는다.
const RESEND_COOLDOWN_SECONDS = 60;

const emailSchema = z.email();
// 인증 번호는 숫자 6자리.
const isValidCode = (code: string) => /^\d{6}$/.test(code);

interface EmailVerificationProps {
  /**
   * 인증 번호 검증에 성공하면 인증된 이메일과 함께 호출된다(다음 단계로 이동).
   * 뒤 단계의 요청(회원가입·비밀번호 재설정)이 이 이메일을 그대로 쓴다.
   */
  onVerified: (email: string) => void;
  /**
   * 인증할 이메일을 이 값으로 고정한다. 넘기면 이메일 인풋이 수정 불가가 되고
   * 형식 검증은 통과한 상태로 시작한다. 로그인 상태로 진행하는 비밀번호 변경이
   * 현재 계정 이메일(GET /api/users/me)을 고정하는 데 쓴다.
   *
   * 마운트 시점의 값만 쓴다. 값이 늦게 도착하는 화면은 값이 확정된 뒤에 이
   * 컴포넌트를 렌더해야 한다.
   */
  fixedEmail?: string;
}

/**
 * 이메일 인증 공통 블록. 회원가입 · 비밀번호 찾기 · 비밀번호 변경에서 동일하게
 * 쓰인다. 이메일 입력 → 인증 메일 발송 → 인증 번호 입력 → 완료의 2단계로
 * 진행한다. 블러 시 형식 검증(인풋 인라인 에러), 요청 실패 시 테두리 에러 +
 * 상단 토스트를 보여준다(docs/spec/common-ui.md · 인풋). 인증 번호 단계에는
 * 공통 UI 타이머가 붙고, 시간이 만료되면 404 페이지로 넘어간다.
 *
 * 요청은 useEmailVerification(POST /api/email/send, /api/email/verify)이 맡고,
 * 타이머는 발송 응답의 expirationSeconds로 구동된다.
 */
export function EmailVerification({
  onVerified,
  fixedEmail,
}: EmailVerificationProps) {
  const { sendCode, isSending, verifyCode, isVerifying } =
    useEmailVerification();

  const [email, setEmail] = React.useState(fixedEmail ?? "");
  const [code, setCode] = React.useState("");

  // 발송 성공 시각(ms)과 응답의 유효 시간(초). 발송 전에는 null이고, 이 값이
  // 곧 단계 구분이자 타이머의 기준이다. 재발송에 성공하면 둘 다 갱신돼 타이머가
  // 처음부터 다시 흐른다.
  const [sentAt, setSentAt] = React.useState<number | null>(null);
  const [expirationSeconds, setExpirationSeconds] = React.useState(0);

  // 블러 형식 검증 실패 메시지(인풋 인라인 표시).
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [codeError, setCodeError] = React.useState<string | null>(null);
  // 요청 실패로 인한 테두리 에러(메시지는 토스트로 안내).
  const [emailInvalid, setEmailInvalid] = React.useState(false);
  const [codeInvalid, setCodeInvalid] = React.useState(false);

  const [toast, setToast] = React.useState<string | null>(null);
  // 타이머 만료 → 렌더 경로에서 notFound()로 404 이동.
  const [expired, setExpired] = React.useState(false);

  const emailValid = emailSchema.safeParse(email).success;
  const codeValid = isValidCode(code);

  // 토스트는 잠시 후 자동으로 사라진다.
  React.useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError(null);
    setEmailInvalid(false);
  };

  const handleEmailBlur = () => {
    // 값이 있는데 형식이 틀리면 인라인 에러를 표시한다(값이 없으면 통과).
    if (email && !emailValid) setEmailError(EMAIL_FORMAT_ERROR);
  };

  /** 인증 메일 발송. 성공하면 응답의 유효 시간으로 타이머를 새로 시작한다. */
  const requestCode = async () => {
    const { expirationSeconds: seconds } = await sendCode({ email });
    setExpirationSeconds(seconds);
    setSentAt(Date.now());
    setCode("");
    setCodeError(null);
    setCodeInvalid(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid) {
      setEmailError(EMAIL_FORMAT_ERROR);
      return;
    }
    try {
      await requestCode();
    } catch {
      // 발송 실패: 인풋 테두리 에러 + 상단 토스트(docs/spec/common-ui.md · 인풋).
      setEmailInvalid(true);
      setToast(EMAIL_REQUEST_ERROR);
    }
  };

  const handleResend = async () => {
    // 응답을 기다리는 동안 중복 발송을 막는다.
    if (isSending) return;
    try {
      await requestCode();
    } catch {
      // 재발송 단계의 이메일 인풋은 수정 불가라 테두리 에러 없이 토스트만 띄운다.
      setToast(EMAIL_REQUEST_ERROR);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 숫자만 6자리까지 입력받는다.
    setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
    setCodeError(null);
    setCodeInvalid(false);
  };

  const handleCodeBlur = () => {
    if (code && !codeValid) setCodeError(CODE_FORMAT_ERROR);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeValid) {
      setCodeError(CODE_FORMAT_ERROR);
      return;
    }
    try {
      await verifyCode({ email, code });
    } catch {
      setCodeInvalid(true);
      setToast(CODE_REQUEST_ERROR);
      return;
    }
    onVerified(email);
  };

  // 타이머 만료 시 404로 이동한다. 렌더 경로에서 throw되어 not-found 경계가 받는다.
  // 진행하던 단계가 사라지는 건 의도된 설계다(만료된 인증으로는 어차피 다음
  // 단계로 갈 수 없다). 버그로 오해해 되돌리지 말 것.
  if (expired) notFound();

  return (
    <div className="flex flex-1 flex-col px-4 pt-4 pb-5">
      {/* 상단 에러 토스트: 위에서 내려왔다가 일정 시간 뒤 사라진다. */}
      <AnimatedToast
        open={!!toast}
        message={toast ?? ""}
        variant="error"
        id={TOAST_ID}
      />

      {sentAt === null ? (
        <>
          <h2 className="text-h1 text-foreground">{EMAIL_MAIN}</h2>
          <p className="mt-2.5 text-sm font-medium break-keep text-muted-foreground">
            {EMAIL_SUB}
          </p>
          <form
            onSubmit={handleSend}
            className="mt-10 flex flex-1 flex-col"
            noValidate
          >
            <TextField
              label="이메일"
              hideLabel
              type="email"
              inputMode="email"
              autoComplete="off"
              enterKeyHint="send"
              placeholder={EMAIL_PLACEHOLDER}
              value={email}
              // 이메일이 고정된 화면(비밀번호 변경)은 수정 불가로 노출한다.
              readOnly={fixedEmail !== undefined}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              error={emailError ?? undefined}
              aria-invalid={emailInvalid || undefined}
              aria-describedby={emailInvalid && toast ? TOAST_ID : undefined}
            />
            <CtaButton
              type="submit"
              disabled={!emailValid}
              isLoading={isSending}
              className={cn(
                "mt-auto text-foreground",
                emailValid ? "hover:cursor-pointer" : "cursor-not-allowed",
              )}
            >
              {SEND_CTA}
            </CtaButton>
          </form>
        </>
      ) : (
        <>
          <h2 className="text-h1 text-foreground">{CODE_MAIN}</h2>
          <p className="mt-2.5 text-sm font-medium break-keep text-muted-foreground">
            {CODE_SUB}
          </p>
          <form
            onSubmit={handleVerify}
            className="mt-10 flex flex-1 flex-col"
            noValidate
          >
            {/* 발송한 이메일은 수정 불가 상태로 노출한다. */}
            <TextField
              label="이메일"
              hideLabel
              type="email"
              value={email}
              readOnly
            />
            {/* 두 번째 인풋: 아래에서 스르륵 올라오며(opacity 0→100) 나타난다. */}
            <motion.div
              className="mt-2.5"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <TextField
                label="인증 번호"
                hideLabel
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                enterKeyHint="done"
                maxLength={6}
                placeholder={CODE_PLACEHOLDER}
                value={code}
                onChange={handleCodeChange}
                onBlur={handleCodeBlur}
                error={codeError ?? undefined}
                aria-invalid={codeInvalid || undefined}
                aria-describedby={codeInvalid && toast ? TOAST_ID : undefined}
              />
            </motion.div>
            {/* 타이머는 하단 CTA 바로 위에 가로 중앙으로 둔다(Figma node 488:5286). */}
            <div className="mt-auto flex justify-center">
              <VerificationTimer
                startedAt={sentAt}
                durationSeconds={expirationSeconds}
                resendCooldownSeconds={RESEND_COOLDOWN_SECONDS}
                onExpire={() => setExpired(true)}
                onResend={handleResend}
              />
            </div>
            <CtaButton
              type="submit"
              disabled={!codeValid}
              isLoading={isVerifying}
              className={cn(
                "mt-[50px] text-foreground",
                codeValid ? "hover:cursor-pointer" : "cursor-not-allowed",
              )}
            >
              {VERIFY_CTA}
            </CtaButton>
          </form>
        </>
      )}
    </div>
  );
}
