import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // MOCK: 실제 포스터 에셋 연동 전까지 사용하는 자리표시 이미지 호스트.
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }],
  },
};

export default nextConfig;
