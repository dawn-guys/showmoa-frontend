"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";

/**
 * 회원가입 퍼널 단계. 약관 동의 → 이메일 인증 → 비밀번호 설정 → 가입 완료의
 * 4단계로 진행한다. (현재 화면 구현은 약관 동의 단계까지)
 */
export const SIGNUP_STEPS = ["agreement", "email", "password", "done"] as const;

export type SignupStep = (typeof SIGNUP_STEPS)[number];

/**
 * 현재 단계를 URL(?step=)로 관리한다. 단계 이동은 history push라
 * 모바일 뒤로가기 버튼으로 이전 단계로 돌아갈 수 있고, 첫 단계에서
 * 뒤로가면 회원가입 화면을 벗어난다.
 */
export function useSignupFunnel() {
  const [step, setStep] = useQueryState(
    "step",
    parseAsStringLiteral(SIGNUP_STEPS)
      .withDefault("agreement")
      .withOptions({ history: "push" }),
  );

  return { step, goTo: setStep };
}
