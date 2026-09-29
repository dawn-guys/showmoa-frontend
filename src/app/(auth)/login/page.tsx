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
import { AnimatedToast } from "@/shared/components/toast";
import { useLogin } from "@/shared/hooks/useLogin";
import {
  OAUTH_ERROR_VALUE,
  oauthStartPath,
  type OAuthProvider,
} from "@/shared/constants/oauth";
import { GoogleLoginButton } from "./_components/google-login-button";
import { KakaoLoginButton } from "./_components/kakao-login-button";
import { cn } from "cn";

// 로그인 입력값. 계약(LoginRequest)은 두 값 모두 1자 이상만 요구하지만,
// 이메일 형식 검증은 화면 스펙(docs/spec/auth.md · 로그인)이 요구한다.
const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});
type LoginValues = z.infer<typeof loginSchema>;

// 상단 에러 토스트 문구(docs/spec/auth.md).
const EMAIL_ERROR_MESSAGE = "이메일 형식을 확인해 주세요";
const LOGIN_ERROR_MESSAGE =
  "이메일 주소 또는 비밀번호를 확인한 후 다시 시도해 주세요";
const TOAST_ID = "login-error-toast";

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  const router = useRouter();
  const { login } = useLogin();

  // 소셜 로그인 실패로 되돌아온 경우(/oauth/callback → /login?error=...).
  // 스펙에 소셜 실패 문구가 없어 로그인 실패 토스트를 그대로 쓴다(오너 결정).
  const socialLoginFailed = React.use(searchParams).error === OAUTH_ERROR_VALUE;

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
  const [toast, setToast] = React.useState<string | null>(
    socialLoginFailed ? LOGIN_ERROR_MESSAGE : null,
  );

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

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values);
    } catch {
      // 실패하면 이메일 인풋에 포커스가 들어가고 테두리는 error 색(destructive)이 되며
      // 상단에 에러 토스트를 띄운다(docs/spec/auth.md · 로그인 5).
      setEmailInvalid(true);
      setToast(LOGIN_ERROR_MESSAGE);
      setFocus("email");
      return;
    }
    // 뒤로가기로 로그인 화면에 돌아오지 않도록 replace로 이동한다.
    router.replace("/");
  });

  // 소셜 로그인 시작. 백엔드 → 구글·카카오로 이어지는 302 체인을 타야 하므로
  // 라우터 이동이 아니라 전체 페이지 이동이다. 성공하면 백엔드가
  // /oauth/callback으로 되돌려 보내고, 거기서 토큰 교환까지 끝난다.
  const startSocialLogin = (provider: OAuthProvider) => {
    window.location.href = oauthStartPath(provider);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      {/* 상단 에러 토스트: 위에서 스르륵 내려왔다가 일정 시간 뒤 다시 올라가 사라진다. */}
      <AnimatedToast
        open={!!toast}
        message={toast ?? ""}
        variant="error"
        id={TOAST_ID}
      />

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

        {/* 소셜 로그인 버튼(컴포넌트 분리). 시작 라우트로 이동만 하고,
            이후 흐름(코드 교환·토큰 저장)은 /oauth/callback이 서버에서 처리한다. */}
        <GoogleLoginButton
          className="mt-2.5"
          onClick={() => startSocialLogin("google")}
        />
        <KakaoLoginButton
          className="mt-2.5"
          onClick={() => startSocialLogin("kakao")}
        />

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
