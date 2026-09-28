import { ArrowRightUpLinearIcon } from "@solar-icons/react";
import type { TicketingSiteInfo } from "@/app/(tabs)/_types";

interface PerformanceInfoSectionProps {
  /** 기간 표기(오픈런이면 "종료 기간 미정") */
  periodText: string;
  /** 상영 시간 자유 문구(예: "화요일(19:00)"). 없으면 시간 행을 숨긴다. */
  showTimeGuidance: string;
  /** 관람 연령(예: "만 7세 이상"). 없으면 나이 행을 숨긴다. */
  ageLimit: string | null;
  /** 예매처 목록 */
  ticketingSites: TicketingSiteInfo[];
}

/** 라벨-값 한 줄. 라벨은 회색(#5E5E5E=hint 토큰), 값은 흰색. */
function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-6 text-body2">
      <dt className="shrink-0 text-hint">{label}</dt>
      <dd className="flex flex-col gap-1 text-foreground">{children}</dd>
    </div>
  );
}

/**
 * 공연 정보 섹션(기간·시간·나이·예매처). 예매처는 새 창으로 열리는 외부 링크다.
 * 시간·나이는 응답에 값이 없을 수 있어 있을 때만 노출한다.
 */
export function PerformanceInfoSection({
  periodText,
  showTimeGuidance,
  ageLimit,
  ticketingSites,
}: PerformanceInfoSectionProps) {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-h1 font-semibold text-foreground">공연 정보</h2>
      <dl className="flex flex-col gap-5">
        <InfoRow label="기간">
          <span>{periodText}</span>
        </InfoRow>
        {showTimeGuidance && (
          <InfoRow label="시간">
            <span className="break-keep">{showTimeGuidance}</span>
          </InfoRow>
        )}
        {ageLimit && (
          <InfoRow label="나이">
            <span>{ageLimit}</span>
          </InfoRow>
        )}
        {ticketingSites.length > 0 && (
          <InfoRow label="예매">
            <ul className="flex flex-wrap gap-2.5">
              {ticketingSites.map((site) => (
                <li key={site.name}>
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-[3px] border border-border px-2.5 py-1 text-body3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring active:bg-muted"
                  >
                    {site.name}
                    <ArrowRightUpLinearIcon size={14} aria-hidden />
                    <span className="sr-only">(새 창에서 열림)</span>
                  </a>
                </li>
              ))}
            </ul>
          </InfoRow>
        )}
      </dl>
    </section>
  );
}
