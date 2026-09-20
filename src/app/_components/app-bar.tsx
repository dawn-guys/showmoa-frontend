"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface AppBarProps {
  /** 화면에 표시할 제목 */
  title: string;
  /**
   * 뒤로가기 동작. 생략하면 브라우저 히스토리 back.
   * 드로워 닫기 등 커스텀 동작이 필요할 때 전달한다.
   */
  onBack?: () => void;
}

/** 뒤로가기 버튼과 제목으로 구성된 상단 바. */
export function AppBar({ title, onBack }: AppBarProps) {
  const router = useRouter();

  return (
    <header className="flex h-17 items-center gap-6 px-4">
      <button
        type="button"
        onClick={onBack ?? (() => router.back())}
        aria-label="뒤로 가기"
        className="-ml-2.5 flex size-11 items-center justify-center rounded-full text-foreground outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring active:bg-muted"
      >
        <ChevronLeft size={24} />
      </button>
      <h1 className="text-h1 text-foreground">{title}</h1>
    </header>
  );
}
