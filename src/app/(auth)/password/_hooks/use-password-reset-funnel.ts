"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";

/**
 * 비밀번호 재설정 퍼널 단계. 이메일 인증 → 새 비밀번호 설정의 2단계로 진행한다.
 * 비밀번호 찾기(/password/find)와 비밀번호 변경(/password/update)이 공유한다.
 */
export const PASSWORD_RESET_STEPS = ["email", "password"] as const;

export type PasswordResetStep = (typeof PASSWORD_RESET_STEPS)[number];

/**
 * 현재 단계를 URL(?step=)로 관리한다. 단계 이동은 history replace라
 * 단계가 히스토리에 쌓이지 않고, 어느 단계에서든 뒤로가면 화면을 벗어나
 * 이전 페이지로 간다. 인증을 마친 뒤 이메일 단계로 돌아와 재발송 제한(429)에
 * 걸리는 일을 막는다.
 */
export function usePasswordResetFunnel() {
  const [step, setStep] = useQueryState(
    "step",
    parseAsStringLiteral(PASSWORD_RESET_STEPS)
      .withDefault("email")
      .withOptions({ history: "replace" }),
  );

  return { step, goTo: setStep };
}
