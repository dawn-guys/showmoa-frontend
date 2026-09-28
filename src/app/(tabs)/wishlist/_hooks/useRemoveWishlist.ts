import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/shared/lib/api";

/**
 * DELETE /api/performances/{performanceId}/wishlist 로 찜을 해제한다.
 * 종료된 공연도 해제할 수 있다.
 *
 * 계약이 낙관적 업데이트를 쓰지 않는 전제로 쓰여 있어(409를 성공으로 뭉개지
 * 않는다) 응답을 받은 뒤 찜 목록을 무효화해 서버 기준으로 다시 맞춘다.
 */
export function useRemoveWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (performanceId: number) =>
      apiFetch<void>(`/api/performances/${performanceId}/wishlist`, {
        method: "DELETE",
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });
}
