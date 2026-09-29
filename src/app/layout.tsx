import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: "show moa",
  description: "전국 공연과 공연장을 한 곳에서",
  formatDetection: { telephone: false, email: false, address: false },
  // public/favicon.svg를 파비콘으로 연결한다.
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // required for env(safe-area-inset-*)
  themeColor: "#121212",
  interactiveWidget: "resizes-content", // Android Chrome: shrink layout when keyboard opens
};

// 스플래시를 이 탭 세션에서 이미 봤으면(sessionStorage) 페인트 전에 오버레이를
// 숨기는 스타일을 주입한다. 서버는 sessionStorage를 읽을 수 없어 오버레이를 항상
// SSR로 그리는데, 새로고침 시 그것이 잠깐 비쳤다 사라지는 깜빡임을 이 스크립트가
// 막는다. 플래그는 최초 재생 시 home-splash가 설정한다.
const splashSkipScript = `(function(){try{if(sessionStorage.getItem('showmoa:splash:seen')){var s=document.createElement('style');s.textContent='[data-splash-overlay]{display:none!important}';document.head.appendChild(s);}}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={pretendard.variable}>
      {/* black gutter behind the app column so #121212 stands out above 480px */}
      <body className="bg-black font-sans text-foreground antialiased">
        {/* 스플래시 pre-paint 스킵 스크립트: 앱 마크업보다 먼저 실행돼야 한다. */}
        <script dangerouslySetInnerHTML={{ __html: splashSkipScript }} />
        {/* fixed descendants (bottom nav, toasts) rely on this element having no transform */}
        <div className="mx-auto min-h-dvh w-full max-w-app min-w-[320px] bg-background">
          <Providers>{children}</Providers>
        </div>
        {/* Vercel Speed Insights. 대시보드 토글만으로는 데이터가 잡히지 않아
            이 컴포넌트가 필요하다. 프로덕션 배포에서만 동작한다. */}
        <SpeedInsights />
      </body>
    </html>
  );
}
