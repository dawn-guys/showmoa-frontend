import { useQuery } from "@tanstack/react-query";
import { MOCK_NOTIFICATIONS } from "@/shared/mocks/notification";

/** 알림함 목록을 조회한다. 로딩 동안 스켈레톤을 노출하도록 인위적 지연을 둔다. */
export function useNotifications() {
  return useQuery({
    queryKey: ["notifications", "list"],
    // MOCK: Phase 2에서 queryFn를 실제 알림 목록 요청으로 교체한다.
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return MOCK_NOTIFICATIONS;
    },
  });
}
