"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { CtaButton } from "@/shared/components/cta-button";

// 메인·서브 문구는 docs/spec/common-ui.md(에러 페이지) 표기를,
// CTA 문구는 spec에 없어 Figma(node 1:1366) 값을 따른다.
const ERROR_MAIN = "이 공연은 막을 내렸어요";
const ERROR_SUB_1 = "찾으시는 페이지를 무대에서 찾을 수 없네요";
const ERROR_SUB_2 = "대신 지금 열리고 있는 공연을 보러 가실래요?";
const HOME_CTA = "홈으로";

// 회원가입·비밀번호 재설정 플로우 경로. 타이머 만료로 이 페이지가 뜬 경우
// 뒤로가기는 이전 단계가 아니라 해당 플로우의 첫 단계로 되돌린다.
const AUTH_FLOW_PREFIXES = ["/signup", "/password"];

/**
 * 404/에러 페이지. 매칭되지 않는 URL(이상한 도메인) 접근과, 인증 타이머 만료 시
 * notFound()로 진입한다(docs/spec/common-ui.md · 에러 페이지). 하단 CTA로 홈("/")
 * 으로 이동하고, 상단 화살표로 이전 페이지로 돌아간다.
 */
export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    // auth/회원가입 플로우(타이머 만료 등)면 ?step 쿼리를 떨궈 첫 단계로 초기화한다.
    if (AUTH_FLOW_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
      router.replace(pathname);
      return;
    }
    // 그 외(이상한 도메인 등)는 이전 페이지로 이동한다.
    router.back();
  };

  return (
    <div className="flex min-h-dvh flex-col pb-safe">
      <header className="flex h-17 items-center px-4">
        <button
          type="button"
          onClick={handleBack}
          aria-label="뒤로 가기"
          className="-ml-2.5 flex size-11 items-center justify-center rounded-full text-foreground outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring active:bg-muted"
        >
          <ChevronLeft size={30} />
        </button>
      </header>

      <main className="flex flex-1 flex-col px-4 pb-5">
        {/* 이미지·문구를 화면 중앙보다 살짝 위(약 45%)에 둔다(Figma). */}
        {/* 위:아래 여백을 4:5로 나눠 콘텐츠를 위로 끌어올린다. */}
        <div aria-hidden className="grow-[4]" />
        <div className="flex flex-col items-center gap-5">
          {/* 404 오페라글라스 이미지. SVG는 최적화 대상이 아니라 unoptimized로 서빙한다. */}
          <Image
            src="/glass.svg"
            alt=""
            width={171}
            height={173}
            priority
            unoptimized
          />
          <div className="flex flex-col items-center gap-2.5 text-center">
            <h1 className="text-h1 text-foreground">{ERROR_MAIN}</h1>
            <p className="text-sm font-semibold break-keep text-hint">
              {ERROR_SUB_1}
              <br />
              {ERROR_SUB_2}
            </p>
          </div>
        </div>
        <div aria-hidden className="grow-[5]" />
        <CtaButton
          type="button"
          onClick={() => router.push("/")}
          className="text-foreground"
        >
          {HOME_CTA}
        </CtaButton>
      </main>
    </div>
  );
}
