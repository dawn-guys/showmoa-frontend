import { PasswordResetFlow } from "../_components/password-reset-flow";

/**
 * 비밀번호 찾기. 이메일 인증 → 새 비밀번호 설정 공통 플로우를 재사용하며
 * 앱바 제목만 "비밀번호 찾기"로 지정한다.
 */
export default function FindPasswordPage() {
  return <PasswordResetFlow title="비밀번호 찾기" />;
}
