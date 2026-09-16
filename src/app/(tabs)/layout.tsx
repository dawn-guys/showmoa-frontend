export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      {/* BottomNav mounts here. Keep it outside any transformed wrapper. */}
    </>
  );
}
