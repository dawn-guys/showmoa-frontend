import { Header } from "@/app/_components/header";

// PLACEHOLDER: screen not implemented. See docs/spec/detail.md
export default async function DetailPage({
  params,
}: PageProps<"/detail/[id]">) {
  const { id } = await params;

  return (
    <>
      <Header />
      {/* 상세 페이지는 하단 나브가 없으므로 pb-safe-nav 대신 pb-safe를 쓴다 */}
      <main className="pb-safe">
        <h1>Detail {id}</h1>
      </main>
    </>
  );
}
