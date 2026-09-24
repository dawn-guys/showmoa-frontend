import { ArrowRightUpLinearIcon } from "@solar-icons/react";
import type {
  PerformanceSchedule,
  TicketVendor,
} from "@/app/(tabs)/detail/[id]/_types";

interface PerformanceInfoSectionProps {
  /** 기간 표기(오픈런이면 "종료 기간 미정") */
  periodText: string;
  schedules: PerformanceSchedule[];
  ageRating: string;
  ticketVendors: TicketVendor[];
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
 */
export function PerformanceInfoSection({
  periodText,
  schedules,
  ageRating,
  ticketVendors,
}: PerformanceInfoSectionProps) {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-h1 font-semibold text-foreground">공연 정보</h2>
      <dl className="flex flex-col gap-5">
        <InfoRow label="기간">
          <span>{periodText}</span>
        </InfoRow>
        <InfoRow label="시간">
          {schedules.map((schedule, index) => (
            <span key={index}>
              {schedule.days} {schedule.time}
            </span>
          ))}
        </InfoRow>
        <InfoRow label="나이">
          <span>{ageRating}</span>
        </InfoRow>
        {ticketVendors.length > 0 && (
          <InfoRow label="예매">
            <ul className="flex flex-wrap gap-2.5">
              {ticketVendors.map((vendor) => (
                <li key={vendor.name}>
                  <a
                    href={vendor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-[3px] border border-border px-2.5 py-1 text-body3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring active:bg-muted"
                  >
                    {vendor.name}
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
