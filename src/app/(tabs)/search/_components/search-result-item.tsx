import Image from "next/image";
import Link from "next/link";
import type { PerformanceListResponse } from "@/app/(tabs)/_types";

interface SearchResultItemProps {
  performance: PerformanceListResponse;
}

/**
 * 검색 결과 한 항목. 포스터·제목·장르를 보여주고, 누르면 상세로 이동한다.
 * (검색 리스트에는 하트 버튼이 없다 — docs/spec 검색 참조) <ul> 안에서 쓴다.
 */
export function SearchResultItem({ performance }: SearchResultItemProps) {
  const { id, name, posterUrl, genre } = performance;

  return (
    <li>
      <Link
        href={`/detail/${id}`}
        className="flex items-center gap-5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="relative size-[50px] shrink-0 overflow-hidden rounded-lg bg-muted">
          {posterUrl && (
            <Image
              src={posterUrl}
              alt=""
              fill
              sizes="50px"
              className="object-cover"
            />
          )}
        </span>
        <span className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-body1 font-medium text-foreground">
            {name}
          </span>
          {/* 장르가 없는 공연(genre: null)은 장르 줄을 비우지 않고 아예 빼둔다. */}
          {genre && (
            <span className="truncate text-body3 text-muted-foreground">
              {genre}
            </span>
          )}
        </span>
      </Link>
    </li>
  );
}
