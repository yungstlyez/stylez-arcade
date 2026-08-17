import { PlayReleaseButton } from "@/components/music/PlayReleaseButton";
import { ListenLink } from "@/components/music/ListenLink";
import { SoundCloudEmbed } from "@/components/music/SoundCloudEmbed";
import { SoundCloudOnlyTag } from "@/components/music/SoundCloudOnlyTag";
import { GameWindow } from "@/components/game-ui/GameWindow";
import { ReturnLink } from "@/components/game-ui/ReturnLink";
import { RelatedList } from "@/components/world/RelatedList";
import { getRelease, getReleases, resolveCharacters, resolveChronicles, resolveLocations } from "@/lib/content";
import type { SlugParams } from "@/types/pages";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return getReleases().map((release) => ({ slug: release.slug }));
}

export async function generateMetadata({
  params,
}: SlugParams): Promise<Metadata> {
  const { slug } = await params;
  const release = getRelease(slug);
  return {
    title: release?.title ?? "FILE MISSING",
    description: release?.description,
  };
}

export default async function ReleasePage({ params }: SlugParams) {
  const { slug } = await params;
  const release = getRelease(slug);
  if (!release) notFound();

  const relatedCharacters = resolveCharacters(release.characters);
  const relatedLocations = resolveLocations(release.locations);
  const relatedChronicles = resolveChronicles(release.chronicles);

  return (
    <article>
      <ReturnLink href="/music" />
      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <div>
          <div className="cover-frame">
            <ListenLink release={release} className="block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={release.cover}
                alt={`${release.title} cover art`}
                className="aspect-square w-full object-cover"
              />
            </ListenLink>
            {release.soundcloudOnly ? (
              <SoundCloudOnlyTag className="absolute left-2 top-2 z-10" />
            ) : null}
          </div>
          {release.soundcloudOnly && release.streamingLinks.soundcloud ? (
            <div className="cover-frame mt-4 aspect-square overflow-hidden">
              <SoundCloudEmbed
                url={release.streamingLinks.soundcloud}
                title={release.title}
                className="size-full"
              />
            </div>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <PlayReleaseButton release={release} />
            {Object.entries(release.streamingLinks).map(([key, href]) =>
              href ? (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center border border-line px-3 font-hud text-[10px] tracking-[0.16em] text-muted hover:text-gold"
                >
                  {key.replace("appleMusic", "apple").toUpperCase()}
                </a>
              ) : null,
            )}
          </div>
        </div>
        <div className="space-y-5">
          <header>
            <p className="font-hud text-[10px] tracking-[0.22em] text-gold">
              {release.type} · {release.year} · {release.era}
              {release.rarity ? ` · ${release.rarity}` : ""}
            </p>
            <h1 className="mt-2 font-display text-4xl uppercase leading-none sm:text-5xl">
              <ListenLink release={release}>{release.title}</ListenLink>
            </h1>
            {release.subtitle ? <p className="mt-2 text-muted">{release.subtitle}</p> : null}
            {release.soundcloudOnly ? <SoundCloudOnlyTag className="mt-3" /> : null}
          </header>
          <p className="max-w-2xl text-sm leading-7 text-cream/90">{release.description}</p>
          {release.story ? (
            <GameWindow title="BACKGROUND" eyebrow="STORY FILE">
              <p className="text-sm leading-7 text-muted">{release.story}</p>
            </GameWindow>
          ) : null}
          {release.lyrics ? (
            <GameWindow title="LYRICS" eyebrow="TEXT FILE">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-cream/90">
                {release.lyrics}
              </pre>
            </GameWindow>
          ) : null}
          <GameWindow title="CREDITS" eyebrow="STAFF">
            <ul className="space-y-1 font-hud text-xs tracking-[0.12em] text-muted">
              {release.credits.map((credit) => (
                <li key={`${credit.role}-${credit.name}`}>
                  {credit.role.toUpperCase()} — {credit.name}
                </li>
              ))}
            </ul>
          </GameWindow>
          {release.video ? (
            <GameWindow title="MUSIC VIDEO" eyebrow="BROADCAST">
              <a
                href={release.video.url}
                target="_blank"
                rel="noreferrer"
                className="font-hud text-xs tracking-[0.16em] text-gold"
              >
                {release.video.title} ↗
              </a>
            </GameWindow>
          ) : null}
          {release.alternateVersions?.length ? (
            <GameWindow title="ALTERNATE VERSIONS" eyebrow="VARIANTS">
              <ul className="space-y-3">
                {release.alternateVersions.map((version) => (
                  <li key={version.title}>
                    <p className="font-display text-lg uppercase">{version.title}</p>
                    <p className="text-sm text-muted">{version.note}</p>
                  </li>
                ))}
              </ul>
            </GameWindow>
          ) : null}
          {release.easterEggs?.length ? (
            <GameWindow title="EASTER EGGS" eyebrow="CLASSIFIED">
              <ul className="list-disc space-y-2 pl-4 text-sm text-muted">
                {release.easterEggs.map((egg) => (
                  <li key={egg}>{egg}</li>
                ))}
              </ul>
            </GameWindow>
          ) : null}
          <div className="grid gap-4">
            <RelatedList
              title="CHARACTERS"
              items={relatedCharacters.map((item) => ({
                href: `/world/characters/${item.slug}`,
                label: item.name,
              }))}
            />
            <RelatedList
              title="LOCATIONS"
              items={relatedLocations.map((item) => ({
                href: `/world/locations/${item.slug}`,
                label: item.name,
              }))}
            />
            <RelatedList
              title="CHRONICLES"
              items={relatedChronicles.map((item) => ({
                href: `/chronicles/${item.slug}`,
                label: item.title,
              }))}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
