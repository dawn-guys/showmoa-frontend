import { cookies } from "next/headers";
import type { RefreshTokenRequest, TokenResponse } from "@/shared/types/auth";
import { ApiError, parseJsonBody, toApiError } from "./api-error";

/**
 * 서버에서만 쓰는 백엔드 호출 계층.
 *
 * 토큰은 httpOnly 쿠키에 있어 브라우저 JS가 읽을 수 없다. 쿠키에서 꺼내
 * Authorization 헤더로 옮겨 담는 일은 서버 코드만 할 수 있으므로,
 * 라우트 핸들러가 이 모듈을 통해 백엔드와 통신한다.
 *
 * 클라이언트에서 import하면 안 된다(next/headers는 서버 전용).
 */

export const ACCESS_TOKEN_COOKIE = "sm_at";
export const REFRESH_TOKEN_COOKIE = "sm_rt";

// 계약에 리프레시 토큰 수명이 없어 env로 분리한다. 기본 14일.
const DEFAULT_REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

function refreshMaxAgeSeconds(): number {
  const raw = process.env.AUTH_REFRESH_MAX_AGE_SECONDS;
  if (!raw) return DEFAULT_REFRESH_MAX_AGE_SECONDS;

  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_REFRESH_MAX_AGE_SECONDS;
}

/**
 * 배포된 개발 백엔드. BACKEND_API_URL을 설정하지 않으면 이 주소를 쓴다.
 * 로컬 백엔드(http://localhost:8080)를 띄워 붙일 때만 env로 덮어쓰면 된다.
 */
export const DEFAULT_BACKEND_API_URL = "https://showmoa-dev.duckdns.org";

export function backendBaseUrl(): string {
  const baseUrl = process.env.BACKEND_API_URL || DEFAULT_BACKEND_API_URL;
  // 끝의 슬래시를 떼어 경로를 붙일 때 //가 생기지 않게 한다.
  return baseUrl.replace(/\/$/, "");
}

/**
 * accessToken은 maxAge를 두지 않는다(세션 쿠키). 만료 판정의 유일한 근거는
 * 백엔드의 401이고, 쿠키는 값을 담는 그릇이다.
 * refreshToken만 maxAge를 둬서 브라우저 재시작 후에도 세션이 이어지게 한다.
 */
export function cookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(maxAge === undefined ? {} : { maxAge }),
  };
}

export async function readTokens() {
  const cookieStore = await cookies();
  return {
    accessToken: cookieStore.get(ACCESS_TOKEN_COOKIE)?.value,
    refreshToken: cookieStore.get(REFRESH_TOKEN_COOKIE)?.value,
  };
}

export async function writeTokens(tokens: TokenResponse) {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, cookieOptions());
  cookieStore.set(
    REFRESH_TOKEN_COOKIE,
    tokens.refreshToken,
    cookieOptions(refreshMaxAgeSeconds()),
  );
}

export async function clearTokens() {
  const cookieStore = await cookies();
  // maxAge 0으로 즉시 만료시킨다. delete()와 달리 옵션(path·secure)을 맞출 수 있다.
  cookieStore.set(ACCESS_TOKEN_COOKIE, "", cookieOptions(0));
  cookieStore.set(REFRESH_TOKEN_COOKIE, "", cookieOptions(0));
}

/** 백엔드로 그대로 전달한다. 응답을 해석하지 않고 Response를 돌려준다. */
export function callBackend(path: string, init?: RequestInit) {
  return fetch(`${backendBaseUrl()}${path}`, { ...init, cache: "no-store" });
}

/** 백엔드를 호출해 JSON을 파싱한다. 2xx가 아니면 ApiError를 던진다. */
export async function requestBackend<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await callBackend(path, init);
  if (!response.ok) throw await toApiError(response);

  return parseJsonBody<T>(response);
}

/**
 * 동시 refresh 합치기.
 *
 * 화면 하나에서 쿼리 여러 개가 동시에 401을 받으면 refresh도 동시에 여러 번
 * 나간다. 백엔드가 리프레시 토큰을 회전시키는 경우 서로를 무효화해 로그아웃되므로,
 * 같은 토큰에 대한 요청은 진행 중인 하나로 합친다.
 */
const inFlightRefresh = new Map<string, Promise<TokenResponse | null>>();

/** 토큰을 갱신한다. 실패하면 null(재로그인 필요). 쿠키 쓰기는 호출한 쪽이 한다. */
export function refreshTokens(
  refreshToken: string,
): Promise<TokenResponse | null> {
  const pending = inFlightRefresh.get(refreshToken);
  if (pending) return pending;

  const body: RefreshTokenRequest = { refreshToken };
  const request = requestBackend<TokenResponse>("/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
    .catch((error: unknown) => {
      // 만료·무효 토큰은 정상 흐름(재로그인)이므로 null로 바꾼다.
      // 그 밖의 실패(네트워크·5xx)는 그대로 올려 프록시가 원 상태를 유지하게 한다.
      if (error instanceof ApiError && error.status === 401) return null;
      throw error;
    })
    .finally(() => {
      inFlightRefresh.delete(refreshToken);
    });

  inFlightRefresh.set(refreshToken, request);
  return request;
}

export function authorizationHeader(
  accessToken: string | undefined,
): Record<string, string> {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

/**
 * 본문을 가질 수 없는 상태 코드. 이 상태로 Response를 만들면서 본문을 넘기면
 * 빈 문자열이라도 생성자가 TypeError를 던진다.
 */
const NULL_BODY_STATUSES = new Set([101, 103, 204, 205, 304]);

/**
 * 백엔드 응답을 브라우저로 그대로 전달한다. 백엔드의 Set-Cookie(JSESSIONID)는
 * 넘기지 않는다.
 */
export async function passthroughResponse(response: Response) {
  const headers = new Headers();
  const contentType = response.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  // 이메일 인증·찜 삭제처럼 204를 주는 엔드포인트는 본문을 null로 넘겨야 한다.
  // text()의 빈 문자열을 그대로 넘기면 TypeError가 나 프록시가 500이 된다.
  const body = NULL_BODY_STATUSES.has(response.status)
    ? null
    : await response.text();

  return new Response(body, { status: response.status, headers });
}
