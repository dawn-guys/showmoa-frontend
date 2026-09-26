import { useQuery } from "@tanstack/react-query";
import { isApiError } from "@/shared/lib/api-error";
import { apiFetch } from "@/shared/lib/api";
import type { UserResponse } from "@/shared/types/auth";

/**
 * 현재 로그인 사용자. 비로그인은 에러가 아니라 user === null 상태다.
 * 백엔드가 401을 주면 프록시가 토큰 갱신을 한 번 시도하므로, 여기까지 401이
 * 올라온 경우는 세션이 없거나 갱신도 실패한 경우다.
 */
export function useAuth() {
  const { data: user = null, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        return await apiFetch<UserResponse>("/api/users/me");
      } catch (error) {
        if (isApiError(error) && error.status === 401) return null;
        throw error;
      }
    },
    retry: false,
  });

  return { user, isLoggedIn: user !== null, isLoading };
}
