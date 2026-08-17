import { ReturnLink } from "@/components/game-ui/ReturnLink";
import { SectionTitle } from "@/components/game-ui/SectionTitle";
import { StageArt } from "@/components/game-ui/StageArt";
import { getLore } from "@/lib/content";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "LORE" };

export default function LorePage() {
  return (
    <div>
      <ReturnLink href="/world" />
      <SectionTitle
        kicker="CODEX"
        title="LORE"
        subtitle="The sentences the world keeps repeating until they become architecture."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {getLore().map((entry) => (
          <Link key={entry.id} href={`/world/lore/${entry.slug}`} className="hud-panel hud-lift overflow-hidden">
            <div className="relative h-36 overflow-hidden">
              <StageArt seed={entry.id} />
              <div className="absolute inset-0 bg-gradient-to-t from-void via-void/15 to-transparent" />
            </div>
            <div className="p-5">
              <p className="hud-label text-lime">LORE FILE</p>
              <h2 className="mt-2 font-display text-sm uppercase leading-snug">{entry.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{entry.excerpt}</p>
              <p className="mt-4 font-display text-[11px] tracking-[0.18em] text-cyan">OPEN FILE</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
