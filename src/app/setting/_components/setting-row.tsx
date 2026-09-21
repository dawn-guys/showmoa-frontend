"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface SettingRowProps {
  /** 행에 표시할 문구 */
  label: string;
  /** 링크형 행일 때 이동할 경로 */
  href?: string;
  /** 버튼형 행일 때 클릭 동작(모달·드로워 열기 등) */
  onClick?: () => void;
}

// 링크형·버튼형 공통 스타일. 세로 44px로 터치 타깃을 확보한다.
const rowClassName =
  "flex min-h-11 w-full items-center hover:cursor-pointer justify-between gap-4 rounded-sm text-body1 font-[300] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring active:opacity-70";

/**
 * 설정 목록의 한 행. 좌측 문구 + 우측 화살표로 구성된다.
 * href를 주면 페이지 이동 링크, onClick을 주면 오버레이를 여는 버튼이 된다.
 */
export function SettingRow({ label, href, onClick }: SettingRowProps) {
  const content = (
    <>
      <span>{label}</span>
      <ChevronRight
        size={20}
        className="shrink-0 text-muted-foreground"
        aria-hidden
      />
    </>
  );

  if (href) {
    return (
      <Link href={href} className={rowClassName}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={rowClassName}>
      {content}
    </button>
  );
}
