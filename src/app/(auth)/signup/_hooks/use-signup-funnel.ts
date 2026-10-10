"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";

/**
 * 회원가입 퍼널 단계. 약관 동의 → 이메일 인증 → 비밀번호 설정 → 가입 완료의
 * 4단계로 진행한다. (현재 화면 구현은 약관 동의 단계까지)
 */
export const SIGNUP_STEPS = ["agreement", "email", "password", "done"] as const;

export type SignupStep = (typeof SIGNUP_STEPS)[number];

/**
 * 현재 단계를 URL(?step=)로 관리한다. 단계 이동은 history replace라
 * 단계가 히스토리에 쌓이지 않고, 어느 단계에서든 뒤로가면 회원가입 화면을
 * 벗어나 이전 페이지로 간다. 인증을 마친 뒤 이메일 단계로 돌아와 재발송
 * 제한(429)에 걸리거나, 가입 완료 후 비밀번호 단계로 돌아가 다시 제출하는
 * 일을 막는다.
 */
export function useSignupFunnel() {
  const [step, setStep] = useQueryState(
    "step",
    parseAsStringLiteral(SIGNUP_STEPS)
      .withDefault("agreement")
      .withOptions({ history: "replace" }),
  );

  return { step, goTo: setStep };
}
