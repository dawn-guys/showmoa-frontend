"use client";

import * as React from "react";
import { notFound, useRouter } from "next/navigation";
import { ConfirmModal } from "@/shared/components/confirm-modal";
import { EmailVerification } from "@/shared/components/email-verification";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { useOverlayFlag } from "@/shared/hooks/useOverlayFlag";
import { useLogout } from "@/shared/hooks/useLogout";
import { useWithdraw } from "../_hooks/use-withdraw";
import { MODAL_CONFIRM, MODAL_DESCRIPTION, MODAL_TITLE } from "./withdraw-form";

// 인증 번호 단계 안내 문구. docs/spec에 회원 탈퇴 스펙 문서가 없어 요청받은
// 문구를 그대로 쓴다(스펙이 생기면 그쪽으로 옮긴다).
const CODE_COPY = {
  main: "이메일로 인증번호를 발송 했습니다",
  sub: "회원 탈퇴를 위해 메일로 전송 된 인증번호를 작성해 주세요",
  placeholder: "인증번호 6자리를 작성해 주세요",
};

interface SocialWithdrawFormProps {
  /** 로그인한 계정 이메일. 인증 대상으로 고정되며 수정할 수 없다. */
  email: string;
}

/**
 * 회원 탈퇴 폼(소셜 계정). 비밀번호가 없어 이메일 인증으로 본인을 확인한다.
 * 진입하자마자 계정 이메일로 인증 메일을 보내고(purpose WITHDRAWAL), 인증 번호
 * 검증에 성공하면 일반 계정과 같은 확인 모달을 띄운다. 모달에서 확정해야 탈퇴
 * 요청이 나간다. 인증 UI·타이머·토스트는 이메일 인증 공통 블록을 그대로 쓴다.
 *
 * 인증 통과 여부는 이 컴포넌트의 상태로만 들고 있어, 중간에 나갔다 다시 들어오면
 * 인증부터 다시 받는다.
 */
export function SocialWithdrawForm({ email }: SocialWithdrawFormProps) {
  const router = useRouter();
  const { withdraw } = useWithdraw();
  const { logout } = useLogout();
  // 확인 모달 열림 상태(일반 계정 탈퇴와 동일하게 URL 저장, 히스토리 미누적).
  const [confirmOpen, setConfirmOpen] = useOverlayFlag("confirm");

  // 이메일 인증을 통과했는지. 통과 전에는 탈퇴 요청을 보내지 않는다.
  const [verified, setVerified] = React.useState(false);
  // 탈퇴 요청 실패 → 렌더 경로에서 notFound()로 404 이동.
  const [failed, setFailed] = React.useState(false);
  // 탈퇴 요청부터 이동까지. 확인 모달은 확정 즉시 닫히므로, 그동안 인증 블록
  // 대신 로딩 스피너를 보여 중복 요청을 막는다(docs/spec/common-ui.md · 로딩 스피너).
  const [isLeaving, setIsLeaving] = React.useState(false);

  const handleVerified = () => {
    setVerified(true);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!verified || isLeaving) return;
    setIsLeaving(true);
    try {
      await withdraw();
    } catch {
      // 인증 미완료(400 email-not-verified)는 404로 보낸다(소유자 결정).
      // 백엔드는 탈퇴 요청을 받는 순간 인증 상태를 소모하므로, 다른 실패여도
      // 같은 인증으로 다시 시도할 수 없어 같은 경로로 처리한다.
      setFailed(true);
      return;
    }

    // 탈퇴 성공: 일반 계정 탈퇴와 동일하게 남은 httpOnly 쿠키를 지운 뒤 홈으로 보낸다.
    try {
      await logout();
    } catch {
      // 쿠키는 로그아웃 라우트가 요청 실패와 무관하게 지운다.
    }
    router.replace("/");
  };

  if (failed) notFound();

  return (
    <>
      {isLeaving ? (
        <div className="flex flex-1 items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <EmailVerification
          purpose="WITHDRAWAL"
          fixedEmail={email}
          autoSend
          codeCopy={CODE_COPY}
          onVerified={handleVerified}
        />
      )}

      {/* 탈퇴 확인 모달: 인증을 통과한 뒤 확정해야 실제 탈퇴 요청이 나간다. */}
      <ConfirmModal
        open={confirmOpen && verified}
        onOpenChange={setConfirmOpen}
        title={MODAL_TITLE}
        description={MODAL_DESCRIPTION}
        confirmLabel={MODAL_CONFIRM}
        onConfirm={handleConfirm}
      />
    </>
  );
}
