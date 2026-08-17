import { ReturnLink } from "@/components/game-ui/ReturnLink";
import { GameWindow } from "@/components/game-ui/GameWindow";
import { RelatedList } from "@/components/world/RelatedList";
import {
  getCharacter,
  getCharacters,
  resolveLocations,
  releaseLinkItems,
} from "@/lib/content";
import type { SlugParams } from "@/types/pages";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return getCharacters().map((character) => ({ slug: character.slug }));
}

export async function generateMetadata({
  params,
}: SlugParams): Promise<Metadata> {
  const { slug } = await params;
  const character = getCharacter(slug);
  return { title: character?.name ?? "UNKNOWN" };
}

export default async function CharacterPage({ params }: SlugParams) {
  const { slug } = await params;
  const character = getCharacter(slug);
  if (!character) notFound();

  return (
    <article>
      <ReturnLink href="/world/characters" />
      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={character.portrait}
            alt={`${character.name} portrait`}
            className="pixelated w-full border-2 border-line object-cover"
          />
          <p className="mt-3 border-2 border-white bg-blue px-3 py-2 text-center font-hud text-base tracking-wide text-green">
            {character.status === "locked" ? "LOCKED" : character.role.toUpperCase()}
          </p>
        </div>
        <div className="space-y-5">
          <header>
            <p className="font-hud text-[10px] tracking-[0.22em] text-muted">{character.alias}</p>
            <h1 className="mt-2 font-display text-2xl uppercase leading-snug sm:text-3xl">{character.name}</h1>
            <p className="mt-2 font-hud text-[10px] tracking-[0.16em] text-gold">
              FIRST APPEARANCE · {character.firstAppearance}
            </p>
          </header>
          <p className="max-w-2xl text-sm leading-7 text-cream/90">{character.bio}</p>
          {character.stats ? (
            <GameWindow title="STATS" eyebrow="OPTIONAL">
              <ul className="space-y-3">
                {character.stats.map((stat) => (
                  <li key={stat.label}>
                    <div className="mb-1 flex justify-between font-hud text-base tracking-wide">
                      <span>{stat.label}</span>
                      <span className="text-green">{stat.value}</span>
                    </div>
                    <div className="hp-track">
                      <div className="hp-fill" style={{ width: `${stat.value}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </GameWindow>
          ) : null}
          <RelatedList
            title="RELATED SONGS"
            items={releaseLinkItems(character.songs)}
          />
          <RelatedList
            title="LOCATIONS"
            items={resolveLocations(character.locations).map((item) => ({
              href: `/world/locations/${item.slug}`,
              label: item.name,
            }))}
          />
        </div>
      </div>
    </article>
  );
}
