// Contract: UserResponse, TokenResponse, LoginRequest, RefreshTokenRequest,
// EmailSendRequest, EmailSendResponse, EmailVerifyRequest, SignupRequest,
// PasswordResetRequest (v3/api-docs),
// OAuthExchangeRequest, OAuth2ErrorDetail, EmailPurpose (백엔드 소스, api-docs 미반영)

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

/**
 * POST /api/auth/oauth/exchange 요청 바디. code는 소셜 로그인 콜백의 1회용 코드,
 * verifier는 로그인 시작 때 보낸 code_challenge의 원본이다(PKCE, 43~128자).
 */
export interface OAuthExchangeRequest {
  code: string;
  verifier: string;
}

/**
 * GET /api/auth/oauth/error 응답. 소셜 로그인 실패 사유다.
 * api-docs에 아직 없어 백엔드 소스(OAuth2ErrorService.OAuth2ErrorDetail)를 따른다.
 * errorType은 "duplicate_email" | "social_login_failed", duplicate_email일 때
 * detail은 기존 계정의 가입 방식(LOCAL·GOOGLE·KAKAO)이다.
 */
export interface OAuth2ErrorDetail {
  errorType: string;
  detail: string | null;
}

/**
 * 인증 메일 발송 용도. 백엔드 소스(EmailPurpose) 기준이며 dev 서버 api-docs에는
 * 아직 반영되지 않았다(배포 전 서버는 이 필드를 무시한다).
 */
export type EmailPurpose = "SIGNUP" | "PASSWORD_RESET" | "WITHDRAWAL";

/** POST /api/email/send 요청 바디 */
export interface EmailSendRequest {
  email: string;
  purpose: EmailPurpose;
}

/**
 * POST /api/email/send 응답. 인증 번호의 유효 시간(초)으로 타이머를 구동한다.
 * 백엔드는 용도와 가입 여부가 맞지 않으면(회원가입인데 이미 가입, 비밀번호
 * 찾기·탈퇴인데 미가입) 메일을 보내지 않고 sent false로 200을 준다.
 * emailExists·sent는 dev 서버 api-docs에 아직 없어 선택 필드로 둔다.
 */
export interface EmailSendResponse {
  expirationSeconds: number;
  emailExists?: boolean;
  sent?: boolean;
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
