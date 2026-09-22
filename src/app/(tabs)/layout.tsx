import Script from "next/script";
import { BottomNav } from "@/app/_components/bottom-nav";
import {
  buildMapScriptUrl,
  NAVER_MAP_CLIENT_ID,
} from "@/app/(tabs)/map/_lib/naver-map";

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      {/* 하단 나브는 (tabs) 셸에서 한 번만 마운트한다. transform이 걸린
          래퍼 밖에 두어 position:fixed가 뷰포트에 고정되게 한다. */}
      <BottomNav />

      {/* 네이버 지도 SDK는 탭 셸에서 한 번만 로드해 탭 전환에도 살려 둔다.
          MapView마다 로드하면 /map 재진입 시 인증이 재요청되며 400이 난다. */}
      {NAVER_MAP_CLIENT_ID && (
        <Script
          id="naver-maps-sdk"
          src={buildMapScriptUrl(NAVER_MAP_CLIENT_ID)}
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
