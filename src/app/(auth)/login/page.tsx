"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TextField } from "@/shared/components/text-field";
import { PasswordField } from "@/shared/components/password-field";
import { CtaButton } from "@/shared/components/cta-button";
import { Toast } from "@/shared/components/toast";
import { GoogleLoginButton } from "./_components/google-login-button";
import { KakaoLoginButton } from "./_components/kakao-login-button";
import { cn } from "cn";

// Provisional: 로그인 입력값. API 계약 확정 전 화면 스펙 기준.
const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});
type LoginValues = z.infer<typeof loginSchema>;

// 이메일 형식 검증 실패 시 상단에 띄우는 토스트(문구는 docs/spec/auth.md).
const EMAIL_ERROR_MESSAGE = "이메일 형식을 확인해 주세요";
const TOAST_ID = "login-error-toast";

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    trigger,
    setFocus,
    formState: { isValid, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  // 이메일 검증 실패 상태(테두리 error 색)와 상단 에러 토스트.
  const [emailInvalid, setEmailInvalid] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);

  // 토스트는 잠시 후 자동으로 사라진다.
  React.useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const emailReg = register("email");

  // 블러 시 이메일 형식을 검증한다. 값이 있는데 형식이 틀리면
  // 포커스를 다시 이메일 인풋으로 돌리고 상단에 에러 토스트를 띄운다.
  const handleEmailBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    emailReg.onBlur(e);
    if (!e.target.value) {
      setEmailInvalid(false);
      return;
    }
    const ok = await trigger("email");
    if (ok) {
      setEmailInvalid(false);
      return;
    }
    setEmailInvalid(true);
    setToast(EMAIL_ERROR_MESSAGE);
    setFocus("email");
  };

  const onSubmit = handleSubmit(async () => {
    // MOCK: 실제 로그인 요청·세션 처리는 Phase 2. 지금은 성공 시 홈으로 이동만 한다.
    router.push("/");
  });

  return (
    <div className="flex min-h-dvh flex-col">
      {toast && (
        // 상단 에러 토스트. 고정 요소는 앱 컬럼 폭으로 제한한다.
        <div
          id={TOAST_ID}
          className="fixed inset-x-0 top-4 z-50 mx-auto max-w-app px-4"
        >
          <Toast variant="error" message={toast} />
        </div>
      )}

      <header className="flex h-17 items-center px-4">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로 가기"
          className="-ml-2.5 flex size-11 items-center justify-center rounded-full text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring active:bg-muted"
        >
          <ChevronLeft size={24} />
        </button>
      </header>

      <main className="flex flex-1 flex-col px-4">
        <h1 className="sr-only">로그인</h1>

        {/* 로고를 누르면 홈으로 이동한다(헤더와 동일 패턴). */}
        <Link
          href="/"
          aria-label="쇼모아 홈"
          className="mt-18 block w-fit self-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {/* SVG 로고는 최적화 대상이 아니므로 unoptimized로 그대로 서빙한다. */}
          <Image
            src="/logo.svg"
            alt="쇼모아"
            width={244}
            height={89}
            priority
            unoptimized
          />
        </Link>

        <form
          onSubmit={onSubmit}
          className="mt-18 flex flex-col"
          autoComplete="off"
          noValidate
        >
          <TextField
            label="이메일"
            type="email"
            inputMode="email"
            // 이전에 입력한 이메일이 자동완성으로 뜨는 브라우저 기본 동작을 막는다.
            autoComplete="off"
            enterKeyHint="next"
            placeholder="이메일을 작성해 주세요"
            {...emailReg}
            onChange={(e) => {
              emailReg.onChange(e);
              if (emailInvalid) setEmailInvalid(false);
            }}
            onBlur={handleEmailBlur}
            aria-invalid={emailInvalid || undefined}
            aria-describedby={emailInvalid && toast ? TOAST_ID : undefined}
          />
          <div className="mt-2.5">
            <PasswordField
              label="비밀번호"
              autoComplete="current-password"
              enterKeyHint="done"
              placeholder="비밀번호를 작성해 주세요"
              {...register("password")}
            />
          </div>
          {/* 로그인 버튼: 두 필드가 유효할 때만 활성화. 텍스트는 #f6f6f6(foreground). */}
          <CtaButton
            type="submit"
            className={cn(
              "mt-5 h-[46px] text-foreground",
              isValid ? "hover:cursor-pointer" : "cursor-not-allowed",
            )}
            disabled={!isValid}
            isLoading={isSubmitting}
          >
            로그인
          </CtaButton>
        </form>

        {/* 소셜 로그인 버튼(컴포넌트 분리). 실제 OAuth 연동은 Phase 2라
            지금은 onClick을 붙이지 않는다. */}
        <GoogleLoginButton className="mt-2.5" />
        <KakaoLoginButton className="mt-2.5" />

        {/* 링크: 12px, 위아래 30px 여백. */}
        <nav
          className="mt-7.5 flex items-center justify-center"
          aria-label="계정"
        >
          <Link
            href="/password/find"
            className="flex items-center px-3 py-1 text-body3 font-medium text-primary/60 outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
          >
            비밀번호 찾기
          </Link>
          <Link
            href="/signup"
            className="flex items-center px-3 py-1 text-body3 font-medium text-primary/60 outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
          >
            회원가입 하기
          </Link>
        </nav>

        <p className="mt-7.5 text-center text-body3 font-medium break-keep text-hint">
          로그인 시 쇼모아의 개인정보 처리방침과
          <br />
          위치정보 서비스 이용약관에 동의한 것으로 간주 합니다
        </p>
      </main>
    </div>
  );
}
