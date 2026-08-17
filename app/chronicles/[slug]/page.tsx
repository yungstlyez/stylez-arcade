import { ChronicleTracker } from "@/components/player/Trackers";
import { GameWindow } from "@/components/game-ui/GameWindow";
import { ReturnLink } from "@/components/game-ui/ReturnLink";
import { RelatedList } from "@/components/world/RelatedList";
import { formatDate } from "@/lib/cn";
import {
  getChronicle,
  getChronicles,
  resolveCharacters,
  resolveLocations,
  releaseLinkItems,
} from "@/lib/content";
import { padChronicle } from "@/lib/player-state";
import type { SlugParams } from "@/types/pages";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return getChronicles().map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: SlugParams): Promise<Metadata> {
  const { slug } = await params;
  const entry = getChronicle(slug);
  return {
    title: entry ? `CHRONICLE ${padChronicle(entry.number)}` : "FILE MISSING",
    description: entry?.excerpt,
  };
}

export default async function ChroniclePage({ params }: SlugParams) {
  const { slug } = await params;
  const entry = getChronicle(slug);
  if (!entry) notFound();

  return (
    <article>
      <ChronicleTracker slug={entry.slug} />
      <ReturnLink href="/chronicles" />
      <p className="font-hud text-[10px] tracking-[0.28em] text-gold">
        CHRONICLE {padChronicle(entry.number)}
      </p>
      <p className="mt-2 font-hud text-[10px] tracking-[0.18em] text-muted">{formatDate(entry.date)}</p>
      <h1 className="mt-3 font-display text-2xl uppercase leading-snug sm:text-3xl">{entry.title}</h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">{entry.excerpt}</p>
      <div className="mt-8 max-w-2xl space-y-5 text-base leading-8 text-cream/90">
        {entry.content.split("\n\n").map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </div>
      {entry.media.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {entry.media.map((media) => (
            <figure key={media.src} className="game-panel overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={media.src} alt={media.alt} className="w-full object-cover" />
              {media.caption ? (
                <figcaption className="px-3 py-2 font-hud text-[10px] tracking-[0.14em] text-muted">
                  {media.caption}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      ) : null}
      <div className="mt-8 grid gap-4">
        <RelatedList
          title="RELATED SONGS"
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
      <GameWindow title="END OF FILE" eyebrow="LOG" className="mt-8">
        <p className="text-sm text-muted">The story is still being written.</p>
      </GameWindow>
    </article>
  );
}
