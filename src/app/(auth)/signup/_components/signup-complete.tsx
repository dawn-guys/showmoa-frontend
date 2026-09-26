"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { CtaButton } from "@/shared/components/cta-button";
import { AnimatedToast } from "@/shared/components/toast";
import { useLogin } from "@/shared/hooks/useLogin";
import { cn } from "cn";

// UI 문구(docs/spec/auth.md · 회원가입 10). 서브 문구는 spec 표기를 따른다.
const COMPLETE_MAIN = "가입이 완료 됐어요";
const COMPLETE_SUB_1 = "이제 보고 싶은 공연을 저장하고";
const COMPLETE_SUB_2 = "공연 정보를 한 눈에 확인해보세요";
// CTA 문구는 spec에 없어 Figma(node 488:5830) 값을 따른다.
const LOGIN_CTA = "바로 로그인 하기";

// 자동 로그인 실패 토스트 문구. docs/spec/auth.md에 이 경우의 문구가 없어 기존
// 스펙 문구의 말투에 맞춰 정했다(확정되면 docs/spec으로 옮긴다). 계정은 이미
// 만들어진 뒤라 가입이 실패한 것으로 읽히지 않게 쓴다.
const AUTO_LOGIN_ERROR = "가입은 완료 됐어요. 로그인만 다시 시도해 주세요";

const TOAST_ID = "signup-complete-error-toast";

interface SignupCompleteProps {
  /** 방금 가입한 계정. 자동 로그인 요청에 그대로 쓴다. */
  email: string;
  /**
   * 방금 설정한 비밀번호. 퍼널의 폼 상태로만 전달되고 URL·스토리지에는 남지 않는다.
   */
  password: string;
}

/**
 * 회원가입 완료 화면. success 이미지가 아래에서 위로 올라오며(opacity 0→100)
 * 나타난 뒤 텍스트가 이어서 보인다(docs/spec/auth.md · 회원가입 10).
 * "바로 로그인 하기"를 누르면 가입 정보로 로그인 후 홈으로 이동한다.
 * (모션은 전역 MotionConfig의 reducedMotion="user"를 따른다.)
 */
export function SignupComplete({ email, password }: SignupCompleteProps) {
  const router = useRouter();
  const { login, isLoggingIn } = useLogin();
  const [toast, setToast] = React.useState<string | null>(null);

  // 토스트는 잠시 후 자동으로 사라진다.
  React.useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleLogin = async () => {
    try {
      await login({ email, password });
    } catch {
      // 버튼이 다시 활성화되므로 사용자는 같은 자리에서 재시도할 수 있다.
      setToast(AUTO_LOGIN_ERROR);
      return;
    }
    // 뒤로가기로 가입 퍼널에 돌아오지 않도록 replace로 이동한다.
    router.replace("/");
  };

  return (
    <div className="flex flex-1 flex-col px-4 pt-4 pb-5">
      {/* 상단 에러 토스트: 위에서 내려왔다가 일정 시간 뒤 사라진다. */}
      <AnimatedToast
        open={!!toast}
        message={toast ?? ""}
        variant="error"
        id={TOAST_ID}
      />
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
        isLoading={isLoggingIn}
        className={cn("text-foreground", isLoggingIn && "cursor-not-allowed")}
      >
        {LOGIN_CTA}
      </CtaButton>
    </div>
  );
}
