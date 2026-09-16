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
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // required for env(safe-area-inset-*)
  themeColor: "#ffffff",
  interactiveWidget: "resizes-content", // Android Chrome: shrink layout when keyboard opens
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="bg-neutral-100 font-sans text-foreground antialiased">
        {/* fixed descendants (bottom nav, toasts) rely on this element having no transform */}
        <div className="mx-auto min-h-dvh w-full max-w-app min-w-[320px] bg-background">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
