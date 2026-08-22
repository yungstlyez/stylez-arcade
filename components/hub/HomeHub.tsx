"use client";

import { PixelButton } from "@/components/game-ui/PixelButton";
import { Waveform } from "@/components/hub/Waveform";
import { RightRail } from "@/components/hub/RightRail";
import { ListenLink } from "@/components/music/ListenLink";
import { MusicLibrary } from "@/components/music/MusicLibrary";
import { FeaturedSoundCloudSlot } from "@/components/music/FeaturedSoundCloud";
import { SoundCloudOnlyTag } from "@/components/music/SoundCloudOnlyTag";
import { SpotifyEmbed } from "@/components/music/SpotifyEmbed";
import { currentMission } from "@/data/transmissions";
import { site } from "@/data/site";
import { formatDate, formatTime } from "@/lib/cn";
import { padChronicle } from "@/lib/player-state";
import { cueUiSound } from "@/lib/ui-sound";
import {
  getFeaturedRelease,
  getGame,
  getGames,
  getLatestSpotifyRelease,
  getLocation,
  getReleases,
  listenHref,
  releaseToTrack,
} from "@/lib/content";
import { CITY_SCENE } from "@/lib/placeholders";
import { useChronicles } from "@/components/chronicles/ChronicleProvider";
import Link from "next/link";
import { useEffect, useState } from "react";

