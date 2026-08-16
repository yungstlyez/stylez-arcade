import { SectionTitle } from "@/components/game-ui/SectionTitle";
import { StageArt } from "@/components/game-ui/StageArt";
import { STAGE_THRONE } from "@/lib/placeholders";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "SHOP" };

export default function ShopPage() {
  return (
    <div>
      <SectionTitle
        kicker="LOCKED"
        title="SHOP"
        subtitle="Merch, physical releases, and collectibles will live here. The cabinet is dark on purpose."
      />
      <div className="hud-panel relative flex min-h-72 items-center justify-center overflow-hidden p-8 text-center">
        <StageArt src={STAGE_THRONE} className="absolute inset-0" />
        <div className="absolute inset-0 bg-void/70" />
        <div className="relative">
          <p className="hud-label text-lime">LOCKED</p>
          <p className="mt-4 max-w-md text-sm leading-7 text-muted">
            The counter is closed. When it opens it will feel like a booth, not a storefront.
          </p>
        </div>
      </div>
    </div>
  );
}
