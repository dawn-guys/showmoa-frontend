import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 로그인 여부에 따른 화면 접근 가드.
 *
 * - 로그인이 필요한 화면: 리프레시 토큰 쿠키가 없으면 세션이 없는 것으로 보고
 *   /login으로 보낸다.
 * - /login: 이미 로그인한 상태면 로그인 화면을 보여줄 이유가 없어 홈으로 보낸다.
 *
 * accessToken이 아니라 refreshToken으로 판정하는 이유: accessToken은 수명이 짧아
 * 만료된 상태에서도 갱신으로 세션이 이어지는데, 그것까지 로그아웃 처리하면 안 된다.
 *
 * 이것은 UX 게이트이고 보안 경계가 아니다. 실제 차단은 백엔드의 401이다.
 */

// backend.server.ts와 값이 같아야 한다. 프록시는 공용 모듈에 의존하지 않는 것이
// 권장되므로(Next.js 문서) 상수를 여기에 둔다.
const REFRESH_TOKEN_COOKIE = "sm_rt";

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(REFRESH_TOKEN_COOKIE);

  if (request.nextUrl.pathname === "/login") {
    return hasSession
      ? NextResponse.redirect(new URL("/", request.url))
      : NextResponse.next();
  }

  if (hasSession) return NextResponse.next();

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/login", "/notification", "/password/update", "/setting/withdraw"],
};
