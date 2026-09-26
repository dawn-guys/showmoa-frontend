import type { TokenResponse } from "@/shared/types/auth";
import {
  callBackend,
  passthroughResponse,
  writeTokens,
} from "@/shared/lib/backend.server";
import { parseJsonBody } from "@/shared/lib/api-error";

/**
 * 로그인. 백엔드의 TokenResponse를 받아 httpOnly 쿠키에만 심고, 본문 없이 204를
 * 돌려준다. 토큰이 브라우저 JS로 넘어가지 않는 유일한 경로다.
 *
 * 실패하면 백엔드의 상태 코드와 본문을 그대로 통과시킨다. 화면 문구는 docs/spec에서
 * 가져오므로 이 본문을 사용자에게 보여주지는 않는다.
 */
export async function POST(request: Request) {
  const response = await callBackend("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await request.text(),
  });

  if (!response.ok) return passthroughResponse(response);

  await writeTokens(await parseJsonBody<TokenResponse>(response));

  return new Response(null, { status: 204 });
}