export function HomeHub() {
  const { latest: chronicle } = useChronicles();
  const featured = getFeaturedRelease();
  const game = getGame(site.featuredGameSlug);
  const mystery = getGames().find((item) => item.slug === "unknown-cabinet");
  const southside = getLocation(site.featuredLocationSlug);
  const featuredListen = listenHref(featured);
  const soundcloudUrl = featured.soundcloudOnly ? featured.streamingLinks.soundcloud : undefined;
  const latestSpotify = getLatestSpotifyRelease();
  const spotifyUrl = latestSpotify?.streamingLinks.spotify;
  const [spotifyReady, setSpotifyReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setSpotifyReady(true), 700);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="hub-root mx-auto h-full max-w-[1920px]">
      {soundcloudUrl ? (
        <section className="hub-hero hud-panel-green relative flex h-full min-h-0 flex-col overflow-hidden lg:min-h-[18rem]">
          <div className="relative aspect-square w-full lg:aspect-auto lg:min-h-0 lg:flex-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={featured.cover}
              alt={`${featured.title} cover art`}
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-[166px] bg-void/70">
              <FeaturedSoundCloudSlot className="size-full" />
            </div>
          </div>
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-lime/25 bg-void/85 px-3 py-2">
            <SoundCloudOnlyTag />
            <Link
              href={`/music/${featured.slug}`}
              className="hud-press inline-flex min-h-9 items-center border border-cyan/50 px-3 font-display text-[11px] font-semibold tracking-[0.16em] text-cyan hover:border-cyan"
            >
              OPEN FILE
            </Link>
          </div>
        </section>
      ) : (
      <section className="hub-hero hud-panel-green relative min-h-[18rem] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={CITY_SCENE}
          alt="Southside Queens at night"
          className="pixelated absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-void via-void/88 to-void/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-void/70 via-transparent to-void/20" />
        <div className="relative grid h-full min-h-0 grid-cols-1 items-stretch gap-4 p-4 md:grid-cols-[minmax(9.5rem,18vw)_minmax(0,1fr)] lg:p-5">
          <ListenLink
            release={featured}
            className="cover-frame mx-auto aspect-square w-full max-w-[220px] md:mx-0 md:max-h-full md:max-w-none"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={featured.cover}
              alt={`${featured.title} cover art`}
              className="h-full w-full object-cover"
            />
          </ListenLink>
          <div className="flex min-h-0 flex-col justify-center">
            <p className="hud-label text-lime">NOW PLAYING</p>
            <p className="mt-2 flex flex-wrap items-center gap-2 font-hud text-[11px] tracking-[0.18em] text-cyan">
              TRACK 001
              <i className="pulse-dot size-2 bg-lime" />
              {featured.soundcloudOnly ? <SoundCloudOnlyTag /> : null}
            </p>
            <h1 className="mt-1 font-display text-xl uppercase leading-snug text-mist sm:text-2xl">
              <ListenLink release={featured}>{featured.title}</ListenLink>
            </h1>
            <p className="mt-2 font-hud text-[11px] tracking-[0.12em] text-muted">
              {featured.type} • {featured.year} • {featured.era}
            </p>
            <div className="mt-3 max-w-xl">
              <Waveform active={false} />
            </div>
            <p className="mt-2 font-hud text-[11px] text-cyan">
              {formatTime(0)} / —:—
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {featuredListen ? <PixelButton href={featuredListen}>PLAY</PixelButton> : null}
              {featured.streamingLinks.spotify ? (
                <StreamChip href={featured.streamingLinks.spotify}>Spotify</StreamChip>
              ) : null}
              {featured.streamingLinks.appleMusic ? (
                <StreamChip href={featured.streamingLinks.appleMusic}>Apple</StreamChip>
              ) : null}
              {featured.streamingLinks.youtube ? (
                <StreamChip href={featured.streamingLinks.youtube}>YouTube</StreamChip>
              ) : null}
              {featured.streamingLinks.soundcloud ? (
                <StreamChip href={featured.streamingLinks.soundcloud}>SoundCloud</StreamChip>
              ) : null}
              <Link
                href={`/music/${featured.slug}`}
                className="hud-press inline-flex min-h-10 items-center border border-cyan/50 px-4 font-display text-[11px] font-semibold tracking-[0.16em] text-cyan hover:border-cyan"
              >
                OPEN FILE
              </Link>
            </div>
          </div>
        </div>
      </section>
      )}

      {latestSpotify && spotifyUrl ? (
        <section className="hub-spotify hud-panel-green relative flex h-full min-h-0 flex-col overflow-hidden lg:min-h-[18rem]">
          <div className="relative aspect-square w-full lg:aspect-auto lg:min-h-0 lg:flex-1">
            {spotifyReady ? (
              <SpotifyEmbed
                url={spotifyUrl}
                title={latestSpotify.title}
                track={releaseToTrack(latestSpotify)}
                className="absolute inset-0 size-full"
              />
            ) : (
              <div className="absolute inset-0 bg-void" />
            )}
          </div>
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-lime/25 bg-void/85 px-3 py-2">
            <p className="hud-label text-lime">SPOTIFY</p>
            <Link
              href={`/music/${latestSpotify.slug}`}
              className="hud-press inline-flex min-h-9 items-center border border-cyan/50 px-3 font-display text-[11px] font-semibold tracking-[0.16em] text-cyan hover:border-cyan"
            >
              OPEN FILE
            </Link>
          </div>
        </section>
      ) : null}

      <div className="hub-mid">
        <article className="hud-panel flex min-h-[11rem] flex-col overflow-hidden lg:min-h-0">
          <div className="flex min-h-0 flex-1 items-start gap-4 overflow-auto p-4 sm:p-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={site.portrait}
              alt={site.artist}
              className="pixelated size-14 shrink-0 object-cover sm:size-16"
            />
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="font-display text-sm uppercase text-mist sm:text-base">{site.artist}</span>
                <span className="font-hud text-[11px] tracking-[0.16em] text-cyan sm:text-xs">{site.instagram}</span>
              </p>
              <p className="mt-1 font-hud text-[11px] tracking-[0.12em] text-lime sm:text-xs">
                CHRONICLE {padChronicle(chronicle.number)} · {formatDate(chronicle.date)}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-mist sm:text-lg sm:leading-8">
                {chronicle.content.trim() || chronicle.excerpt}
              </p>
            </div>
          </div>
        </article>

        <article className="hud-panel-green hud-grid hud-scan relative flex min-h-0 flex-col items-center justify-center p-4 text-center">
          <p className="hud-label text-lime">MISSION 001</p>
          <h2 className="mt-2 font-display text-sm uppercase leading-snug text-mist">
            {currentMission.title}
          </h2>
          <p className="mt-2 text-sm text-muted">{currentMission.brief}</p>
          <p className="mt-3 font-hud text-sm text-lime">0 / 1</p>
          <div className="hp-track mt-2 w-full max-w-[12rem]">
            <div className="hp-fill w-0" />
          </div>
          <Link
            href={currentMission.href}
            className="mt-4 inline-flex min-h-10 items-center border border-lime/70 px-4 font-display text-[11px] font-semibold tracking-[0.16em] text-lime"
          >
            VIEW MISSION
          </Link>
        </article>

        <Link
          href="/world"
          className="hud-panel-pink hud-lift relative min-h-[12rem] overflow-hidden"
          onMouseEnter={() => cueUiSound("hover")}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={CITY_SCENE}
            alt="Enter Southside, Queens"
            className="pixelated absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/35 to-transparent" />
          <div className="relative flex h-full min-h-[12rem] flex-col justify-end p-4">
            <p className="hud-label text-pink">ENTER THE WORLD</p>
            <h2 className="mt-1 font-display text-sm uppercase leading-snug text-mist">
              {southside?.name ?? "SOUTHSIDE"}
            </h2>
            <p className="font-hud text-[11px] text-magenta">Queens, NY</p>
            <p className="mt-3 inline-flex w-fit border border-pink/70 px-3 py-1 font-display text-[11px] tracking-[0.18em] text-pink">
              ENTER
            </p>
          </div>
        </Link>
      </div>

      <div className="hub-bot">
        <section className="hud-panel flex min-h-0 flex-col overflow-hidden p-3">
          <p className="hud-label text-cyan">STYLEZ ARCADE</p>
          <div className="mt-3 grid min-h-0 flex-1 grid-cols-2 gap-3">
            {game ? (
              <Link href={`/play/${game.slug}`} className="hud-lift group relative overflow-hidden border border-cyan/25">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={CITY_SCENE}
                  alt="FLATBED RUN"
                  className="pixelated absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void via-void/20 to-transparent" />
                <div className="relative flex h-full min-h-[8.5rem] flex-col justify-end p-2">
                  <p className="font-display text-sm uppercase text-mist">{game.name}</p>
                  <p className="hud-label text-violet">LOCKED</p>
                </div>
              </Link>
            ) : null}
            {mystery ? (
              <Link
                href={`/play/${mystery.slug}`}
                className="hud-lift relative overflow-hidden border border-magenta/30"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/art/placeholders/stage-throne.gif"
                  alt="Coming soon"
                  className="pixelated absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-void/25" />
                <div className="relative flex h-full min-h-[8.5rem] flex-col items-center justify-end p-2 text-center">
                  <p className="hud-label text-pink">COMING SOON</p>
                  <p className="font-pixel text-lg text-magenta">???</p>
                </div>
              </Link>
            ) : null}
          </div>
        </section>

        <MusicLibrary releases={getReleases()} />
      </div>

      <div className="hub-rail hidden min-h-0 lg:block">
        <RightRail />
      </div>
    </div>
  );
}

function StreamChip({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="hud-press inline-flex min-h-10 items-center border border-cyan/35 px-3 font-display text-[11px] tracking-[0.12em] text-cyan hover:border-cyan"
    >
      {children}
    </a>
  );
}
