"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BellRingLineDuotoneIcon,
  SettingsLineDuotoneIcon,
} from "@solar-icons/react";
import { useAuth } from "@/shared/hooks/useAuth";
import { useUnreadNotifications } from "@/shared/hooks/useUnreadNotifications";
import { Skeleton } from "@/shared/components/ui/skeleton";

/**
 * 서비스 공통 헤더. 로고와 유틸리티 아이콘(알림·설정)을 노출한다.
 * 로그인 여부는 useAuth로 판별하며, 세션 확인 중에는 우측 액션 영역을
 * 스켈레톤으로 대체한다(서버에서 로그인 여부를 알 수 없어 깜빡임을 막는다).
 */
export function Header() {
  const { isLoggedIn, isLoading } = useAuth();
  const { unreadCount } = useUnreadNotifications({ enabled: isLoggedIn });
  const hasUnread = isLoggedIn && unreadCount > 0;

  return (
    <header className="flex h-20 items-center justify-between bg-background px-4">
      <Link
        href="/"
        aria-label="쇼모아 홈"
        className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {/* SVG는 이미지 최적화 대상이 아니므로 unoptimized로 그대로 서빙한다 */}
        <Image
          src="/logo.svg"
          alt="쇼모아"
          width={99}
          height={36}
          priority
          unoptimized
        />
      </Link>

      {isLoading ? (
        <Skeleton className="size-11 rounded-2xl" aria-hidden />
      ) : (
        <div className="flex items-center">
          {isLoggedIn && (
            <Link
              href="/notification"
              aria-label={hasUnread ? "알림, 읽지 않은 알림 있음" : "알림"}
              className="relative flex size-11 items-center justify-center rounded-full text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring active:bg-muted"
            >
              <BellRingLineDuotoneIcon size={24} />
              {/* 읽지 않은 알림이 있을 때만 주조색 점을 노출한다 */}
              {hasUnread && (
                <span
                  className="absolute top-2.5 right-2.5 size-1.5 rounded-full bg-primary"
                  aria-hidden
                />
              )}
            </Link>
          )}
          <Link
            href="/setting"
            aria-label="설정"
            className="flex size-11 items-center justify-center rounded-full text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring active:bg-muted"
          >
            <SettingsLineDuotoneIcon size={24} />
          </Link>
        </div>
      )}
    </header>
  );
}
