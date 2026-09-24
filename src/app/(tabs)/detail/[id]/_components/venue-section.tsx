import Link from "next/link";
import {
  AltArrowRightLinearIcon,
  CopyLineDuotoneIcon,
} from "@solar-icons/react";
import type { VenueDetail } from "@/app/(tabs)/detail/[id]/_types";
import { VenueMiniMap } from "@/app/(tabs)/detail/[id]/_components/venue-mini-map";

interface VenueSectionProps {
  venue: VenueDetail;
  /** 주소 텍스트 복사 요청(성공/실패 토스트는 상위에서 처리). */
  onCopyAddress: (text: string) => void;
}

/** 복사 아이콘이 달린 주소 한 줄. */
function CopyableAddress({
  address,
  onCopy,
}: {
  address: string;
  onCopy: (text: string) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-body2 text-foreground">{address}</span>
      {/* 아이콘은 14px지만 히트 영역은 44px(터치 최소치). -my로 줄 높이는 유지한다. */}
      <button
        type="button"
        onClick={() => onCopy(address)}
        aria-label={`${address} 복사`}
        className="-my-2.5 flex size-11 shrink-0 items-center justify-center rounded-sm text-foreground outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring active:opacity-60"
      >
        <CopyLineDuotoneIcon size={14} aria-hidden />
      </button>
    </div>
  );
}

/**
 * 공연장 주소 섹션. 제목 옆 화살표로 지도 페이지(/map?search=주소)로 이동하고,
 * 미니 지도·주소(지번/도로명, 복사)·건물명·전화번호를 보여준다.
 */
export function VenueSection({ venue, onCopyAddress }: VenueSectionProps) {
  return (
    <section className="mb-15 flex flex-col gap-5">
      {/* -my로 제목 줄 높이는 유지하면서 화살표 링크 히트 영역은 44px로 넓힌다. */}
      <div className="flex items-center justify-between">
        <h2 className="text-h1 font-semibold text-foreground">공연장 주소</h2>
        <Link
          href={`/map?search=${encodeURIComponent(venue.roadAddress)}`}
          aria-label="지도에서 공연장 위치 보기"
          className="-my-2.5 flex size-11 items-center justify-end rounded-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring active:opacity-60"
        >
          <AltArrowRightLinearIcon
            size={20}
            className="stroke-[2]"
            color="#888888"
            aria-hidden
          />
        </Link>
      </div>

      <VenueMiniMap name={venue.name} lat={venue.lat} lng={venue.lng} />

      <dl className="flex flex-col gap-5 text-body2">
        <div className="flex gap-5">
          <dt className="w-13.5 shrink-0 text-hint">주소</dt>
          <dd className="flex flex-col gap-2">
            <CopyableAddress
              address={venue.jibunAddress}
              onCopy={onCopyAddress}
            />
            <CopyableAddress
              address={venue.roadAddress}
              onCopy={onCopyAddress}
            />
          </dd>
        </div>
        <div className="flex gap-5">
          <dt className="w-13.5 shrink-0 text-hint">건물명</dt>
          <dd className="text-foreground">{venue.name}</dd>
        </div>
        <div className="flex gap-5">
          <dt className="w-13.5 shrink-0 text-hint">전화번호</dt>
          <dd className="text-foreground">{venue.phone}</dd>
        </div>
      </dl>
    </section>
  );
}
