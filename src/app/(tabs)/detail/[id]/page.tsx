import { Header } from "@/app/_components/header";
import { DetailScreen } from "@/app/(tabs)/detail/[id]/_components/detail-screen";

export default async function DetailPage({
  params,
}: PageProps<"/detail/[id]">) {
  const { id } = await params;

  return (
    <>
      <Header />
      <DetailScreen id={id} />
    </>
  );
}
