"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "cn";
import { PasswordField } from "@/shared/components/password-field";
import { CtaButton } from "@/shared/components/cta-button";
import { ConfirmModal } from "@/shared/components/confirm-modal";
import { AnimatedToast } from "@/shared/components/toast";
import { useOverlayFlag } from "@/shared/hooks/useOverlayFlag";
import { useLogout } from "@/shared/hooks/useLogout";
import { useWithdraw } from "../_hooks/use-withdraw";

// 안내 문구. docs/spec에 회원 탈퇴 스펙 문서가 없어 요청받은 문구를 그대로 쓴다
// (스펙이 생기면 그쪽으로 옮긴다).
const MAIN = "본인 확인을 위해 비밀번호를 입력해 주세요";
const SUB = "회원 탈퇴를 위해 현재 사용 중인 비밀번호를 입력해 주세요";
// 비밀번호 인풋 placeholder는 로그인 화면과 동일한 기존 문구를 재사용한다.
const PASSWORD_PLACEHOLDER = "비밀번호를 작성해 주세요";
const CTA = "회원 탈퇴";

// 탈퇴 확인 모달(Figma node 814-3702). 본문·버튼 문구는 요청값 그대로.
// 제목은 피그마에서 확인되지 않아 화면·버튼과 맞춰 임시로 "회원 탈퇴"를 쓴다.
const MODAL_TITLE = "회원 탈퇴";
const MODAL_DESCRIPTION =
  "탈퇴 시 계정 정보 및 서비스 이용 기록이 모두 삭제되며 복구할 수 없습니다. 소셜 로그인의 경우 연동이 해제됩니다.";
const MODAL_CONFIRM = "회원 탈퇴";

const TOAST_ID = "withdraw-error-toast";
// 비밀번호 불일치 토스트. n은 실패 횟수로 치환한다.
const failMessage = (n: number) =>
  `5회 중 ${n}번을 실패 하셨습니다. 비밀번호를 확인해 주세요`;

/**
 * 회원 탈퇴 폼. 비밀번호 입력 → "회원 탈퇴" CTA로 확인 모달을 띄우고, 모달에서
 * 한 번 더 확정해야 탈퇴 요청이 나간다. 응답이 실패(비밀번호 불일치 등)면 인풋
 * 테두리를 에러색으로 바꾸고 실패 횟수를 담은 토스트를 보여준다
 * (docs/spec/common-ui.md · 인풋 3, 토스트).
 */
export function WithdrawForm() {
  const router = useRouter();
  const { withdraw, isWithdrawing } = useWithdraw();
  const { logout } = useLogout();
  // 확인 모달 열림 상태를 URL에 저장하되 히스토리에는 쌓지 않는다.
  // 모달은 백드롭·Esc·취소로 닫으며 뒤로가기로 닫지 않는다(mobile.md).
  const [confirmOpen, setConfirmOpen] = useOverlayFlag("confirm");

  const [password, setPassword] = React.useState("");
  // 누적 실패 횟수(토스트 문구의 n).
  const [failCount, setFailCount] = React.useState(0);
  // 요청 실패 시 인풋 테두리에 에러색을 넣는다. 값을 고치면 걷어낸다.
  const [submitFailed, setSubmitFailed] = React.useState(false);
  // 탈퇴 성공 후 쿠키 정리·이동이 끝날 때까지 CTA 로딩을 이어 둔다.
  const [isFinishing, setIsFinishing] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);

  // 토스트는 잠시 후 자동으로 사라진다(비밀번호 재설정 화면과 동일).
  React.useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    // 값을 고치면 직전 요청 실패 테두리를 즉시 걷어낸다.
    if (submitFailed) setSubmitFailed(false);
  };

  // CTA 클릭: 바로 탈퇴하지 않고 확인 모달을 먼저 띄운다.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setConfirmOpen(true);
  };

  // 모달에서 한 번 더 확정했을 때 실제 탈퇴 요청을 보낸다.
  const handleConfirm = async () => {
    setSubmitFailed(false);
    try {
      await withdraw(password);
    } catch {
      // 실패(비밀번호 불일치 등): 인풋 에러 테두리 + 실패 횟수 토스트.
      const next = failCount + 1;
      setFailCount(next);
      setSubmitFailed(true);
      setToast(failMessage(next));
      return;
    }

    // 탈퇴 성공: 남은 httpOnly 쿠키를 지운 뒤 홈으로 보낸다. 성공 후 화면 스펙이
    // 없어 홈으로 보낸다(로그아웃과 동일한 귀착점).
    setIsFinishing(true);
    try {
      await logout();
    } catch {
      // 쿠키는 로그아웃 라우트가 요청 실패와 무관하게 지운다. 다음 조회에서
      // 서버 기준(비로그인)으로 맞춰지므로 여기서는 그대로 이동한다.
    }
    router.replace("/");
  };

  return (
    <>
      {/* 상단 에러 토스트: 비밀번호 불일치 시 실패 횟수를 담아 보여준다. */}
      <AnimatedToast
        open={!!toast}
        message={toast ?? ""}
        variant="error"
        id={TOAST_ID}
      />
      <div className="flex flex-1 flex-col px-4 pt-4 pb-5">
        <h2 className="text-h1 text-foreground">{MAIN}</h2>
        <p className="mt-2.5 text-sm font-medium break-keep text-muted-foreground">
          {SUB}
        </p>
        <form
          onSubmit={handleSubmit}
          className="mt-10 flex flex-1 flex-col"
          noValidate
        >
          <PasswordField
            label="비밀번호"
            hideLabel
            autoComplete="current-password"
            enterKeyHint="done"
            placeholder={PASSWORD_PLACEHOLDER}
            value={password}
            onChange={handlePasswordChange}
            // 요청 실패 시 에러 테두리 + 토스트와 연결(문구는 토스트가 안내).
            aria-invalid={submitFailed || undefined}
            aria-describedby={submitFailed && toast ? TOAST_ID : undefined}
          />
          <CtaButton
            type="submit"
            disabled={!password}
            isLoading={isWithdrawing || isFinishing}
            className={cn(
              "mt-auto text-foreground",
              password ? "hover:cursor-pointer" : "cursor-not-allowed",
            )}
          >
            {CTA}
          </CtaButton>
        </form>
      </div>

      {/* 탈퇴 확인 모달: 확정해야 실제 탈퇴 요청이 나간다. */}
      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={MODAL_TITLE}
        description={MODAL_DESCRIPTION}
        confirmLabel={MODAL_CONFIRM}
        onConfirm={handleConfirm}
      />
    </>
  );
}
