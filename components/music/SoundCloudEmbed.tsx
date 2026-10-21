"use client";

import { useAudio, type ExternalPlayer } from "@/components/audio/AudioProvider";
import { cn } from "@/lib/cn";
import type { Track } from "@/types";
import { useEffect, useMemo, useRef } from "react";

type SoundCloudSound = {
  title?: string;
  artwork_url?: string;
  duration?: number;
  permalink_url?: string;
};

type SoundCloudWidget = {
  bind: (event: string, listener: (data?: { currentPosition?: number; loadedProgress?: number }) => void) => void;
  unbind: (event: string) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  skip: (index: number) => void;
  seekTo: (ms: number) => void;
  setVolume: (volume: number) => void;
  getDuration: (cb: (ms: number) => void) => void;
  getPosition: (cb: (ms: number) => void) => void;
  getCurrentSound: (cb: (sound: SoundCloudSound | null) => void) => void;
  getSounds: (cb: (sounds: SoundCloudSound[]) => void) => void;
};

type SoundCloudAPI = {
  Widget: {
    (el: HTMLIFrameElement): SoundCloudWidget;
    Events: {
      READY: string;
      PLAY: string;
      PAUSE: string;
      FINISH: string;
      PLAY_PROGRESS: string;
    };
  };
};

declare global {
  interface Window {
    SC?: SoundCloudAPI;
  }
}

export function soundCloudEmbedSrc(permalink: string, visual = true, autoPlay = false) {
  const params = new URLSearchParams({
    url: permalink,
    color: "#19e642",
    auto_play: autoPlay ? "true" : "false",
    hide_related: "true",
    show_comments: "false",
    show_user: "true",
    show_reposts: "false",
    show_teaser: "false",
    visual: visual ? "true" : "false",
  });
  return `https://w.soundcloud.com/player/?${params.toString()}`;
}

function loadSoundCloudApi() {
  if (window.SC?.Widget) return Promise.resolve(window.SC);
  const existing = document.querySelector<HTMLScriptElement>("script[data-sc-widget]");
  if (existing) {
    return new Promise<SoundCloudAPI>((resolve) => {
      existing.addEventListener("load", () => resolve(window.SC as SoundCloudAPI), { once: true });
    });
  }
  return new Promise<SoundCloudAPI>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://w.soundcloud.com/player/api.js";
    script.async = true;
    script.dataset.scWidget = "true";
    script.onload = () => resolve(window.SC as SoundCloudAPI);
    script.onerror = () => reject(new Error("SoundCloud widget failed to load"));
    document.body.appendChild(script);
  });
}

function artworkUrl(sound: SoundCloudSound | null | undefined, fallback: string) {
  const raw = sound?.artwork_url;
  if (!raw) return fallback;
  return raw.replace("-large", "-t500x500");
}

