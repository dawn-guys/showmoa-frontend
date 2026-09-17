// PLACEHOLDER: screen not implemented. See docs/spec/detail.md
export default async function DetailPage({
  params,
}: PageProps<"/detail/[id]">) {
  const { id } = await params;

  return (
    <main className="pb-safe-nav">
      <h1>Detail {id}</h1>
    </main>
  );
}
