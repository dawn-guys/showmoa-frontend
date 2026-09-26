import {
  authorizationHeader,
  callBackend,
  clearTokens,
  readTokens,
} from "@/shared/lib/backend.server";

/**
 * 로그아웃. 백엔드 요청이 실패해도(토큰 만료 등) 쿠키는 반드시 지운다.
 * 클라이언트가 로그아웃을 못 하는 상태에 갇히지 않게 하기 위함이다.
 */
export async function POST() {
  const { accessToken } = await readTokens();

  try {
    await callBackend("/api/auth/logout", {
      method: "POST",
      headers: authorizationHeader(accessToken),
    });
  } catch {
    // 네트워크 실패도 무시하고 쿠키 삭제로 진행한다.
  }

  await clearTokens();

  return new Response(null, { status: 204 });
}
