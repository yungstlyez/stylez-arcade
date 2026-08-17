import { ReturnLink } from "@/components/game-ui/ReturnLink";
import { RelatedList } from "@/components/world/RelatedList";
import { StageArt } from "@/components/game-ui/StageArt";
import {
  getLore,
  getLoreEntry,
  resolveCharacters,
  resolveLocations,
  releaseLinkItems,
} from "@/lib/content";
import type { SlugParams } from "@/types/pages";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return getLore().map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: SlugParams): Promise<Metadata> {
  const { slug } = await params;
  const entry = getLoreEntry(slug);
  return { title: entry?.title ?? "UNKNOWN LORE" };
}

export default async function LoreEntryPage({ params }: SlugParams) {
  const { slug } = await params;
  const entry = getLoreEntry(slug);
  if (!entry) notFound();

  return (
    <article>
      <ReturnLink href="/world/lore" />
      <p className="hud-label text-lime">LORE FILE</p>
      <h1 className="mt-2 font-display text-2xl uppercase leading-snug sm:text-3xl">{entry.title}</h1>
      <div className="relative mt-6 h-48 overflow-hidden border border-cyan/25 sm:h-64">
        <StageArt seed={entry.id} />
        <div className="absolute inset-0 bg-gradient-to-t from-void/50 to-transparent" />
      </div>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">{entry.excerpt}</p>
      <p className="mt-6 max-w-2xl text-base leading-8 text-cream/90">{entry.content}</p>
      <div className="mt-8 grid gap-4">
        <RelatedList
          title="SONGS"
          items={releaseLinkItems(entry.relatedSongs)}
        />
        <RelatedList
          title="CHARACTERS"
          items={resolveCharacters(entry.relatedCharacters).map((item) => ({
            href: `/world/characters/${item.slug}`,
            label: item.name,
          }))}
        />
        <RelatedList
          title="LOCATIONS"
          items={resolveLocations(entry.relatedLocations).map((item) => ({
            href: `/world/locations/${item.slug}`,
            label: item.name,
          }))}
        />
      </div>
    </article>
  );
}
