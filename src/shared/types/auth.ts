// Contract: UserResponse, TokenResponse, LoginRequest, RefreshTokenRequest (v3/api-docs)

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
