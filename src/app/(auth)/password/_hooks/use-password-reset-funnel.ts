"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";

/**
 * 비밀번호 재설정 퍼널 단계. 이메일 인증 → 새 비밀번호 설정의 2단계로 진행한다.
 * 비밀번호 찾기(/password/find)와 비밀번호 변경(/password/update)이 공유한다.
 */
export const PASSWORD_RESET_STEPS = ["email", "password"] as const;

export type PasswordResetStep = (typeof PASSWORD_RESET_STEPS)[number];

/**
 * 현재 단계를 URL(?step=)로 관리한다. 단계 이동은 history push라
 * 모바일 뒤로가기 버튼으로 이전 단계로 돌아갈 수 있고, 첫 단계에서
 * 뒤로가면 화면을 벗어난다.
 */
export function usePasswordResetFunnel() {
  const [step, setStep] = useQueryState(
    "step",
    parseAsStringLiteral(PASSWORD_RESET_STEPS)
      .withDefault("email")
      .withOptions({ history: "push" }),
  );

  return { step, goTo: setStep };
}
