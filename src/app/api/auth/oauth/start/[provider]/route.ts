import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  OAUTH_CODE_VERIFIER_COOKIE,
  OAUTH_PROVIDERS,
  type OAuthProvider,
} from "@/shared/constants/oauth";
import { backendBaseUrl, cookieOptions } from "@/shared/lib/backend.server";

/**
 * 소셜 로그인 시작. 백엔드의 OAuth 시작 URL로 넘긴다.
 *
 * 브라우저가 백엔드 주소를 알 필요가 없게(BACKEND_API_URL은 서버 전용이다)
 * 같은 출처의 이 라우트를 거친다. 호출은 fetch가 아니라 전체 페이지 이동이어야
 * 한다. 백엔드가 다시 구글·카카오로 302를 보내고, 그 왕복에 백엔드 세션 쿠키
 * (JSESSIONID)가 필요하기 때문이다.
 *
 * PKCE(RFC 7636 S256): verifier 원본은 이 도메인의 httpOnly 쿠키에만 두고
 * 백엔드에는 해시(code_challenge)만 넘긴다. 백엔드가 이 해시를 1회용 code에 묶고,
 * 콜백 라우트가 원본 verifier로 code를 교환한다.
 */
function isProvider(value: string): value is OAuthProvider {
  return (OAUTH_PROVIDERS as readonly string[]).includes(value);
}

// 구글·카카오 로그인 화면에 머무는 시간까지 버티도록 넉넉히 10분.
const VERIFIER_MAX_AGE_SECONDS = 60 * 10;

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ provider: string }> },
) {
  const { provider } = await ctx.params;

  // 백엔드에 설정되지 않은 provider는 노출하지 않는다.
  if (!isProvider(provider)) return new Response(null, { status: 404 });

  // 32바이트 난수를 base64url로 바꾸면 43자(백엔드 허용 범위 43~128자).
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");

  const cookieStore = await cookies();
  cookieStore.set(
    OAUTH_CODE_VERIFIER_COOKIE,
    verifier,
    cookieOptions(VERIFIER_MAX_AGE_SECONDS),
  );

  const url = new URL(`${backendBaseUrl()}/oauth2/authorization/${provider}`);
  url.searchParams.set("code_challenge", challenge);

  return NextResponse.redirect(url);
}
