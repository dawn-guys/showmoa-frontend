"use client";

import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/shared/lib/api";
import type { SignupRequest, UserResponse } from "@/shared/types/auth";

/**
 * 회원가입 요청. 앞 단계에서 이메일 인증을 통과한 이메일만 받아들인다
 * (백엔드가 인증 여부를 확인하고, 확인과 동시에 인증 상태를 소모한다).
 *
 * 가입 시점에는 아직 토큰이 없다. 로그인은 완료 화면의 CTA가 useLogin으로
 * 따로 수행한다.
 */
export function useSignup() {
  const signup = useMutation({
    mutationFn: (body: SignupRequest) =>
      apiFetch<UserResponse>("/api/users/signup", { method: "POST", body }),
  });

  return { signup: signup.mutateAsync, isSigningUp: signup.isPending };
}
