"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarLineDuotoneIcon,
  HeartAngleLineDuotoneIcon,
  HomeLineDuotoneIcon,
  MagnifierLineDuotoneIcon,
  MapPointLineDuotoneIcon,
} from "@solar-icons/react";
import { cn } from "cn";

// 하단 나브 항목. 홈은 로그인 여부와 무관하게 "/"로 이동한다.
const NAV_ITEMS = [
  { href: "/", label: "홈", Icon: HomeLineDuotoneIcon },
  { href: "/map", label: "지도", Icon: MapPointLineDuotoneIcon },
  { href: "/calendar", label: "달력", Icon: CalendarLineDuotoneIcon },
  { href: "/wishlist", label: "찜", Icon: HeartAngleLineDuotoneIcon },
  { href: "/search", label: "검색", Icon: MagnifierLineDuotoneIcon },
] as const;

/**
 * 화면 하단에 고정되는 주요 메뉴. 현재 경로에 맞춰 아이콘 색상과
 * aria-current를 변경한다.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="주요 메뉴"
      className="fixed inset-x-0 bottom-0 mx-auto flex h-bottom-nav max-w-app items-center justify-around bg-card pb-safe"
    >
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const isActive =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex size-11 items-center justify-center rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon size={24} />
          </Link>
        );
      })}
    </nav>
  );
}
