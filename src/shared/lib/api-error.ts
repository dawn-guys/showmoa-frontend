/**
 * API 실패를 하나의 타입으로 정규화한다.
 *
 * message는 백엔드가 보낸 원문(한국어)이다. 로깅·분기용이며 화면에
 * 그대로 노출하지 않는다. 사용자에게 보여줄 문구는 docs/spec에서 가져온다.
 */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** ApiError 여부를 좁힌다. instanceof는 번들 경계를 넘으면 불안정하므로 name으로 본다. */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && error.name === "ApiError";
}

/**
 * 실패 응답에서 메시지를 뽑는다.
 *
 * 백엔드 포맷이 두 가지로 섞여 있어 둘 다 처리한다.
 * - Spring Security 진입점(401/403): application/json → { "message": "..." }
 * - ControllerAdvice(400/500): text/plain → 본문이 곧 메시지
 */
export async function toApiError(response: Response): Promise<ApiError> {
  const fallback = response.statusText || `HTTP ${response.status}`;

  let body: string;
  try {
    body = await response.text();
  } catch {
    return new ApiError(response.status, fallback);
  }

  if (!body) return new ApiError(response.status, fallback);

  if (response.headers.get("content-type")?.includes("application/json")) {
    try {
      const parsed: unknown = JSON.parse(body);
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        "message" in parsed &&
        typeof parsed.message === "string"
      ) {
        return new ApiError(response.status, parsed.message);
      }
    } catch {
      // JSON 파싱 실패 시 본문 원문을 그대로 쓴다.
    }
  }

  return new ApiError(response.status, body);
}

/**
 * 성공 응답의 본문을 파싱한다. 204와 빈 본문은 undefined로 돌려준다
 * (로그아웃·찜 추가/삭제처럼 본문이 없는 응답).
 */
export async function parseJsonBody<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;

  const body = await response.text();
  if (!body) return undefined as T;

  return JSON.parse(body) as T;
}
