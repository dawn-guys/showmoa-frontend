import { parseJsonBody, toApiError } from "./api-error";

/**
 * 클라이언트 fetch 래퍼.
 *
 * 브라우저는 백엔드를 직접 부르지 않고 항상 같은 출처의 프록시
 * (/api/backend/*)를 호출한다. 토큰은 httpOnly 쿠키에 있어 이 코드가 읽을 수
 * 없고, 쿠키는 같은 출처 요청에 자동으로 실려 간다.
 *
 * 실패는 ApiError로 정규화된다. ApiError.message는 백엔드 원문이므로 화면에
 * 그대로 노출하지 말고, 사용자 문구는 docs/spec에서 가져온다.
 */

const PROXY_PREFIX = "/api/backend";

type QueryValue = string | number | boolean;

/** 쿼리 파라미터. 배열은 반복 키로 직렬화된다(genres=연극&genres=뮤지컬). */
export type QueryParams = Record<
  string,
  QueryValue | QueryValue[] | undefined | null
>;

interface ApiRequestInit {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  searchParams?: QueryParams;
  /** JSON으로 직렬화해 보낼 요청 바디 */
  body?: unknown;
  signal?: AbortSignal;
}

function toQueryString(searchParams?: QueryParams) {
  if (!searchParams) return "";

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined || value === null) continue;

    // Spring은 page·size·sort·genres 등을 반복 키로 받는다(pageable 객체가 아니다).
    for (const item of Array.isArray(value) ? value : [value]) {
      params.append(key, String(item));
    }
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

async function request<T>(url: string, init: ApiRequestInit = {}): Promise<T> {
  const { method = "GET", body, signal } = init;

  const response = await fetch(`${url}${toQueryString(init.searchParams)}`, {
    method,
    headers:
      body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  if (!response.ok) throw await toApiError(response);

  return parseJsonBody<T>(response);
}

/**
 * 백엔드 데이터 요청. path는 백엔드 경로를 그대로 넘긴다(예: "/api/users/me").
 * 프록시가 Authorization 헤더 부착과 401 갱신을 처리한다.
 */
export function apiFetch<T>(path: string, init?: ApiRequestInit): Promise<T> {
  return request<T>(`${PROXY_PREFIX}${path}`, init);
}

/**
 * 세션 요청. 토큰이 오가는 경로는 프록시를 타지 않고 쿠키를 심는 전용
 * 라우트 핸들러(/api/auth/login, /api/auth/logout)를 직접 호출한다.
 */
export function sessionFetch(route: string, init?: ApiRequestInit) {
  return request<void>(route, { method: "POST", ...init });
}
