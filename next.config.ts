import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // MOCK: 실제 포스터 에셋 연동 전까지 사용하는 자리표시 이미지 호스트.
      { protocol: "https", hostname: "picsum.photos" },
      // 공연 포스터(KOPIS). 백엔드가 http URL로 내려준다.
      { protocol: "http", hostname: "www.kopis.or.kr" },
      // 백엔드 시드 데이터의 [테스트] 공연 포스터. 실제로 열리지는 않는다.
      { protocol: "http", hostname: "example.com" },
    ],
  },
};

export default nextConfig;
