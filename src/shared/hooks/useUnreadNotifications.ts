import { useQuery } from "@tanstack/react-query";
import { MOCK_UNREAD_NOTIFICATION_COUNT } from "@/shared/mocks/notification";

interface UseUnreadNotificationsOptions {
  /** 비로그인 상태에서는 조회하지 않도록 false로 끈다. 기본값 true. */
  enabled?: boolean;
}

/**
 * 읽지 않은 알림 개수. 헤더 종 아이콘의 알림 점 노출 여부를 판단하는 데 쓴다.
 */
export function useUnreadNotifications({
  enabled = true,
}: UseUnreadNotificationsOptions = {}) {
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications", "unread"],
    enabled,
    // MOCK: Phase 2에서 queryFn를 실제 알림 개수 요청으로 교체한다.
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return MOCK_UNREAD_NOTIFICATION_COUNT;
    },
  });

  return { unreadCount };
}
