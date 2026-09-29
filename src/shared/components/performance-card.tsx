import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/shared/components/ui/badge";

interface PerformanceCardProps {
  id: number;
  title: string;
  /**
   * 장르. 응답 값(연극·뮤지컬·콘서트·클래식·국악·기타)을 그대로 노출한다.
   * 찜 캘린더 응답처럼 장르가 없는 항목도 있어, 없으면 태그를 숨긴다.
   */
  genre?: string;
  /** 포스터 이미지 URL. 없으면 플레이스홀더가 노출된다. */
  posterUrl?: string;
  /** 진행 상태 뱃지 문구(예: "공연 중"). 없으면 뱃지를 숨긴다. */
  statusLabel?: string;
}

/**
 * 세로형 공연 카드. 포스터·진행 상태 뱃지·제목·장르 태그로 구성되며,
 * 카드를 누르면 상세로 이동한다. 폭은 배치되는 그리드가 결정한다.
 */
export function PerformanceCard({
  id,
  title,
  genre,
  posterUrl,
  statusLabel,
}: PerformanceCardProps) {
  return (
    <article>
      <Link
        href={`/detail/${id}`}
        className="flex flex-col gap-2.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
          {posterUrl && (
            <Image
              src={posterUrl}
              alt=""
              fill
              sizes="(max-width: 480px) 50vw, 240px"
              className="object-cover"
            />
          )}
          {statusLabel && (
            <Badge className="absolute top-2 left-2 text-foreground">
              {statusLabel}
            </Badge>
          )}
        </div>
        <h3 className="truncate text-body3 font-medium text-foreground">
          {title}
        </h3>
        {genre && (
          <Badge variant="secondary" className="w-fit">
            {genre}
          </Badge>
        )}
      </Link>
    </article>
  );
}
