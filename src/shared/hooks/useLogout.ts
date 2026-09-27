"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionFetch } from "@/shared/lib/api";

/**
 * 로그아웃 요청 계층.
 *
 * 토큰은 httpOnly 쿠키에 있어 이 코드가 읽거나 지울 수 없다. 전용 라우트
 * 핸들러(/api/auth/logout)가 백엔드 POST /api/auth/logout을 부르고, 그 요청이
 * 실패해도 쿠키는 반드시 지운 뒤 204를 돌려준다.
 *
 * 라우트에 닿지도 못한 경우(네트워크 단절 등)까지 고려해 성공·실패와 무관하게
 * 현재 사용자 쿼리를 비운다. 화면은 곧바로 비로그인 상태가 되고, 다음 조회에서
 * 서버 기준 상태로 다시 맞춰진다.
 */
export function useLogout() {
  const queryClient = useQueryClient();

  const logout = useMutation({
    mutationFn: () => sessionFetch("/api/auth/logout"),
    onSettled: async () => {
      queryClient.setQueryData(["auth", "me"], null);
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });

  return { logout: logout.mutateAsync, isLoggingOut: logout.isPending };
}
