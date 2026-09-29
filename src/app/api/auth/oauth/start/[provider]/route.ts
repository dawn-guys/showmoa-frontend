import { NextResponse } from "next/server";
import { OAUTH_PROVIDERS, type OAuthProvider } from "@/shared/constants/oauth";
import { backendBaseUrl } from "@/shared/lib/backend.server";

/**
 * 소셜 로그인 시작. 백엔드의 OAuth 시작 URL로 넘긴다.
 *
 * 브라우저가 백엔드 주소를 알 필요가 없게(BACKEND_API_URL은 서버 전용이다)
 * 같은 출처의 이 라우트를 거친다. 호출은 fetch가 아니라 전체 페이지 이동이어야
 * 한다. 백엔드가 다시 구글·카카오로 302를 보내고, 그 왕복에 백엔드 세션 쿠키
 * (JSESSIONID)와 PKCE 상태가 필요하기 때문이다.
 */
function isProvider(value: string): value is OAuthProvider {
  return (OAUTH_PROVIDERS as readonly string[]).includes(value);
}

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ provider: string }> },
) {
  const { provider } = await ctx.params;

  // 백엔드에 설정되지 않은 provider는 노출하지 않는다.
  if (!isProvider(provider)) return new Response(null, { status: 404 });

  return NextResponse.redirect(
    `${backendBaseUrl()}/oauth2/authorization/${provider}`,
  );
}
