import { Header } from "@/app/_components/header";
import { HomeSections } from "./_components/home-sections";

// See docs/spec/home.md
export default function HomePage() {
  return (
    <>
      {/* TODO: 홈-비로그인 스플래시 애니메이션(하루 1회) — 별도 작업에서 구현 */}
      <Header />
      <main className="pb-safe-nav">
        <h1 className="sr-only">쇼모아 홈</h1>
        <HomeSections />
        {/* TODO: 공통 UI 푸터(docs/spec/common-ui.md 「푸터」) — 별도 작업에서 구현 */}
      </main>
    </>
  );
}
