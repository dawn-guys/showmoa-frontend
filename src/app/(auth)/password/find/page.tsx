"use client";

import { useRouter } from "next/navigation";
import { PasswordResetFlow } from "../_components/password-reset-flow";

/**
 * 비밀번호 찾기. 이메일 인증 → 새 비밀번호 설정 공통 플로우를 재사용한다.
 * 비로그인 화면이라 인증할 이메일은 사용자가 직접 입력한다.
 */
export default function FindPasswordPage() {
  const router = useRouter();

  // 재설정한 비밀번호로 직접 로그인하도록 로그인 화면으로 보낸다.
  // replace라 뒤로가기로 재설정 퍼널에 돌아오지 않는다.
  const handleReset = () => router.replace("/login");

  return <PasswordResetFlow title="비밀번호 찾기" onReset={handleReset} />;
}
