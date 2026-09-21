"use client";

import { useNotifications } from "../_hooks/useNotifications";
import { groupNotificationsByDay } from "../_lib/group-notifications";
import { NotificationItem } from "./notification-item";
import { NotificationSkeleton } from "./notification-skeleton";

/**
 * 알림함 본문. 로딩 중에는 스켈레톤을, 이후에는 요일별로 묶은 알림 목록을 렌더한다.
 */
export function NotificationList() {
  const { data: notifications, isPending } = useNotifications();

  if (isPending) return <NotificationSkeleton />;

  const groups = groupNotificationsByDay(notifications ?? []);

  return (
    <div className="flex flex-col gap-6 px-4 pt-2">
      {groups.map((group) => (
        <section
          key={group.daysAgo}
          aria-labelledby={`noti-group-${group.daysAgo}`}
        >
          <h2
            id={`noti-group-${group.daysAgo}`}
            className="text-body1 font-medium text-foreground"
          >
            {group.label}
          </h2>
          <ul className="mt-1">
            {group.items.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
