import { ArrowRightUpLinearIcon } from "@solar-icons/react";
import type { TicketingSiteInfo } from "@/app/(tabs)/_types";
import {
  parseShowTimeGuidance,
  replaceHolidayLabel,
} from "@/app/(tabs)/detail/[id]/_lib/detail-format";

interface PerformanceInfoSectionProps {
  /** 기간 표기(오픈런이면 "종료 기간 미정") */
  periodText: string;
  /** 오픈런 여부. true면 기간 아래에 종료 기간 연장 안내를 노출한다. */
  openRun: boolean;
  /** 상영 시간 자유 문구(예: "화요일(19:00)"). 없으면 시간 행을 숨긴다. */
  showTimeGuidance: string;
  /** 관람 연령(예: "만 7세 이상"). 없으면 나이 행을 숨긴다. */
  ageLimit: string | null;
  /** 예매처 목록 */
  ticketingSites: TicketingSiteInfo[];
  /** true면 예매처 행 전체를 숨긴다(오픈런 아님 + 종료일 지남). */
  hideTicketing: boolean;
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
  openRun,
  showTimeGuidance,
  ageLimit,
  ticketingSites,
  hideTicketing,
}: PerformanceInfoSectionProps) {
  // 공휴일 표기(HOL)를 먼저 바꿔 두어 파싱 결과와 원문 폴백 모두에 반영한다.
  const showTimeText = replaceHolidayLabel(showTimeGuidance);
  // 요일별 줄로 분리한다. 자유 형식이라 파싱이 안 맞으면 null → 원문 그대로 표시.
  const showTimeLines = parseShowTimeGuidance(showTimeText);

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-h1 font-semibold text-foreground">공연 정보</h2>
      <dl className="flex flex-col gap-5">
        <InfoRow label="기간">
          <span>{periodText}</span>
          {/* 오픈런은 종료일이 확정 아님을 안내한다(docs/spec 외 카피, Figma 원문). */}
          {openRun && (
            <span className="text-muted-foreground">
              해당 공연은 종료 기간이 연장 될 수 있습니다
            </span>
          )}
        </InfoRow>
        {showTimeGuidance && (
          <InfoRow label="시간">
            {showTimeLines ? (
              showTimeLines.map((line, index) => (
                <span key={index} className="break-keep">
                  {line.day} {line.times}
                </span>
              ))
            ) : (
              <span className="break-keep">{showTimeText}</span>
            )}
          </InfoRow>
        )}
        {ageLimit && (
          <InfoRow label="나이">
            <span>{ageLimit}</span>
          </InfoRow>
        )}
        {!hideTicketing && ticketingSites.length > 0 && (
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
