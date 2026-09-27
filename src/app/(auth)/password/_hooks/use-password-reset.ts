"use client";

import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/shared/lib/api";
import type { PasswordResetRequest } from "@/shared/types/auth";

/**
 * 비밀번호 재설정 요청. 비밀번호 찾기(/password/find)와
 * 비밀번호 변경(/password/update)이 같은 엔드포인트를 쓴다.
 *
 * 앞 단계에서 이메일 인증을 통과한 이메일만 받아들인다(백엔드가 인증 여부를
 * 먼저 확인하고, 인증이 없으면 400을 돌려준다). 토큰은 필요 없다.
 *
 * 캐시에 담을 서버 상태가 없어 무효화 대상도 없다. 실패는 ApiError로 올라오고
 * 사용자 문구는 화면이 docs/spec에서 가져온다.
 */
export function usePasswordReset() {
  const reset = useMutation({
    mutationFn: (body: PasswordResetRequest) =>
      apiFetch<void>("/api/users/password/reset", { method: "POST", body }),
  });

  return {
    /** 새 비밀번호로 재설정한다. 성공하면 본문 없이 200이 돌아온다. */
    resetPassword: reset.mutateAsync,
    isResetting: reset.isPending,
  };
}
