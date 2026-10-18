"use client";

import { PixelButton } from "@/components/game-ui/PixelButton";
import { Waveform } from "@/components/hub/Waveform";
import { RightRail } from "@/components/hub/RightRail";
import { ListenLink } from "@/components/music/ListenLink";
import { MusicLibrary } from "@/components/music/MusicLibrary";
import { FeaturedSoundCloudSlot } from "@/components/music/FeaturedSoundCloud";
import { SpotifyEmbed } from "@/components/music/SpotifyEmbed";
import { BodegaRun } from "@/components/play/BodegaRun";
import { site } from "@/data/site";
import { formatDate, formatTime } from "@/lib/cn";
import { padChronicle } from "@/lib/player-state";
import { cueUiSound } from "@/lib/ui-sound";
import {
  getFeaturedRelease,
  getLatestSpotifyRelease,
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
  const featuredListen = listenHref(featured);
  const soundcloudUrl = site.soundcloud;
  const latestSpotify = getLatestSpotifyRelease();
  const spotifyUrl = latestSpotify?.streamingLinks.spotify;
  const spotifyTrack = latestSpotify ? releaseToTrack(latestSpotify) : null;
  const [spotifyReady, setSpotifyReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setSpotifyReady(true), 400);
    return () => window.clearTimeout(id);
  }, []);

  const playSpotify = () => {
    if (!spotifyUrl) return;
    cueUiSound("press");
    // Spotify stays independent — only open the track; embed handles its own transport.
    window.open(spotifyUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="hub-root mx-auto h-full max-w-[1920px]">
      {latestSpotify && spotifyUrl ? (
        <section className="hub-spotify spotify-stage hud-panel-green relative flex min-h-[22rem] flex-col overflow-hidden lg:min-h-0">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-lime/35 bg-void/80 px-3 py-2.5 sm:px-4">
            <div>
              <p className="hud-label text-lime glow-green">NOW PLAYING · SPOTIFY</p>
              <p className="mt-1 font-display text-sm uppercase leading-snug text-mist sm:text-base">
                {latestSpotify.title}
              </p>
            </div>
            <button
              type="button"
              onClick={playSpotify}
              className="hud-press glass-btn inline-flex min-h-10 items-center border-lime/70 bg-green/20 px-5 font-display text-[11px] font-semibold tracking-[0.16em] text-lime shadow-[0_0_22px_rgba(98,255,91,0.3)] hover:border-lime"
            >
              PLAY
            </button>
          </div>
          <div className="relative min-h-[16rem] w-full flex-1 lg:min-h-0">
            {spotifyReady ? (
              <SpotifyEmbed
                url={spotifyUrl}
                title={latestSpotify.title}
                track={spotifyTrack ?? undefined}
                className="absolute inset-0 size-full"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-void">
                <p className="hud-label animate-pulse text-lime">LOADING SIGNAL…</p>
              </div>
            )}
          </div>
        </section>
      ) : null}

      {soundcloudUrl ? (
        <section className="hub-soundcloud hud-panel relative flex min-h-[12rem] flex-col overflow-hidden lg:min-h-0">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-cyan/25 bg-void/85 px-3 py-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="hud-label text-cyan">SOUNDCLOUD</p>
              <span className="font-hud text-[10px] tracking-[0.16em] text-muted">{site.artist.toUpperCase()}</span>
            </div>
            <a
              href={soundcloudUrl}
              target="_blank"
              rel="noreferrer"
              className="hud-press glass-btn inline-flex min-h-9 items-center border-cyan/45 px-4 font-display text-[11px] font-semibold tracking-[0.16em] text-cyan hover:border-cyan"
            >
              OPEN PAGE
            </a>
          </div>
          <div className="relative h-[166px] w-full shrink-0 bg-void lg:h-auto lg:min-h-0 lg:flex-1">
            <FeaturedSoundCloudSlot className="size-full" />
          </div>
        </section>
      ) : !latestSpotify ? (
        <section className="hub-spotify hud-panel-green relative min-h-[18rem] overflow-hidden">
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
      ) : null}

      <div className="hub-mid">
        <article className="hud-panel relative flex min-h-[11rem] flex-col overflow-hidden lg:min-h-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/art/banners/chronicle-stylez.jpg"
            alt={site.artist}
            className="absolute inset-0 h-full w-full object-cover object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-void via-void/75 to-void/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-void/80 via-transparent to-void/30" />
          <div className="relative z-[1] flex min-h-0 flex-1 flex-col justify-end overflow-auto p-4 sm:p-5">
            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="font-display text-sm uppercase text-mist sm:text-base">{site.artist}</span>
              <span className="font-hud text-[11px] tracking-[0.16em] text-cyan sm:text-xs">{site.instagram}</span>
            </p>
            <p className="mt-1 font-hud text-[11px] tracking-[0.12em] text-lime sm:text-xs">
              CHRONICLE {padChronicle(chronicle.number)} · {formatDate(chronicle.date)}
            </p>
            <p className="mt-3 max-w-[18rem] whitespace-pre-wrap text-sm leading-6 text-mist sm:max-w-[20rem] sm:text-base sm:leading-7">
              {chronicle.content.trim() || chronicle.excerpt}
            </p>
          </div>
        </article>

        <section className="hud-panel-green relative flex min-h-[14rem] flex-col overflow-hidden p-2 sm:min-h-0">
          <div className="mb-1.5 flex shrink-0 items-center justify-between gap-2 px-1">
            <p className="hud-label text-lime">BODEGA RUN</p>
            <Link
              href="/play/bodega-run"
              className="font-hud text-[9px] tracking-[0.14em] text-cyan hover:text-lime"
            >
              FULL CABINET
            </Link>
          </div>
          <div className="min-h-0 flex-1">
            <BodegaRun compact />
          </div>
        </section>

        <section className="hub-youtube hud-panel-pink relative flex min-h-[14rem] flex-col overflow-hidden p-2 lg:min-h-0">
          <div className="mb-1.5 flex shrink-0 items-center justify-between gap-2 px-1">
            <p className="hud-label text-pink">YOUTUBE</p>
            <a
              href={`https://youtu.be/${site.latestYouTubeVideoId}`}
              target="_blank"
              rel="noreferrer"
              className="font-hud text-[9px] tracking-[0.14em] text-cyan hover:text-pink"
            >
              OPEN
            </a>
          </div>
          <div className="relative aspect-video w-full min-h-[10rem] flex-1 overflow-hidden rounded-xl bg-black lg:min-h-[12rem]">
            <iframe
              title="Callmestylez - !!gl0ckiana** [Official Music Video]"
              src={`https://www.youtube-nocookie.com/embed/${site.latestYouTubeVideoId}?rel=0&modestbranding=1`}
              className="absolute inset-0 h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </section>
      </div>

      <div className="hub-bot">
        <section className="hud-panel relative min-h-[10rem] overflow-hidden lg:min-h-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/art/banners/arcade-mic-stylez.jpg"
            alt={`${site.artist} on the mic`}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void/40 via-transparent to-void/20" />
        </section>

        <MusicLibrary releases={getReleases()} />
      </div>

      <div className="hub-rail hidden min-h-0 lg:block">
        <RightRail />
      </div>
    </div>
  );
}
