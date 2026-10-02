import { AppBar } from "@/app/_components/app-bar";
import { WithdrawForm } from "./_components/withdraw-form";

/**
 * 회원 탈퇴. 본인 확인용 비밀번호 입력 → 확인 모달 → 탈퇴 요청(현재 목업) 순으로
 * 진행한다. 상호작용은 클라이언트 컴포넌트(WithdrawForm)에 두고, 페이지는
 * 앱바와 레이아웃만 조립한다.
 */
export default function WithdrawPage() {
  return (
    <div className="flex min-h-dvh flex-col pb-safe">
      <AppBar title="회원 탈퇴" />
      <main className="flex flex-1 flex-col">
        <WithdrawForm />
      </main>
    </div>
  );
}
