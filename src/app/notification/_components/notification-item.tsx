import Link from "next/link";
import { cn } from "cn";
import type { AppNotification } from "../_types";

interface NotificationItemProps {
  notification: AppNotification;
}

/**
 * 알림 한 줄. 행을 누르면 해당 공연 상세(/detail/:id)로 이동한다.
 * 읽음 여부는 색상으로만 구분하며 읽어도 비활성화되지 않는다.
 * 색상만으로 상태를 전달하지 않도록 안 읽은 알림에는 sr-only 문구를 덧붙인다.
 */
export function NotificationItem({ notification }: NotificationItemProps) {
  const { performanceId, highlight, body, read } = notification;

  return (
    <li>
      <Link
        href={`/detail/${performanceId}`}
        className="flex min-h-11 items-start gap-[13px] rounded-lg py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span
          aria-hidden
          className={cn(
            "mt-[7px] size-2 shrink-0 rounded-full",
            read ? "bg-muted-foreground" : "bg-primary",
          )}
        />
        <span
          className={cn(
            "text-sm leading-normal font-medium break-keep",
            read && "text-muted-foreground",
          )}
        >
          {!read && <span className="sr-only">읽지 않은 알림 </span>}
          <span className={cn(!read && "text-primary")}>{highlight}</span>{" "}
          <span className={cn(!read && "text-foreground")}>{body}</span>
        </span>
      </Link>
    </li>
  );
}