export function SoundCloudEmbed({
  url,
  title,
  track,
  autoPlay = false,
  /** When false, FINISH stays inside SoundCloud (artist/playlist widgets). */
  advanceOnEnd = true,
  /** Jump to this permalink inside a user/playlist widget before first play. */
  startPermalink,
  visual = true,
  className,
}: {
  url: string;
  title: string;
  track?: Track;
  autoPlay?: boolean;
  advanceOnEnd?: boolean;
  startPermalink?: string;
  visual?: boolean;
  className?: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<ExternalPlayer | null>(null);
  const autoPlayRef = useRef(autoPlay);
  autoPlayRef.current = autoPlay;
  const advanceOnEndRef = useRef(advanceOnEnd);
  advanceOnEndRef.current = advanceOnEnd;
  const startPermalinkRef = useRef(startPermalink);
  startPermalinkRef.current = startPermalink;
  // When we need to skip to a start cut, keep iframe auto_play off until after skip.
  const initialAutoPlay = useRef(Boolean(autoPlay && !startPermalink));
  const audio = useAudio();
  const audioRef = useRef(audio);
  audioRef.current = audio;
  const trackRef = useRef(track);
  trackRef.current = track;
  const trackId = track?.id;
  const src = useMemo(
    () => soundCloudEmbedSrc(url, visual, initialAutoPlay.current),
    [url, visual],
  );

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !trackId) return;
    let cancelled = false;
    let widget: SoundCloudWidget | null = null;
    let events: SoundCloudAPI["Widget"]["Events"] | null = null;

    const publishSound = (sound: SoundCloudSound | null | undefined) => {
      const base = trackRef.current;
      if (!base) return;
      const live: Track = {
        ...base,
        title: sound?.title?.trim() || base.title,
        cover: artworkUrl(sound, base.cover),
      };
      const durationSec = sound?.duration ? sound.duration / 1000 : 0;
      audioRef.current.reportExternalPlay(live);
      if (durationSec) audioRef.current.adoptExternal(live, durationSec);
    };

    const beginPlayback = (next: SoundCloudWidget) => {
      const start = startPermalinkRef.current?.replace(/\/$/, "").toLowerCase();
      const playNow = () => {
        if (cancelled) return;
        if (autoPlayRef.current) next.play();
      };
      if (!start) {
        playNow();
        return;
      }
      next.getSounds((sounds) => {
        if (cancelled) return;
        const index = sounds.findIndex((sound) => {
          const permalink = (sound.permalink_url || "").replace(/\/$/, "").toLowerCase();
          return permalink === start || permalink.endsWith(`/${start.split("/").pop()}`);
        });
        if (index >= 0) {
          try {
            next.skip(index);
          } catch {
            /* widget may not support skip on this payload */
          }
        }
        playNow();
      });
    };

    void loadSoundCloudApi().then((api) => {
      if (cancelled || !iframeRef.current) return;
      widget = api.Widget(iframeRef.current);
      events = api.Widget.Events;
      let durationSec = 0;

      widget.bind(events.READY, () => {
        if (cancelled || !widget || !trackRef.current) return;
        widget.getDuration((ms) => {
          durationSec = ms / 1000;
          if (trackRef.current) audioRef.current.adoptExternal(trackRef.current, durationSec);
        });
        const player: ExternalPlayer = {
          play: () => widget?.play(),
          pause: () => widget?.pause(),
          seek: (seconds) => widget?.seekTo(seconds * 1000),
          setVolume: (volume) => widget?.setVolume(Math.round(volume * 100)),
          next: () => widget?.next(),
          prev: () => widget?.prev(),
        };
        playerRef.current = player;
        audioRef.current.registerExternal(trackId, player);
        beginPlayback(widget);
      });
      widget.bind(events.PLAY, () => {
        widget?.getCurrentSound((sound) => {
          if (cancelled) return;
          if (sound?.duration) durationSec = sound.duration / 1000;
          publishSound(sound);
        });
      });
      widget.bind(events.PAUSE, () => audioRef.current.reportExternalPause(trackId));
      widget.bind(events.FINISH, () => {
        // Artist/playlist embeds advance themselves — remounting here crashed the hub.
        if (!advanceOnEndRef.current) return;
        audioRef.current.reportExternalEnded(trackId);
      });
      widget.bind(events.PLAY_PROGRESS, (data) => {
        audioRef.current.reportExternalProgress(trackId, (data?.currentPosition ?? 0) / 1000, durationSec);
      });
    });

    return () => {
      cancelled = true;
      audioRef.current.unregisterExternal(trackId, playerRef.current ?? undefined);
      playerRef.current = null;
      if (widget && events) {
        widget.unbind(events.READY);
        widget.unbind(events.PLAY);
        widget.unbind(events.PAUSE);
        widget.unbind(events.FINISH);
        widget.unbind(events.PLAY_PROGRESS);
      }
    };
  }, [trackId, url, visual]);

  return (
    <iframe
      ref={iframeRef}
      title={`${title} on SoundCloud`}
      src={src}
      allow="autoplay"
      className={cn("h-full w-full border-0", className)}
    />
  );
}
