/**
 * 소셜 로그인 경로와 실패 표시에 쓰는 값.
 *
 * 로그인 시작 URL은 계약(v3/api-docs)에 없다. 백엔드의 Spring Security 필터
 * 경로라 문서화되지 않고, 실제 동작으로 확인했다.
 * - GET {백엔드}/oauth2/authorization/{provider} → 구글·카카오로 302
 * - redirect_uri는 백엔드 자신({백엔드}/login/oauth2/code/{provider})이라
 *   프론트가 정할 값이 없다
 * - 실패하면 {프론트}/oauth/callback?error=social_login_failed 로 되돌아온다
 *   (잘못된 code, 사용자 취소 모두 같은 값)
 */

/** 백엔드에 설정된 provider. naver·apple은 500이라 두 개뿐이다. */
export const OAUTH_PROVIDERS = ["google", "kakao"] as const;
export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];

/** 소셜 로그인 시작 라우트. fetch가 아니라 전체 페이지 이동으로 호출한다. */
export function oauthStartPath(provider: OAuthProvider) {
  return `/api/auth/oauth/start/${provider}`;
}

/** 실패를 로그인 화면으로 넘길 때 쓰는 쿼리. 백엔드가 쓰는 값을 그대로 쓴다. */
export const OAUTH_ERROR_PARAM = "error";
export const OAUTH_ERROR_VALUE = "social_login_failed";
