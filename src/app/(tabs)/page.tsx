import { Header } from "@/app/_components/header";
import { SiteFooter } from "@/shared/components/site-footer";
import { HomeSections } from "./_components/home-sections";

// See docs/spec/home.md
export default function HomePage() {
  return (
    <>
      {/* TODO: 홈-비로그인 스플래시 애니메이션(하루 1회) — 별도 작업에서 구현 */}
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
