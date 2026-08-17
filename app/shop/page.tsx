import { ComingSoonScreen } from "@/components/game-ui/ComingSoonScreen";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "SHOP" };

export default function ShopPage() {
  return (
    <ComingSoonScreen
      title="SHOP"
      blurb="Merch, physical releases, and collectibles will live here. The counter is still closed."
    />
  );
}
