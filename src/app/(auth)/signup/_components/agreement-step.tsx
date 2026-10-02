"use client";

import * as React from "react";
import { cn } from "cn";
import { CtaButton } from "@/shared/components/cta-button";
import {
  LocationTermsContent,
  PrivacyPolicyContent,
} from "@/shared/components/legal-content";
import { LegalDrawer } from "@/shared/components/legal-drawer";
import { AgreementCheckbox } from "./agreement-checkbox";

// 자세히 보기로 여는 약관 종류.
type Term = "privacy" | "location";

interface AgreementStepProps {
  /** 두 약관에 모두 동의한 뒤 다음 단계로 넘어간다 */
  onNext: () => void;
}

/**
 * 회원가입 1단계: 이용 약관 동의. 개인 정보 처리 방침과 위치 정보 서비스
 * 이용 약관에 모두 동의해야 [다음] 버튼이 활성화된다. 각 약관의
 * [ 자세히 보기 ]로 해당 약관 드로워를 연다(뒤로가기로 닫힘).
 */
export function AgreementStep({ onNext }: AgreementStepProps) {
  const [privacyAgreed, setPrivacyAgreed] = React.useState(false);
  const [locationAgreed, setLocationAgreed] = React.useState(false);

  // 약관 드로워 열림 상태는 URL과 무관한 순수 UI 상태라 로컬로 관리한다.
  // 앱바 뒤로가기가 드로워 열림 기록까지 되짚지 않게 하기 위함이다.
  const [openTerm, setOpenTerm] = React.useState<Term | null>(null);

  const allAgreed = privacyAgreed && locationAgreed;

  return (
    <div className="flex flex-1 flex-col px-4 pt-4 pb-5">
      <h2 className="text-h1 text-foreground">이용 약관에 동의를 해주세요</h2>
      <p className="mt-2.5 text-sm font-medium break-keep text-muted-foreground">
        개인 정보 처리 방침과 위치 정보 서비스 약관을 확인해 주세요
      </p>

      <div className="mt-10 flex flex-col gap-[15px]">
        <AgreementCheckbox
          label="개인 정보 처리 방침"
          checked={privacyAgreed}
          onCheckedChange={setPrivacyAgreed}
          onDetail={() => setOpenTerm("privacy")}
        />
        <AgreementCheckbox
          label="위치 정보 서비스 이용 약관"
          checked={locationAgreed}
          onCheckedChange={setLocationAgreed}
          onDetail={() => setOpenTerm("location")}
        />
      </div>

      <CtaButton
        type="button"
        onClick={onNext}
        disabled={!allAgreed}
        className={cn(
          "mt-auto text-foreground",
          allAgreed ? "hover:cursor-pointer" : "cursor-not-allowed",
        )}
      >
        다음
      </CtaButton>

      <LegalDrawer
        open={openTerm === "privacy"}
        onOpenChange={(open) => {
          if (!open) setOpenTerm(null);
        }}
        title="개인 정보 처리 방침"
      >
        <PrivacyPolicyContent />
      </LegalDrawer>
      <LegalDrawer
        open={openTerm === "location"}
        onOpenChange={(open) => {
          if (!open) setOpenTerm(null);
        }}
        title="위치 정보 서비스 이용 약관"
      >
        <LocationTermsContent />
      </LegalDrawer>
    </div>
  );
}
