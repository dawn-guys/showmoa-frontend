import { BottomNav } from "@/app/_components/bottom-nav";

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
    </>
  );
}
