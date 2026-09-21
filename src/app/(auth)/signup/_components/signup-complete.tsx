"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { CtaButton } from "@/shared/components/cta-button";
import { cn } from "cn";

// UI 문구(docs/spec/auth.md · 회원가입 10). 서브 문구는 spec 표기를 따른다.
const COMPLETE_MAIN = "가입이 완료 됐어요";
const COMPLETE_SUB_1 = "이제 보고 싶은 공연을 저장하고";
const COMPLETE_SUB_2 = "공연 정보를 한 눈에 확인해보세요";
// CTA 문구는 spec에 없어 Figma(node 488:5830) 값을 따른다.
const LOGIN_CTA = "바로 로그인 하기";

/**
 * 회원가입 완료 화면. success 이미지가 아래에서 위로 올라오며(opacity 0→100)
 * 나타난 뒤 텍스트가 이어서 보인다(docs/spec/auth.md · 회원가입 10).
 * "바로 로그인 하기"를 누르면 가입 정보로 로그인 후 홈으로 이동한다.
 * (모션은 전역 MotionConfig의 reducedMotion="user"를 따른다.)
 */
export function SignupComplete() {
  const router = useRouter();
  const [loggingIn, setLoggingIn] = React.useState(false);

  const handleLogin = async () => {
    setLoggingIn(true);
    // MOCK: 실제 로그인 요청은 Phase 2. 가입 정보로 로그인 후 홈으로 이동한다.
    await new Promise((resolve) => setTimeout(resolve, 600));
    router.push("/");
  };

  return (
    <div className="flex flex-1 flex-col px-4 pt-4 pb-5">
      <div className="flex flex-1 flex-col items-center justify-center gap-5">
        {/* success 이미지: 아래에서 위로 올라오며 나타난다. */}
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* SVG는 최적화 대상이 아니므로 unoptimized로 그대로 서빙한다. */}
          <Image
            src="/success.svg"
            alt=""
            width={158}
            height={158}
            priority
            unoptimized
          />
        </motion.div>
        {/* 텍스트: 이미지가 올라온 뒤 이어서 보인다. */}
        <motion.div
          className="flex flex-col items-center gap-2.5 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4, ease: "easeOut" }}
        >
          <h2 className="text-h1 text-foreground">{COMPLETE_MAIN}</h2>
          <p className="text-sm font-semibold break-keep text-muted-foreground">
            {COMPLETE_SUB_1}
            <br />
            {COMPLETE_SUB_2}
          </p>
        </motion.div>
      </div>
      <CtaButton
        type="button"
        onClick={handleLogin}
        isLoading={loggingIn}
        className={cn("text-foreground", loggingIn && "cursor-not-allowed")}
      >
        {LOGIN_CTA}
      </CtaButton>
    </div>
  );
}
