import { differenceInCalendarDays, parseISO } from "date-fns";
import type { AppNotification } from "../_types";

export interface NotificationGroup {
  /** 오늘로부터 며칠 전인지(0 = 오늘) */
  daysAgo: number;
  /** 그룹 헤더 문구 (오늘 / N일 전) */
  label: string;
  items: AppNotification[];
}

/**
 * 알림을 수신 요일별로 묶는다. 0일 전은 "오늘", 그 외는 "N일 전"으로 표기하며
 * 그룹은 최신순, 그룹 내부도 최신순으로 정렬한다.
 */
export function groupNotificationsByDay(
  notifications: AppNotification[],
): NotificationGroup[] {
  const now = new Date();
  const buckets = new Map<number, AppNotification[]>();

  for (const notification of notifications) {
    // 미래 시각(음수)은 방어적으로 오늘(0)로 취급한다.
    const daysAgo = Math.max(
      0,
      differenceInCalendarDays(now, parseISO(notification.createdAt)),
    );
    const bucket = buckets.get(daysAgo);
    if (bucket) bucket.push(notification);
    else buckets.set(daysAgo, [notification]);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a - b)
    .map(([daysAgo, items]) => ({
      daysAgo,
      label: daysAgo === 0 ? "오늘" : `${daysAgo}일 전`,
      items: items.sort(
        (a, b) =>
          parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime(),
      ),
    }));
}
