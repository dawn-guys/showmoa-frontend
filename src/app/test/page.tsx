import { BottomNav } from "@/app/_components/bottom-nav";
import { Header } from "@/app/_components/header";
import { LoadingSpinner } from "@/shared/components/loading-spinner";

// 헤더·하단 나브 확인용 임시 페이지. 확인 후 삭제한다.
export default function TestPage() {
  return (
    <>
      <Header />
      <main className="pb-safe-nav">
        <h1 className="p-4 text-h1">헤더 / 하단 나브 테스트</h1>
        <p className="px-4 text-muted-foreground">
          상단 헤더와 하단 나브가 정상적으로 보이는지 확인하세요.
        </p>
        <LoadingSpinner />
      </main>
      <BottomNav />
    </>
  );
}
