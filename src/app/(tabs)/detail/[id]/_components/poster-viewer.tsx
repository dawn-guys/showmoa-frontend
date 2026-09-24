"use client";

import { useState } from "react";
import Image from "next/image";
import { FeaturedPoster } from "@/app/(tabs)/_components/featured-poster";

interface PosterViewerProps {
  posterUrl: string;
  /** 포스터 대체 텍스트용 공연 제목 */
  title: string;
  /** 상세 정보 이미지 목록. 비어 있으면 "상세 보기" 버튼을 노출하지 않는다. */
  detailImageUrls: string[];
}

/**
 * 포스터 + "상세 보기" 토글. 버튼을 누르면 숨겨진 상세 정보 이미지가 펼쳐지고,
 * "상세 보기 닫기"로 다시 접는다. 상세 이미지가 없으면 버튼 자체를 숨긴다.
 */
export function PosterViewer({
  posterUrl,
  title,
  detailImageUrls,
}: PosterViewerProps) {
  const [expanded, setExpanded] = useState(false);
  const hasDetailImages = detailImageUrls.length > 0;
  const panelId = "detail-images";

  return (
    <div className="flex flex-col gap-3.5">
      <FeaturedPoster src={posterUrl} alt={`${title} 포스터`} />

      {hasDetailImages && (
        <>
          {expanded && (
            <div id={panelId} className="flex flex-col gap-2.5">
              {detailImageUrls.map((url, index) => (
                <Image
                  key={url}
                  src={url}
                  alt={`${title} 상세 정보 ${index + 1}`}
                  width={690}
                  height={1200}
                  sizes="(max-width: 480px) 100vw, 480px"
                  className="h-auto w-full rounded-md"
                />
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            aria-controls={panelId}
            // 배경 #272727은 secondary(#262626)와 사실상 동일 계열이라 secondary 토큰을 사용.
            className="h-11 rounded-md bg-secondary text-body1 text-foreground outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring active:bg-[color-mix(in_oklch,var(--secondary),white_6%)]"
          >
            {expanded ? "상세 보기 닫기" : "상세 보기"}
          </button>
        </>
      )}
    </div>
  );
}
