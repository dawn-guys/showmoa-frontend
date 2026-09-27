"use client";

import * as React from "react";
import { motion } from "motion/react";
import { PasswordField } from "@/shared/components/password-field";
import { CtaButton } from "@/shared/components/cta-button";
import { cn } from "cn";

// UI 문구(docs/spec/auth.md · 회원가입/비밀번호 찾기/비밀번호 변경-공통).
// variant에 따라 메인 문구만 달라진다.
// - signup: "비밀번호를 설정/확인해 주세요"
// - reset : "새로운 비밀번호를 설정/확인해 주세요"(비밀번호 찾기·변경-공통)
const SET_MAIN = "비밀번호를 설정해 주세요";
const SET_MAIN_RESET = "새로운 비밀번호를 설정해 주세요";
const SET_SUB = "안전한 비밀번호를 설정해 주세요";
const SET_PLACEHOLDER = "영문, 숫자를 포함한 8자 이상을 작성 하세요";
const SET_ERROR = "영문, 숫자를 조합한 8자 이상으로 작성해 주세요";

const CONFIRM_MAIN = "비밀번호를 확인해 주세요";
const CONFIRM_MAIN_RESET = "새로운 비밀번호를 확인해 주세요";
const CONFIRM_SUB = "설정한 비밀번호를 확인해 주세요";
// spec 원문은 "비밀버호"(오타)라 Figma(node 488:5433) 값을 따른다.
const CONFIRM_PLACEHOLDER = "비밀번호를 확인해 주세요";
const CONFIRM_ERROR = "비밀 번호와 일치하지 않습니다. 비밀번호를 확인해 주세요";

// CTA 문구는 spec에 없어 Figma(node 488:5371, 488:5423) 값을 따른다.
const NEXT_CTA = "다음";

// 비밀번호 검증: 계약(SignupRequest·PasswordResetRequest)의
// pattern ^(?=.*[A-Za-z])(?=.*\d).+$ 와 minLength 8을 그대로 옮겼다. 대소문자를
// 가리지 않고, 최대 길이 제한은 없다.
const isValidPassword = (value: string) =>
  /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(value);

interface PasswordSetupProps {
  /** 비밀번호 설정·확인을 모두 통과하면 호출된다(다음 단계로 이동). */
  onComplete: (password: string) => void;
  /**
   * onComplete가 API 요청을 보내는 동안 확인 단계 CTA에 로딩을 표시한다
   * (docs/spec/common-ui.md · CTA 버튼 3).
   */
  isSubmitting?: boolean;
  /**
   * 문구 변형. "signup"은 회원가입(기본), "reset"은 비밀번호 찾기·변경의
   * "새로운 비밀번호" 문구를 사용한다(docs/spec/auth.md).
   */
  variant?: "signup" | "reset";
  /**
   * onComplete가 보낸 요청이 실패했다. 확인 인풋 테두리에 에러 색을 넣는다
   * (docs/spec/common-ui.md · 인풋 3). 문구는 호출 측 토스트가 안내한다.
   */
  submitFailed?: boolean;
  /** submitFailed일 때 확인 인풋과 aria-describedby로 연결할 토스트 id. */
  errorToastId?: string;
}

/**
 * 비밀번호 설정 공통 블록. 회원가입 · 비밀번호 찾기 · 비밀번호 변경에서 동일하게
 * 쓰인다. 비밀번호 설정 → 비밀번호 확인의 2단계로 진행하며, 블러 시 형식·일치
 * 검증(인풋 인라인 에러)을 보여준다(docs/spec/common-ui.md · 인풋). 검증은
 * 클라이언트에서만 이뤄져 별도 요청/토스트는 없다.
 */
