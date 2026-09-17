import Link from "next/link";
import {
  BellLineDuotoneIcon,
  SettingsLineDuotoneIcon,
} from "@solar-icons/react";

interface HeaderProps {
  /** 로그인 여부. true면 알림(종) 아이콘이 함께 노출된다. */
  isLoggedIn: boolean;
}

/**
 * 서비스 공통 헤더. 로고와 유틸리티 아이콘(알림·설정)을 노출한다.
 * 로그인/비로그인 분기는 컴포넌트 레벨에서 props로 받는다.
 */
export function Header({ isLoggedIn }: HeaderProps) {
  return (
    <header className="flex h-20 items-center justify-between bg-background px-4">
      {/* MOCK: 실제 로고 에셋(SVG)으로 교체 필요 */}
      <Link
        href="/"
        aria-label="쇼모아 홈"
        className="flex flex-col text-base leading-none font-extrabold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="text-foreground">SHOW</span>
        <span className="text-primary">MOA</span>
      </Link>

      <div className="flex items-center">
        {isLoggedIn && (
          <Link
            href="/notification"
            aria-label="알림"
            className="flex size-11 items-center justify-center rounded-full text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring active:bg-muted"
          >
            <BellLineDuotoneIcon size={24} />
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
    </header>
  );
}
