// Contract: UserResponse, TokenResponse, LoginRequest, RefreshTokenRequest,
// EmailSendRequest, EmailSendResponse, EmailVerifyRequest, SignupRequest,
// PasswordResetRequest, OAuthExchangeRequest (v3/api-docs)

/** GET /api/users/me, POST /api/users/signup, PATCH /api/users/me/password 응답 */
export interface UserResponse {
  id: number;
  email: string;
  hasPassword: boolean;
}

/** POST /api/auth/login, /api/auth/refresh, /api/auth/oauth/exchange 응답 */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

/** POST /api/auth/login 요청 바디 */
export interface LoginRequest {
  email: string;
  password: string;
}

/** POST /api/auth/refresh 요청 바디 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/** POST /api/auth/oauth/exchange 요청 바디. 소셜 로그인 콜백의 1회용 코드다. */
export interface OAuthExchangeRequest {
  code: string;
}

/** POST /api/email/send 요청 바디 */
export interface EmailSendRequest {
  email: string;
}

/** POST /api/email/send 응답. 인증 번호의 유효 시간(초)으로 타이머를 구동한다. */
export interface EmailSendResponse {
  expirationSeconds: number;
}

/** POST /api/email/verify 요청 바디 */
export interface EmailVerifyRequest {
  email: string;
  code: string;
}

/** POST /api/users/signup 요청 바디 */
export interface SignupRequest {
  email: string;
  password: string;
}

/** POST /api/users/password/reset 요청 바디. 비밀번호 찾기·변경이 함께 쓴다. */
export interface PasswordResetRequest {
  email: string;
  newPassword: string;
}
