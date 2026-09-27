"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/shared/lib/api";
import { isApiError } from "@/shared/lib/api-error";

/**
 * 공연 찜(좋아요) 토글. 현재 찜 상태(isWished)를 받아 반대 동작을 호출한다.
 *  - 찜 추가: POST /api/wishlists/{id} (201)
 *  - 찜 취소: DELETE /api/wishlists/{id} (204)
 *
 * POST가 409(이미 찜한 공연)를 주면 이미 원하는 상태이므로 성공으로 취급한다.
 * 성공하면 상세 쿼리를 무효화해 서버 기준 isWished를 다시 반영한다.
 */
export function useToggleWishlist(id: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (isWished: boolean) => {
      if (isWished) {
        await apiFetch<void>(`/api/wishlists/${id}`, { method: "DELETE" });
        return;
      }
      try {
        await apiFetch<void>(`/api/wishlists/${id}`, { method: "POST" });
      } catch (error) {
        // 409(이미 찜한 공연)는 이미 원하는 상태이므로 성공처럼 넘어간다.
        if (isApiError(error) && error.status === 409) return;
        throw error;
      }
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["detail", id] }),
  });

  return { toggle: mutation.mutate, isToggling: mutation.isPending };
}
