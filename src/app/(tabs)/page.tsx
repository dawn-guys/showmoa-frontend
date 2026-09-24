import { Header } from "@/app/_components/header";
import { SiteFooter } from "@/app/_components/site-footer";
import { HomeSections } from "./_components/home-sections";
import { HomeSplash } from "./_components/home-splash";

// See docs/spec/home.md
export default function HomePage() {
  return (
    <>
      {/* 앱 첫 진입 스플래시(24시간 1회). 끝나면 페이드아웃하며 홈을 노출한다. */}
      <HomeSplash />
      <Header />
      <main>
        <h1 className="sr-only">쇼모아 홈</h1>
        <HomeSections />
      </main>
      {/* 푸터는 나브 높이만큼 하단 여백을 직접 가지므로 main의 pb-safe-nav는 제거했다 */}
      <SiteFooter />
    </>
  );
}
