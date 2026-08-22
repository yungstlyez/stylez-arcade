"use client";

import { useAudio, type ExternalPlayer } from "@/components/audio/AudioProvider";
import { cn } from "@/lib/cn";
import type { Track } from "@/types";
import { useEffect, useRef } from "react";

type SpotifyPlaybackEvent = {
  data: {
    isPaused?: boolean;
    isBuffering?: boolean;
    position?: number;
    duration?: number;
    playingURI?: string;
  };
};

type SpotifyEmbedController = {
  play: () => void;
  pause: () => void;
  resume: () => void;
  togglePlay: () => Promise<void>;
  seek: (seconds: number) => void;
  loadUri: (uri: string) => void;
  addListener: (event: "playback_update" | "playback_started" | "ready", cb: (e: SpotifyPlaybackEvent) => void) => void;
  destroy?: () => void;
};

type SpotifyIFrameAPI = {
  createController: (
    element: HTMLElement,
    options: { uri: string; width?: string; height?: string },
    callback: (controller: SpotifyEmbedController) => void,
  ) => void;
};

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIFrameAPI) => void;
  }
}

export function spotifyEmbedSrc(trackUrl: string) {
  const match = trackUrl.match(/track\/([a-zA-Z0-9]+)/);
  if (!match) return null;
  return `https://open.spotify.com/embed/track/${match[1]}?utm_source=generator&theme=0`;
}

function spotifyTrackId(trackUrl: string) {
  return trackUrl.match(/track\/([a-zA-Z0-9]+)/)?.[1] ?? null;
}

let spotifyApi: SpotifyIFrameAPI | null = null;
const spotifyWaiters: Array<(api: SpotifyIFrameAPI) => void> = [];

function whenSpotifyApiReady(cb: (api: SpotifyIFrameAPI) => void) {
  if (spotifyApi) {
    cb(spotifyApi);
    return;
  }
  spotifyWaiters.push(cb);
  if (document.querySelector("script[data-spotify-iframe-api]")) return;
  const prev = window.onSpotifyIframeApiReady;
  window.onSpotifyIframeApiReady = (api) => {
    spotifyApi = api;
    prev?.(api);
    while (spotifyWaiters.length) spotifyWaiters.shift()?.(api);
  };
  const script = document.createElement("script");
  script.src = "https://open.spotify.com/embed/iframe-api/v1";
  script.async = true;
  script.dataset.spotifyIframeApi = "true";
  document.body.appendChild(script);
}

export function SpotifyEmbed({
  url,
  title,
  track,
  className,
}: {
  url: string;
  title: string;
  track?: Track;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const audio = useAudio();
  const audioRef = useRef(audio);
  audioRef.current = audio;
  const trackRef = useRef(track);
  trackRef.current = track;
  const trackId = track?.id;
  const pausedRef = useRef(true);

  useEffect(() => {
    const wrap = wrapRef.current;
    const id = spotifyTrackId(url);
    if (!wrap || !id || !trackId) return;
    let cancelled = false;
    let controller: SpotifyEmbedController | null = null;
    let player: ExternalPlayer | null = null;
    const host = document.createElement("div");
    host.style.width = "100%";
    host.style.height = "100%";
    wrap.replaceChildren(host);

    whenSpotifyApiReady((api) => {
      if (cancelled || !host.isConnected) return;
      api.createController(host, { uri: `spotify:track:${id}`, width: "100%", height: "100%" }, (next) => {
        if (cancelled) {
          next.destroy?.();
          return;
        }
        controller = next;
        pausedRef.current = true;
        const nextPlayer: ExternalPlayer = {
          play: () => next.play(),
          pause: () => next.pause(),
          seek: (seconds) => next.seek(seconds),
        };
        player = nextPlayer;
        audioRef.current.registerExternal(trackId, nextPlayer);
        if (trackRef.current) audioRef.current.adoptExternal(trackRef.current);
        next.addListener("playback_started", () => {
          if (trackRef.current) audioRef.current.reportExternalPlay(trackRef.current);
        });
        next.addListener("playback_update", (event) => {
          const paused = Boolean(event.data.isPaused);
          const position = (event.data.position ?? 0) / 1000;
          const duration = (event.data.duration ?? 0) / 1000;
          audioRef.current.reportExternalProgress(trackId, position, duration);
          if (event.data.isBuffering) return;
          const wasPaused = pausedRef.current;
          pausedRef.current = paused;
          if (!paused && wasPaused && trackRef.current) {
            audioRef.current.reportExternalPlay(trackRef.current);
          }
          if (paused && !wasPaused) {
            if (duration && position >= duration - 0.35) audioRef.current.reportExternalEnded(trackId);
            else audioRef.current.reportExternalPause(trackId);
          }
        });
      });
    });

    return () => {
      cancelled = true;
      audioRef.current.unregisterExternal(trackId, player ?? undefined);
      controller?.destroy?.();
    };
  }, [trackId, url]);

  const src = spotifyEmbedSrc(url);

  return (
    <div className={cn("h-full w-full", className)}>
      <div ref={wrapRef} className="size-full" title={`${title} on Spotify`} />
      {!track && src ? (
        <iframe
          title={`${title} on Spotify`}
          src={src}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          className="size-full border-0"
        />
      ) : null}
    </div>
  );
}
