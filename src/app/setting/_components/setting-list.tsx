"use client";

import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { ConfirmModal } from "@/shared/components/confirm-modal";
import { LegalDrawer } from "@/shared/components/legal-drawer";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useAuth } from "@/shared/hooks/useAuth";
import { useLogout } from "@/shared/hooks/useLogout";
import {
  overlayUrlOptions,
  useOverlayFlag,
} from "@/shared/hooks/useOverlayFlag";
import { SettingRow } from "./setting-row";

/**
 * 설정 화면 본문. 로그인 여부(useAuth)에 따라 계정 섹션을 분기한다.
 * 운영 정책 드로워와 로그아웃 모달 모두 열림 상태를 URL에 저장하되,
 * 히스토리에는 쌓지 않는다.
 */
export function SettingList() {
  const router = useRouter();
  // 드로워 열림 상태(개인정보=privacy, 위치약관=location). 문자열이라 공통 옵션을 그대로 쓴다.
  const [policy, setPolicy] = useQueryState("policy", overlayUrlOptions);
  // 로그아웃 모달 열림 상태(공통 훅으로 히스토리 미누적).
  // 모달은 백드롭·Esc·취소로 닫으며 뒤로가기로 닫지 않는다.
  const [logoutOpen, setLogoutOpen] = useOverlayFlag("logout");

  // 헤더와 동일하게 useAuth로 로그인 여부를 판별한다(세션 확인 중 깜빡임 방지).
  const { user, isLoggedIn, isLoading } = useAuth();
  const { logout } = useLogout();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // 요청이 실패해도 라우트 핸들러가 쿠키를 지우고, 훅이 사용자 쿼리를 비운다.
      // 로그아웃을 못 하는 상태에 갇히지 않도록 그대로 홈으로 보낸다.
    }
    router.push("/");
  };

  return (
    <>
      <div className="mt-[25px] flex flex-col gap-8 px-4">
        {/* 계정 */}
        <section className="flex flex-col">
          <h2 className="text-h1 font-[400] text-primary">계정</h2>
          <div className="mt-[18px] flex flex-col" aria-busy={isLoading}>
            {isLoading ? (
              // 세션 확인 중: 로그인 여부를 알 수 없어 항목을 스켈레톤으로 대체한다.
              <>
                <div className="flex min-h-11 items-center">
                  <Skeleton className="h-5 w-40" aria-hidden />
                </div>
                <div className="flex min-h-11 items-center">
                  <Skeleton className="h-5 w-24" aria-hidden />
                </div>
                <div className="flex min-h-11 items-center">
                  <Skeleton className="h-5 w-16" aria-hidden />
                </div>
              </>
            ) : isLoggedIn ? (
              <>
                {/* 로그인한 본인 계정(이메일). 클릭 동작 없는 표시 항목이다. */}
                <p className="flex min-h-11 items-center text-body1 font-[300] [overflow-wrap:anywhere] text-foreground">
                  {user?.email}
                </p>
                <SettingRow label="비밀번호 변경" href="/password/update" />
                <SettingRow label="회원 탈퇴" href="/setting/withdraw" />
                <SettingRow
                  label="로그아웃"
                  onClick={() => setLogoutOpen(true)}
                />
              </>
            ) : (
              <>
                <SettingRow label="로그인" href="/login" />
                <SettingRow label="회원가입" href="/signup" />
              </>
            )}
          </div>
        </section>

        {/* 운영 정책 */}
        <section className="flex flex-col">
          <h2 className="text-h1 font-[400] text-primary">운영 정책</h2>
          <div className="mt-[18px] flex flex-col">
            <SettingRow
              label="개인 정보 처리 방침"
              onClick={() => setPolicy("privacy")}
            />
            <SettingRow
              label="위치 정보 서비스 이용 약관"
              onClick={() => setPolicy("location")}
            />
          </div>
        </section>
      </div>

      {/* 로그아웃 모달 */}
      <ConfirmModal
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="로그 아웃"
        description="로그 아웃을 하면 특정 서비스를 사용하실 수 없습니다. 로그아웃 하시겠습니까?"
        confirmLabel="로그아웃"
        onConfirm={handleLogout}
      />

      {/* 운영 정책 드로워. 본문은 확정 전이라 셸만 마운트한다. */}
      <LegalDrawer
        open={policy === "privacy"}
        onOpenChange={(open) => setPolicy(open ? "privacy" : null)}
        title="개인 정보 처리 방침"
      />
      <LegalDrawer
        open={policy === "location"}
        onOpenChange={(open) => setPolicy(open ? "location" : null)}
        title="위치 정보 서비스 이용 약관"
      />
    </>
  );
}
