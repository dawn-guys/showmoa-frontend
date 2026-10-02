"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/shared/lib/api";

/**
 * 회원 탈퇴 요청 계층.
 *
 * 본인 확인용 현재 비밀번호를 담아 DELETE /api/users/me를 호출한다
 * (계약: body { password }, 성공 200). 비밀번호 불일치 등 실패는 ApiError로
 * 올라가 화면이 토스트로 안내한다.
 *
 * 성공하면 계정이 사라지므로 로그아웃과 동일하게 현재 사용자 쿼리를 비운다.
 * 남은 httpOnly 쿠키 정리는 화면이 로그아웃 라우트로 처리한다.
 */
export function useWithdraw() {
  const queryClient = useQueryClient();

  const withdraw = useMutation({
    mutationFn: (password: string) =>
      apiFetch<void>("/api/users/me", { method: "DELETE", body: { password } }),
    onSuccess: async () => {
      queryClient.setQueryData(["auth", "me"], null);
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });

  return { withdraw: withdraw.mutateAsync, isWithdrawing: withdraw.isPending };
}
