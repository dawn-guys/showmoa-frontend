import { Header } from "@/app/_components/header";
import { WishlistView } from "./_components/wishlist-view";

export default function WishlistPage() {
  return (
    <>
      <Header />
      <main className="pb-safe-nav">
        <WishlistView />
      </main>
    </>
  );
}
