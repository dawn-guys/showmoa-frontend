import {
  authorizationHeader,
  callBackend,
  clearTokens,
  passthroughResponse,
  readTokens,
  refreshTokens,
  writeTokens,
} from "@/shared/lib/backend.server";

/**
 * 인증 데이터 프록시.
 *
 * /api/backend/<백엔드 경로> 로 들어온 요청을 백엔드로 전달한다. 하는 일은 세 가지.
 * 1. httpOnly 쿠키의 accessToken을 Authorization 헤더로 옮겨 담는다.
 * 2. 401이면 refreshToken으로 한 번 갱신하고 원 요청을 1회 재시도한다.
 * 3. 갱신도 실패하면 쿠키를 지우고 401을 돌려준다.
 *
 * 캐치올이라 엔드포인트가 늘어도 라우트 파일을 추가하지 않는다. 토큰 갱신 로직도
 * 이 한 곳에만 존재한다.
 */

/**
 * 세션 쿠키를 다루는 경로는 프록시하지 않고 전용 핸들러(/api/auth/*)로만 다룬다.
 *
 * - login·refresh·oauth/exchange: 응답 본문에 토큰이 담긴다. 통과시키면 브라우저가
 *   이 프록시를 호출해 토큰을 JSON으로 읽을 수 있어 httpOnly가 무의미해진다.
 * - logout: 통과시키면 백엔드 세션만 끊기고 쿠키는 남아, 로그인처럼 보이지만 모든
 *   요청이 실패하는 상태가 된다.
 */
const BLOCKED_PATHS = [
  "api/auth/login",
  "api/auth/refresh",
  "api/auth/oauth/exchange",
  "api/auth/logout",
];

// 백엔드로 넘기는 요청 헤더. 쿠키(JSESSIONID)·host 등은 넘기지 않는다.
const FORWARDED_REQUEST_HEADERS = ["content-type", "accept"];

function buildRequestHeaders(request: Request, accessToken?: string) {
  const headers = new Headers(authorizationHeader(accessToken));

  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  return headers;
}

async function handle(
  request: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  const joined = path.join("/");

  // 백엔드의 /api/* 만 노출한다(swagger-ui 등 다른 경로는 프록시 대상이 아니다).
  if (path[0] !== "api" || BLOCKED_PATHS.includes(joined)) {
    return new Response(null, { status: 404 });
  }

  const { search } = new URL(request.url);
  const backendPath = `/${joined}${search}`;

  // 재시도 때 다시 써야 하므로 본문을 먼저 읽어 둔다(Request 본문은 1회성).
  const body = request.method === "GET" ? undefined : await request.text();
  const { accessToken, refreshToken } = await readTokens();

  const response = await callBackend(backendPath, {
    method: request.method,
    headers: buildRequestHeaders(request, accessToken),
    body: body || undefined,
  });

  // 백엔드가 401을 준 경우에만 갱신을 시도한다. 그 밖의 실패(로그인 실패의 500 등)로는
  // 갱신하지 않는다.
  if (response.status !== 401 || !refreshToken) {
    return passthroughResponse(response);
  }

  const tokens = await refreshTokens(refreshToken);
  if (!tokens) {
    await clearTokens();
    return passthroughResponse(response);
  }

  await writeTokens(tokens);

  const retried = await callBackend(backendPath, {
    method: request.method,
    headers: buildRequestHeaders(request, tokens.accessToken),
    body: body || undefined,
  });

  return passthroughResponse(retried);
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
