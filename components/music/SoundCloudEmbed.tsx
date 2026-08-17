"use client";

import { useAudio, type ExternalPlayer } from "@/components/audio/AudioProvider";
import { cn } from "@/lib/cn";
import type { Track } from "@/types";
import { useEffect, useRef } from "react";

type SoundCloudWidget = {
  bind: (event: string, listener: (data?: { currentPosition?: number; loadedProgress?: number }) => void) => void;
  unbind: (event: string) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seekTo: (ms: number) => void;
  setVolume: (volume: number) => void;
  getDuration: (cb: (ms: number) => void) => void;
  getPosition: (cb: (ms: number) => void) => void;
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

export function SoundCloudEmbed({
  url,
  title,
  track,
  autoPlay = false,
  visual = true,
  className,
}: {
  url: string;
  title: string;
  track?: Track;
  autoPlay?: boolean;
  visual?: boolean;
  className?: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const audio = useAudio();
  const audioRef = useRef(audio);
  audioRef.current = audio;
  const trackRef = useRef(track);
  trackRef.current = track;
  const trackId = track?.id;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !trackId) return;
    let cancelled = false;
    let widget: SoundCloudWidget | null = null;
    let events: SoundCloudAPI["Widget"]["Events"] | null = null;

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
        };
        audioRef.current.registerExternal(trackId, player);
        if (autoPlay) widget.play();
      });
      widget.bind(events.PLAY, () => {
        if (trackRef.current) audioRef.current.reportExternalPlay(trackRef.current);
      });
      widget.bind(events.PAUSE, () => audioRef.current.reportExternalPause(trackId));
      widget.bind(events.FINISH, () => audioRef.current.reportExternalEnded(trackId));
      widget.bind(events.PLAY_PROGRESS, (data) => {
        audioRef.current.reportExternalProgress(trackId, (data?.currentPosition ?? 0) / 1000, durationSec);
      });
    });

    return () => {
      cancelled = true;
      audioRef.current.unregisterExternal(trackId);
      if (widget && events) {
        widget.unbind(events.READY);
        widget.unbind(events.PLAY);
        widget.unbind(events.PAUSE);
        widget.unbind(events.FINISH);
        widget.unbind(events.PLAY_PROGRESS);
      }
    };
  }, [autoPlay, trackId, url, visual]);

  return (
    <iframe
      ref={iframeRef}
      title={`${title} on SoundCloud`}
      src={soundCloudEmbedSrc(url, visual, autoPlay)}
      allow="autoplay"
      className={cn("h-full w-full border-0", className)}
    />
  );
}
