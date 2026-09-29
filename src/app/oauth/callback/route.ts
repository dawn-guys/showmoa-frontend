import { NextResponse } from "next/server";
import { OAUTH_ERROR_PARAM, OAUTH_ERROR_VALUE } from "@/shared/constants/oauth";
import { requestBackend, writeTokens } from "@/shared/lib/backend.server";
import type { OAuthExchangeRequest, TokenResponse } from "@/shared/types/auth";

/**
 * 소셜 로그인 콜백. 백엔드가 구글·카카오 인증을 마치고 이 주소로 되돌려 보낸다.
 *
 * 1회용 code를 토큰으로 교환해 httpOnly 쿠키에 심고 홈으로 보낸다. 라우트
 * 핸들러라 쿠키를 심을 수 있고(페이지 렌더링에서는 못 한다), 교환이 서버에서
 * 끝나 중간 화면이 깜빡이지 않는다. 토큰이 브라우저 JS로 넘어가지 않는 점은
 * /api/auth/login과 같다.
 *
 * 실패는 백엔드가 ?error=social_login_failed 로 알려준다(잘못된 code, 사용자
 * 취소 모두 같은 값). 성공 파라미터 이름은 계약에 없어 교환 바디의 필드명과
 * 같은 code로 읽는다. 다른 이름으로 오면 code가 없는 것과 같아 실패로 떨어진다.
 */
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");

  if (code) {
    const body: OAuthExchangeRequest = { code };

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

  return NextResponse.redirect(
    new URL(`/login?${OAUTH_ERROR_PARAM}=${OAUTH_ERROR_VALUE}`, request.url),
  );
}
