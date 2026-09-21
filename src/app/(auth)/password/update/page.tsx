import { PasswordResetFlow } from "../_components/password-reset-flow";

/**
 * 비밀번호 변경. 이메일 인증 → 새 비밀번호 설정 공통 플로우를 재사용하며
 * 앱바 제목만 "비밀번호 변경"으로 지정한다(비밀번호 찾기와 동일한 플로우).
 */
export default function UpdatePasswordPage() {
  return <PasswordResetFlow title="비밀번호 변경" />;
}
