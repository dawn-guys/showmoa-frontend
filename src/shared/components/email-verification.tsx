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
import { isApiError } from "@/shared/lib/api-error";
import type { EmailPurpose } from "@/shared/types/auth";
import { cn } from "cn";

// UI 문구(docs/spec/auth.md · 회원가입/비밀번호 찾기/비밀번호 변경-공통).
const EMAIL_MAIN = "이메일을 인증해 주세요";
const EMAIL_SUB = "메일을 입력하면 인증 번호가 발송 돼요";
const EMAIL_PLACEHOLDER = "이메일을 입력해 주세요";
const EMAIL_FORMAT_ERROR = "이메일 형식을 확인해 주세요";
const EMAIL_REQUEST_ERROR = "유효하지 않은 이메일 입니다";
// 회원가입 발송 단계에서 이미 가입된 이메일(응답 emailExists true, sent false).
const EMAIL_DUPLICATE_ERROR = "이미 가입된 이메일이에요. 로그인해 주세요";
// 발송 제한(429). 같은 이메일 60초 재발송 제한과 IP 발송 횟수 제한이 같은
// 응답으로 와 남은 시간을 알 수 없으므로 문구에 시간을 넣지 않는다.
const EMAIL_COOLDOWN_ERROR = "잠시 후 다시 시도해 주세요";
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
// 없어(응답에 담겨 오지 않는다) 상수로 둔다. 재발송 버튼을 그동안 비활성으로
// 두어 요청 자체를 막고, 그래도 429가 오면 발송 제한 토스트를 띄운다.
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
   * 인증 메일 발송 용도. 백엔드가 용도별로 발송 여부를 판단한다
   * (회원가입 SIGNUP · 비밀번호 찾기/변경 PASSWORD_RESET · 회원 탈퇴 WITHDRAWAL).
   */
  purpose: EmailPurpose;
  /**
   * 마운트 직후 고정 이메일로 인증 메일을 바로 보낸다(회원 탈퇴). fixedEmail과
   * 함께 써야 한다. 발송에 실패하면 이메일 단계에 남아 발송 버튼으로 다시 보낸다.
   */
  autoSend?: boolean;
  /** 인증 번호 단계의 안내 문구·placeholder를 화면 전용 문구로 바꾼다(회원 탈퇴). */
  codeCopy?: { main: string; sub: string; placeholder: string };
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
 * 이메일 인증 공통 블록. 회원가입 · 비밀번호 찾기 · 비밀번호 변경 · 회원 탈퇴
 * (소셜 계정)에서 동일하게 쓰인다. 이메일 입력 → 인증 메일 발송 → 인증 번호
 * 입력 → 완료의 2단계로 진행한다. 블러 시 형식 검증(인풋 인라인 에러), 요청 실패 시 테두리 에러 +
 * 상단 토스트를 보여준다(docs/spec/common-ui.md · 인풋). 인증 번호 단계에는
 * 공통 UI 타이머가 붙고, 시간이 만료되면 404 페이지로 넘어간다.
 *
 * 요청은 useEmailVerification(POST /api/email/send, /api/email/verify)이 맡고,
 * 타이머는 발송 응답의 expirationSeconds로 구동된다.
 */
export function EmailVerification({
  onVerified,
  purpose,
  autoSend = false,
  codeCopy,
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
  // 검증을 통과한 번호. 서버는 검증에 성공하면 번호를 지워서 같은 번호로 다시
  // 요청하면 실패한다. 다음 단계가 같은 화면에 남는 경우(탈퇴 확인 모달 취소 후
  // 다시 완료)에는 재요청 없이 통과시킨다.
  const [verifiedCode, setVerifiedCode] = React.useState<string | null>(null);
  // 자동 발송은 한 번만 한다(개발 모드 StrictMode의 이펙트 재실행 대비).
  const autoSentRef = React.useRef(false);

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

  /**
   * 인증 메일 발송. 성공하면 응답의 유효 시간으로 타이머를 새로 시작하고 true를
   * 돌려준다. 백엔드가 메일을 보내지 않았으면(sent false) 사유 토스트를 띄우고
   * false를 돌려준다. 요청 자체의 실패는 throw한다.
   */
  const requestCode = async () => {
    const {
      expirationSeconds: seconds,
      emailExists,
      sent,
    } = await sendCode({ email, purpose });
    // 이전 백엔드는 sent를 주지 않으므로 false일 때만 거른다.
    if (sent === false) {
      setToast(
        purpose === "SIGNUP" && emailExists
          ? EMAIL_DUPLICATE_ERROR
          : EMAIL_REQUEST_ERROR,
      );
      return false;
    }
    setExpirationSeconds(seconds);
    setSentAt(Date.now());
    setCode("");
    setVerifiedCode(null);
    setCodeError(null);
    setCodeInvalid(false);
    return true;
  };

  /** 이메일 단계의 발송. 실패하면 인풋 테두리 에러 + 상단 토스트를 띄운다. */
  const sendFromEmailStep = async () => {
    try {
      if (!(await requestCode())) setEmailInvalid(true);
    } catch (error) {
      // 발송 제한은 입력값 문제가 아니므로 테두리 에러 없이 토스트만 띄운다.
      if (isApiError(error) && error.status === 429) {
        setToast(EMAIL_COOLDOWN_ERROR);
        return;
      }
      // 발송 실패: 인풋 테두리 에러 + 상단 토스트(docs/spec/common-ui.md · 인풋).
      setEmailInvalid(true);
      setToast(EMAIL_REQUEST_ERROR);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid) {
      setEmailError(EMAIL_FORMAT_ERROR);
      return;
    }
    await sendFromEmailStep();
  };

  // 자동 발송(회원 탈퇴): 진입하자마자 고정 이메일로 보낸다. 상태 갱신은 응답을
  // 받은 뒤 비동기로 일어난다.
  const onAutoSend = React.useEffectEvent(() => {
    void sendFromEmailStep();
  });
  React.useEffect(() => {
    if (!autoSend || autoSentRef.current) return;
    autoSentRef.current = true;
    onAutoSend();
  }, [autoSend]);

  const handleResend = async () => {
    // 응답을 기다리는 동안 중복 발송을 막는다.
    if (isSending) return;
    try {
      await requestCode();
    } catch (error) {
      // 재발송 단계의 이메일 인풋은 수정 불가라 테두리 에러 없이 토스트만 띄운다.
      setToast(
        isApiError(error) && error.status === 429
          ? EMAIL_COOLDOWN_ERROR
          : EMAIL_REQUEST_ERROR,
      );
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
    if (code === verifiedCode) {
      onVerified(email);
      return;
    }
    try {
      await verifyCode({ email, code });
    } catch {
      setCodeInvalid(true);
      setToast(CODE_REQUEST_ERROR);
      return;
    }
    setVerifiedCode(code);
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
          <h2 className="text-h1 text-foreground">
            {codeCopy?.main ?? CODE_MAIN}
          </h2>
          <p className="mt-2.5 text-sm font-medium break-keep text-muted-foreground">
            {codeCopy?.sub ?? CODE_SUB}
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
                placeholder={codeCopy?.placeholder ?? CODE_PLACEHOLDER}
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
