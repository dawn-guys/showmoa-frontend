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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={pretendard.variable}>
      {/* black gutter behind the app column so #121212 stands out above 480px */}
      <body className="bg-black font-sans text-foreground antialiased">
        {/* fixed descendants (bottom nav, toasts) rely on this element having no transform */}
        <div className="mx-auto min-h-dvh w-full max-w-app min-w-[320px] bg-background">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
