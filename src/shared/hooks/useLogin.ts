"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionFetch } from "@/shared/lib/api";
import type { LoginRequest } from "@/shared/types/auth";

/**
 * 로그인 요청 계층. 로그인 화면과 회원가입 완료 화면(자동 로그인)이 함께 쓴다.
 *
 * 토큰은 응답 본문으로 오지 않는다. 전용 라우트 핸들러(/api/auth/login)가
 * 백엔드의 TokenResponse를 httpOnly 쿠키에 심고 204만 돌려주므로, 성공하면
 * 현재 사용자 쿼리만 무효화해 화면을 로그인 상태로 바꾼다.
 */
export function useLogin() {
  const queryClient = useQueryClient();

  const login = useMutation({
    mutationFn: (body: LoginRequest) =>
      sessionFetch("/api/auth/login", { body }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] }),
  });

  return { login: login.mutateAsync, isLoggingIn: login.isPending };
}