export function PasswordSetup({
  onComplete,
  isSubmitting = false,
  variant = "signup",
  submitFailed = false,
  errorToastId,
}: PasswordSetupProps) {
  // 메인 문구만 variant에 따라 달라진다(서브·placeholder·에러는 동일).
  const setMain = variant === "reset" ? SET_MAIN_RESET : SET_MAIN;
  const confirmMain = variant === "reset" ? CONFIRM_MAIN_RESET : CONFIRM_MAIN;

  const [phase, setPhase] = React.useState<"set" | "confirm">("set");

  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");

  // 블러 검증 실패 메시지(인풋 인라인 표시).
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [confirmError, setConfirmError] = React.useState<string | null>(null);
  // 요청 실패 테두리는 호출 측이 넘기지만, 사용자가 확인 값을 고치면 바로
  // 걷어낸다(이메일 인증 블록의 요청 실패 처리와 동일한 동작).
  const [confirmEdited, setConfirmEdited] = React.useState(false);
  const showSubmitError = submitFailed && !confirmEdited;

  const passwordValid = isValidPassword(password);
  const confirmValid = confirm.length > 0 && confirm === password;

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordError(null);
  };

  const handlePasswordBlur = () => {
    // 값이 있는데 형식이 틀리면 인라인 에러를 표시한다(값이 없으면 통과).
    if (password && !passwordValid) setPasswordError(SET_ERROR);
  };

  const handleSetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValid) {
      setPasswordError(SET_ERROR);
      return;
    }
    // 비밀번호 확인 단계로 전환한다.
    setConfirm("");
    setConfirmError(null);
    setPhase("confirm");
  };

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirm(e.target.value);
    setConfirmError(null);
    setConfirmEdited(true);
  };

  const handleConfirmBlur = () => {
    // 값이 있는데 설정한 비밀번호와 다르면 인라인 에러를 표시한다.
    if (confirm && confirm !== password) setConfirmError(CONFIRM_ERROR);
  };

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmValid) {
      setConfirmError(CONFIRM_ERROR);
      return;
    }
    setConfirmEdited(false);
    onComplete(password);
  };

  return (
    <div className="flex flex-1 flex-col px-4 pt-4 pb-5">
      {phase === "set" ? (
        <>
          <h2 className="text-h1 text-foreground">{setMain}</h2>
          <p className="mt-2.5 text-sm font-medium break-keep text-muted-foreground">
            {SET_SUB}
          </p>
          <form
            onSubmit={handleSetSubmit}
            className="mt-10 flex flex-1 flex-col"
            noValidate
          >
            <PasswordField
              label="비밀번호"
              hideLabel
              autoComplete="new-password"
              enterKeyHint="next"
              placeholder={SET_PLACEHOLDER}
              value={password}
              onChange={handlePasswordChange}
              onBlur={handlePasswordBlur}
              error={passwordError ?? undefined}
            />
            <CtaButton
              type="submit"
              disabled={!passwordValid}
              className={cn(
                "mt-auto text-foreground",
                passwordValid ? "hover:cursor-pointer" : "cursor-not-allowed",
              )}
            >
              {NEXT_CTA}
            </CtaButton>
          </form>
        </>
      ) : (
        <>
          <h2 className="text-h1 text-foreground">{confirmMain}</h2>
          <p className="mt-2.5 text-sm font-medium break-keep text-muted-foreground">
            {CONFIRM_SUB}
          </p>
          <form
            onSubmit={handleConfirmSubmit}
            className="mt-10 flex flex-1 flex-col"
            noValidate
          >
            {/* 설정한 비밀번호는 수정 불가 상태로 노출한다(Figma node 488:5424). */}
            <PasswordField
              label="설정한 비밀번호"
              hideLabel
              autoComplete="new-password"
              value={password}
              readOnly
            />
            {/* 두 번째 인풋: 아래에서 스르륵 올라오며(opacity 0→100) 나타난다. */}
            <motion.div
              className="mt-2.5"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <PasswordField
                label="비밀번호 확인"
                hideLabel
                autoComplete="new-password"
                enterKeyHint="done"
                placeholder={CONFIRM_PLACEHOLDER}
                value={confirm}
                onChange={handleConfirmChange}
                onBlur={handleConfirmBlur}
                error={confirmError ?? undefined}
                aria-invalid={showSubmitError || undefined}
                aria-describedby={
                  showSubmitError && errorToastId ? errorToastId : undefined
                }
              />
            </motion.div>
            <CtaButton
              type="submit"
              disabled={!confirmValid}
              isLoading={isSubmitting}
              className={cn(
                "mt-auto text-foreground",
                confirmValid ? "hover:cursor-pointer" : "cursor-not-allowed",
              )}
            >
              {NEXT_CTA}
            </CtaButton>
          </form>
        </>
      )}
    </div>
  );
}
