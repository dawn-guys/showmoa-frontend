import { AppBar } from "@/app/_components/app-bar";
import { WithdrawFlow } from "./_components/withdraw-flow";

/**
 * 회원 탈퇴. 본인 확인(일반 계정은 비밀번호, 소셜 계정은 이메일 인증) → 확인
 * 모달 → 탈퇴 요청 순으로 진행한다. 상호작용은 클라이언트 컴포넌트
 * (WithdrawFlow)에 두고, 페이지는 앱바와 레이아웃만 조립한다.
 */
export default function WithdrawPage() {
  return (
    <div className="flex min-h-dvh flex-col pb-safe">
      <AppBar title="회원 탈퇴" />
      <main className="flex flex-1 flex-col">
        <WithdrawFlow />
      </main>
    </div>
  );
}
