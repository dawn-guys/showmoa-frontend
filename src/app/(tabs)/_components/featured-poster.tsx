import Image from "next/image";

interface FeaturedPosterProps {
  src: string;
  /** 중앙 포스터 대체 텍스트(공연 제목 기반) */
  alt: string;
}

/**
 * 주목받는 공연 포스터. 같은 이미지를 배경으로 꽉 채워 블러+어둡게 깔고,
 * 그 위 중앙에 선명한 포스터를 세로 비율(143:254)로 얹는다.
 * 컨테이너 비율/라운드는 Figma(345×300, radius 15) 기준.
 */
export function FeaturedPoster({ src, alt }: FeaturedPosterProps) {
  return (
    <div className="relative aspect-[345/300] w-full overflow-hidden rounded-[15px] bg-muted">
      {/* 배경: 블러 처리한 동일 포스터 (가장자리 비침 방지를 위해 살짝 확대) */}
      <Image
        src={src}
        alt=""
        aria-hidden
        fill
        sizes="(max-width: 480px) 100vw, 480px"
        className="scale-110 object-cover blur-[14px]"
      />
      {/* 어둡게 덮는 오버레이 */}
      <div className="absolute inset-0 bg-black/40" />
      {/* 중앙 선명 포스터 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative aspect-[143/254] h-[85%]">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 480px) 41vw, 200px"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
