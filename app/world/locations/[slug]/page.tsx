import { ReturnLink } from "@/components/game-ui/ReturnLink";
import { GameWindow } from "@/components/game-ui/GameWindow";
import { LocationTracker } from "@/components/player/Trackers";
import { HiddenHotspot } from "@/components/world/HiddenHotspot";
import { RelatedList } from "@/components/world/RelatedList";
import {
  getLocation,
  getLocations,
  resolveCharacters,
  releaseLinkItems,
} from "@/lib/content";
import type { SlugParams } from "@/types/pages";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return getLocations().map((location) => ({ slug: location.slug }));
}

export async function generateMetadata({
  params,
}: SlugParams): Promise<Metadata> {
  const { slug } = await params;
  const location = getLocation(slug);
  return { title: location?.name ?? "UNKNOWN ZONE" };
}

export default async function LocationPage({ params }: SlugParams) {
  const { slug } = await params;
  const location = getLocation(slug);
  if (!location) notFound();

  return (
    <article>
      <LocationTracker slug={location.slug} />
      <ReturnLink href="/world/locations" />
      <p className="font-hud text-[10px] tracking-[0.28em] text-gold">WELCOME TO {location.name}.</p>
      <h1 className="mt-2 font-display text-2xl uppercase leading-snug sm:text-3xl">{location.name}</h1>
      <div className="relative mt-6 overflow-hidden border-2 border-line">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={location.image} alt={`${location.name} art`} className="w-full object-cover" />
        {location.slug === "southside" ? (
          <HiddenHotspot
            eggId="southside-glint"
            label="Inspect a glint on the block"
            className="absolute bottom-[22%] left-[58%] size-5 bg-gold/70 hover:bg-gold"
          />
        ) : null}
      </div>
      <p className="mt-6 max-w-2xl text-sm leading-7 text-cream/90">{location.description}</p>
      <GameWindow title="LORE" eyebrow="ZONE FILE" className="mt-6">
        <p className="text-sm leading-7 text-muted">{location.lore}</p>
      </GameWindow>
      <GameWindow title="APPEARANCES" eyebrow="SEEN IN" className="mt-4">
        <ul className="space-y-1 text-sm text-muted">
          {location.appearances.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </GameWindow>
      <div className="mt-6 grid gap-4">
        <RelatedList
          title="CHARACTERS SEEN HERE"
          items={resolveCharacters(location.characters).map((item) => ({
            href: `/world/characters/${item.slug}`,
            label: item.name,
          }))}
        />
        <RelatedList
          title="ASSOCIATED MUSIC"
          items={releaseLinkItems(location.songs)}
        />
      </div>
    </article>
  );
}
