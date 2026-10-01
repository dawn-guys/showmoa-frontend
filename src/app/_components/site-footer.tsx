"use client";

import { useQueryState } from "nuqs";
import { CodeSquareLineDuotoneIcon } from "@solar-icons/react";
import { LegalDrawer } from "@/shared/components/legal-drawer";
import { overlayUrlOptions } from "@/shared/hooks/useOverlayFlag";

// 팀원 개인 GitHub 주소. Figma 노출 순서(곽다윗·양덕관·이준호·정준영)를 따른다.
const TEAM = [
  { name: "곽다윗", url: "https://github.com/lakesole" },
  { name: "양덕관", url: "https://github.com/isle-blu" },
  { name: "이준호", url: "https://github.com/JUNHORANG" },
  { name: "장준영", url: "https://github.com/jangabc3" },
] as const;

// show moa 오가니제이션 레포 목록
const PROJECT_REPO_URL = "https://github.com/orgs/dawn-guys/repositories";

/**
 * 서비스 공통 푸터. 개인정보 처리 방침·위치 정보 서비스 이용 약관 드로워를
 * 열고(URL 쿼리 policy로 상태 관리), 팀원·프로젝트 GitHub로 이동한다.
 * 하단 나브에 가려지지 않도록 나브 높이만큼 하단 여백을 둔다.
 */
export function SiteFooter() {
  // 드로워 열림 상태(개인정보=privacy, 위치약관=location). 문자열이라 공통 옵션을 그대로 쓴다.
  const [policy, setPolicy] = useQueryState("policy", overlayUrlOptions);

  return (
    <>
      <footer className="mt-17.5 flex flex-col items-center gap-[19px] bg-[#090909] px-4 pt-[23px] pb-[calc(var(--spacing-bottom-nav)_+_env(safe-area-inset-bottom)_+_23px)]">
        {/* 법적 고지: 눌러 각 드로워를 연다 */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => setPolicy("privacy")}
            className="rounded-sm px-3 py-2 text-sm font-medium text-hint outline-none focus-visible:ring-2 focus-visible:ring-ring active:text-foreground"
          >
            개인 정보 처리 방침
          </button>
          <button
            type="button"
            onClick={() => setPolicy("location")}
            className="rounded-sm px-3 py-2 text-sm font-medium text-hint outline-none focus-visible:ring-2 focus-visible:ring-ring active:text-foreground"
          >
            위치 정보 서비스 이용 약관
          </button>
        </div>

        {/* 팀원 개인 GitHub */}
        <ul className="flex items-center gap-2.5">
          {TEAM.map(({ name, url }) => (
            <li key={name}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm px-1 py-1.5 text-body3 font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {name}
                <span className="sr-only"> GitHub (새 창)</span>
              </a>
            </li>
          ))}
        </ul>

        {/* 프로젝트 레포 주소 */}
        <a
          href={PROJECT_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-[5px] rounded-sm px-1 py-1.5 text-body3 font-medium text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <CodeSquareLineDuotoneIcon size={14} aria-hidden />
          프로젝트 주소
          <span className="sr-only"> GitHub (새 창)</span>
        </a>
      </footer>

      {/* 개인정보 처리 방침 / 위치 정보 서비스 이용 약관 드로워 셸.
          본문은 아직 미확정이라 틀만 마운트한다. */}
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
