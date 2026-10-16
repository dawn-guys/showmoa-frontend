import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  OAUTH_CODE_VERIFIER_COOKIE,
  OAUTH_DUPLICATE_EMAIL_VALUE,
  OAUTH_ERROR_CODE_PARAM,
  OAUTH_ERROR_PARAM,
  OAUTH_ERROR_VALUE,
} from "@/shared/constants/oauth";
import {
  cookieOptions,
  requestBackend,
  writeTokens,
} from "@/shared/lib/backend.server";
import type {
  OAuth2ErrorDetail,
  OAuthExchangeRequest,
  TokenResponse,
} from "@/shared/types/auth";

/**
 * 소셜 로그인 콜백. 백엔드가 구글·카카오 인증을 마치고 이 주소로 되돌려 보낸다.
 * provider 구분 없이 같은 처리를 탄다.
 *
 * 1회용 code를 토큰으로 교환해 httpOnly 쿠키에 심고 홈으로 보낸다. 라우트
 * 핸들러라 쿠키를 심을 수 있고(페이지 렌더링에서는 못 한다), 교환이 서버에서
 * 끝나 중간 화면이 깜빡이지 않는다. 토큰이 브라우저 JS로 넘어가지 않는 점은
 * /api/auth/login과 같다.
 *
 * 실패는 백엔드가 ?error_code={1회용 코드} 로 알려준다. 사유를 서버에서 조회해
 * /login?error={사유} 로 넘긴다. 사유 조회가 실패하거나 코드가 없으면 일반 실패다.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const code = params.get("code");

  // 로그인 시작 라우트가 심은 PKCE verifier. 1회용이라 성공·실패와 관계없이 지운다.
  // maxAge 0으로 만료시켜 심을 때와 같은 옵션(path·secure)을 맞춘다.
  const cookieStore = await cookies();
  const verifier = cookieStore.get(OAUTH_CODE_VERIFIER_COOKIE)?.value;
  if (verifier) {
    cookieStore.set(OAUTH_CODE_VERIFIER_COOKIE, "", cookieOptions(0));
  }

  // verifier가 없으면(쿠키 만료 등) 백엔드도 교환을 거절하므로 바로 실패로 넘긴다.
  if (code && verifier) {
    const body: OAuthExchangeRequest = { code, verifier };

    try {
      const tokens = await requestBackend<TokenResponse>(
        "/api/auth/oauth/exchange",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );

      await writeTokens(tokens);

      return NextResponse.redirect(new URL("/", request.url));
    } catch {
      // 교환 실패(만료된 code 등)도 아래 로그인 화면 복귀로 처리한다.
    }
  }

  const errorCode = params.get(OAUTH_ERROR_CODE_PARAM);
  const reason = errorCode
    ? await readFailureReason(errorCode)
    : OAUTH_ERROR_VALUE;

  return NextResponse.redirect(
    new URL(`/login?${OAUTH_ERROR_PARAM}=${reason}`, request.url),
  );
}

/**
 * 1회용 코드로 실패 사유를 조회한다(백엔드가 조회 즉시 지운다).
 * 이메일·비밀번호(LOCAL)로 가입된 이메일일 때만 duplicate_email로 구분한다.
 * 다른 소셜로 가입된 이메일은 "비밀번호로 로그인" 안내가 맞지 않아 일반 실패로 둔다.
 */
async function readFailureReason(errorCode: string) {
  try {
    const { errorType, detail } = await requestBackend<OAuth2ErrorDetail>(
      `/api/auth/oauth/error?code=${encodeURIComponent(errorCode)}`,
    );
    if (errorType === OAUTH_DUPLICATE_EMAIL_VALUE && detail === "LOCAL") {
      return OAUTH_DUPLICATE_EMAIL_VALUE;
    }
  } catch {
    // 만료·이미 소비된 코드(404) 등은 일반 실패로 처리한다.
  }
  return OAUTH_ERROR_VALUE;
}
