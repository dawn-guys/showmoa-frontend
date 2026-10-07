"use client";

import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/shared/lib/api";
import type {
  EmailSendRequest,
  EmailSendResponse,
  EmailVerifyRequest,
} from "@/shared/types/auth";

/**
 * 이메일 인증 요청 계층. 회원가입 · 비밀번호 찾기 · 비밀번호 변경 · 회원 탈퇴가
 * 같은 엔드포인트를 쓰므로 공통 블록(EmailVerification)이 이 훅 하나만 사용한다.
 * 발송 요청의 purpose로 용도를 구분한다.
 *
 * 캐시에 담을 서버 상태가 없어 무효화 대상도 없다. 실패는 ApiError로 올라오고
 * 사용자 문구는 화면이 docs/spec에서 가져온다.
 */
export function useEmailVerification() {
  const send = useMutation({
    mutationFn: (body: EmailSendRequest) =>
      apiFetch<EmailSendResponse>("/api/email/send", {
        method: "POST",
        body,
      }),
  });

  const verify = useMutation({
    mutationFn: (body: EmailVerifyRequest) =>
      apiFetch<void>("/api/email/verify", { method: "POST", body }),
  });

  return {
    /** 인증 메일을 보낸다. 응답의 expirationSeconds가 타이머를 구동한다. */
    sendCode: send.mutateAsync,
    isSending: send.isPending,
    /** 인증 번호를 검증한다. 성공하면 본문 없이 200이 돌아온다. */
    verifyCode: verify.mutateAsync,
    isVerifying: verify.isPending,
  };
}
