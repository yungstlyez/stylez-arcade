import { ReturnLink } from "@/components/game-ui/ReturnLink";
import { RelatedList } from "@/components/world/RelatedList";
import {
  getItem,
  getItems,
  resolveCharacters,
  resolveLocations,
  releaseLinkItems,
} from "@/lib/content";
import type { SlugParams } from "@/types/pages";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return getItems().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: SlugParams): Promise<Metadata> {
  const { slug } = await params;
  const item = getItem(slug);
  return { title: item?.name ?? "UNKNOWN ITEM" };
}

export default async function ItemPage({ params }: SlugParams) {
  const { slug } = await params;
  const item = getItem(slug);
  if (!item) notFound();

  return (
    <article>
      <ReturnLink href="/world/items" />
      <div className="grid gap-6 md:grid-cols-[16rem_1fr]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.image} alt={`${item.name} art`} className="pixelated border border-cyan/30 object-cover" />
        <div>
          <p className="font-hud text-[10px] tracking-[0.22em] text-gold">{item.rarity.toUpperCase()}</p>
          <h1 className="mt-2 font-display text-4xl uppercase">{item.name}</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted">{item.description}</p>
          <div className="mt-6 grid gap-4">
            <RelatedList
              title="SONGS"
              items={releaseLinkItems(item.relatedSongs)}
            />
            <RelatedList
              title="LOCATIONS"
              items={resolveLocations(item.relatedLocations).map((entry) => ({
                href: `/world/locations/${entry.slug}`,
                label: entry.name,
              }))}
            />
            <RelatedList
              title="CHARACTERS"
              items={resolveCharacters(item.relatedCharacters).map((entry) => ({
                href: `/world/characters/${entry.slug}`,
                label: entry.name,
              }))}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
