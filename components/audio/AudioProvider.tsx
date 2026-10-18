"use client";

import { getSoundCloudQueue, getTrackQueue } from "@/lib/content";
import type { Track } from "@/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/** Stable id for the hub artist-page SoundCloud widget. */
export const SC_CATALOG_ID = "sc-artist-catalog";

export type ExternalPlayer = {
  play: () => void;
  pause: () => void;
  seek: (seconds: number) => void;
  setVolume?: (volume: number) => void;
  /** SoundCloud playlist/user widgets */
  next?: () => void;
  prev?: () => void;
  /**
   * Independent embeds (Spotify) are pauseable by the global player,
   * but never own the bottom-bar transport or now-playing state.
   */
  independent?: boolean;
};

type AudioContextValue = {
  current: Track | null;
  queue: Track[];
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  muffled: boolean;
  playTrack: (track: Track, queue?: Track[]) => void;
  toggle: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  next: () => void;
  prev: () => void;
  setMuffled: (muffled: boolean, seconds?: number) => void;
  resumeEngine: () => void;
  bootTitleTrack: (track: Track, queue?: Track[]) => void;
  registerExternal: (trackId: string, player: ExternalPlayer) => void;
  unregisterExternal: (trackId: string, player?: ExternalPlayer) => void;
  adoptExternal: (track: Track, duration?: number) => void;
  reportExternalPlay: (track: Track) => void;
  reportExternalPause: (trackId: string) => void;
  reportExternalProgress: (trackId: string, progress: number, duration: number) => void;
  reportExternalEnded: (trackId: string) => void;
  /** Pause global/SC transport because an independent embed (Spotify) started. */
  pauseGlobalForForeign: (exceptId?: string) => void;
};

const AudioCtx = createContext<AudioContextValue | null>(null);

const MUFFLE_CUTOFF = 280;

function openCutoff(ctx: AudioContext) {
  return Math.min(18000, ctx.sampleRate / 2 - 100);
}

export function AudioProvider({
  children,
  onListen,
}: {
  children: ReactNode;
  onListen?: (slug: string) => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const filter2Ref = useRef<BiquadFilterNode | null>(null);
  const wetRef = useRef<GainNode | null>(null);
  const onListenRef = useRef(onListen);
  const loadAndPlayRef = useRef<(track: Track, nextQueue: Track[], autoplay: boolean) => void>(() => undefined);
  const pauseExternalsRef = useRef<(exceptId?: string) => void>(() => undefined);
  const currentRef = useRef<Track | null>(null);
  const queueRef = useRef<Track[]>(getTrackQueue());
  const externalsRef = useRef(new Map<string, ExternalPlayer>());
  const engineRef = useRef<"html5" | "external">("html5");
  const isPlayingRef = useRef(false);
  const volumeRef = useRef(0.85);
  const pauseRetryRef = useRef(0);
  const muffledRef = useRef(false);
  const muffleGainRef = useRef(1);
  const progressRef = useRef(0);
  const handoffRef = useRef(false);
  const muffleAnimRef = useRef(0);
  const pendingExternalPlayRef = useRef<string | null>(null);
  const progressRafRef = useRef(0);
  const pendingDurationRef = useRef(0);
  const [current, setCurrent] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>(() => getTrackQueue());
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);
  const [muffled, setMuffledState] = useState(false);

  useEffect(() => {
    onListenRef.current = onListen;
  }, [onListen]);

  useEffect(() => {
    currentRef.current = current;
    queueRef.current = queue;
    isPlayingRef.current = isPlaying;
    volumeRef.current = volume;
    progressRef.current = progress;
  }, [current, isPlaying, queue, volume, progress]);

  const pauseHtml5 = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const stopHtml5 = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    if (audio.getAttribute("src")) {
      audio.removeAttribute("src");
      audio.load();
    }
  }, []);

  const resumeEngine = useCallback(() => {
    const ctx = ctxRef.current;
    if (ctx && ctx.state === "suspended") void ctx.resume();
  }, []);

  const applyMuffle = useCallback((on: boolean, seconds = 0) => {
    const ctx = ctxRef.current;
    const filter = filterRef.current;
    const filter2 = filter2Ref.current;
    const wet = wetRef.current;
    if (!ctx || !filter || !filter2 || !wet) {
      if (audioRef.current) {
        audioRef.current.volume = on ? Math.min(0.28, volumeRef.current) : volumeRef.current;
      }
      return;
    }
    const now = ctx.currentTime;
    const freq = on ? MUFFLE_CUTOFF : openCutoff(ctx);
    const level = on ? 0.7 : 1;
    filter.frequency.cancelScheduledValues(now);
    filter2.frequency.cancelScheduledValues(now);
    wet.gain.cancelScheduledValues(now);
    if (seconds <= 0) {
      filter.frequency.setValueAtTime(freq, now);
      filter2.frequency.setValueAtTime(freq, now);
      wet.gain.setValueAtTime(level, now);
      return;
    }
    const ramp = Math.max(0.05, seconds);
    const currentFreq = Math.max(80, filter.frequency.value);
    filter.frequency.setValueAtTime(currentFreq, now);
    filter.frequency.exponentialRampToValueAtTime(freq, now + ramp);
    filter2.frequency.setValueAtTime(Math.max(80, filter2.frequency.value), now);
    filter2.frequency.exponentialRampToValueAtTime(freq, now + ramp);
    wet.gain.setValueAtTime(wet.gain.value, now);
    wet.gain.linearRampToValueAtTime(level, now + ramp);
  }, []);

  const applyExternalGain = useCallback((gain: number) => {
    muffleGainRef.current = gain;
    externalsRef.current.forEach((player) => {
      player.setVolume?.(volumeRef.current * gain);
    });
  }, []);

  const setMuffled = useCallback(
    (on: boolean, seconds = on ? 0 : 1.15) => {
      muffledRef.current = on;
      setMuffledState(on);
      resumeEngine();
      applyMuffle(on, seconds);
      const target = on ? 0.26 : 1;
      window.cancelAnimationFrame(muffleAnimRef.current);
      if (seconds <= 0) {
        applyExternalGain(target);
        return;
      }
      if (!on) handoffRef.current = true;
      const start = muffleGainRef.current;
      const t0 = performance.now();
      const durationMs = Math.max(50, seconds * 1000);
      const step = (now: number) => {
        const u = Math.min(1, (now - t0) / durationMs);
        applyExternalGain(start + (target - start) * u);
        if (u < 1) muffleAnimRef.current = window.requestAnimationFrame(step);
        else if (!on) window.setTimeout(() => {
          handoffRef.current = false;
        }, 400);
      };
      muffleAnimRef.current = window.requestAnimationFrame(step);
    },
    [applyExternalGain, applyMuffle, resumeEngine],
  );

  const pauseExternals = useCallback((exceptId?: string) => {
    externalsRef.current.forEach((player, id) => {
      if (id === exceptId) return;
      try {
        player.pause();
      } catch {
        /* embed may not be ready */
      }
    });
  }, []);

  const takeExclusive = useCallback(
    (exceptId?: string) => {
      pauseHtml5();
      pauseExternals(exceptId);
      window.clearTimeout(pauseRetryRef.current);
      pauseRetryRef.current = window.setTimeout(() => pauseExternals(exceptId), 160);
    },
    [pauseExternals, pauseHtml5],
  );

  pauseExternalsRef.current = pauseExternals;

  const loadAndPlay = useCallback(
    (track: Track, nextQueue: Track[], autoplay: boolean) => {
      const audio = audioRef.current;
      const external = externalsRef.current.get(track.id);
      const switching = currentRef.current?.id !== track.id;
      setCurrent(track);
      setQueue(nextQueue);
      currentRef.current = track;
      queueRef.current = nextQueue;
      if (switching) setProgress(0);

      const continueHtml5 = engineRef.current === "html5" && !switching && !track.preferExternal;
      if (external && !continueHtml5) {
        engineRef.current = "external";
        takeExclusive(track.id);
        if (autoplay) {
          isPlayingRef.current = true;
          setIsPlaying(true);
          external.play();
          onListenRef.current?.(track.slug);
        }
        return;
      }

      if (track.preferExternal) {
        engineRef.current = "external";
        stopHtml5();
        pendingExternalPlayRef.current = autoplay ? track.id : null;
        if (autoplay) {
          isPlayingRef.current = true;
          setIsPlaying(true);
        }
        return;
      }

      if (!audio) return;
      engineRef.current = "html5";
      if (!switching && !audio.paused) {
        resumeEngine();
        applyMuffle(muffledRef.current, 0);
        return;
      }
      takeExclusive();
      if (switching) {
        audio.src = track.src;
        audio.currentTime = 0;
      }
      if (autoplay) {
        applyMuffle(muffledRef.current, 0);
        resumeEngine();
        void audio.play().then(
          () => onListenRef.current?.(track.slug),
          () => {
            isPlayingRef.current = false;
            setIsPlaying(false);
          },
        );
      }
    },
    [applyMuffle, resumeEngine, stopHtml5, takeExclusive],
  );

  loadAndPlayRef.current = loadAndPlay;

  useLayoutEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";
    audio.volume = 0.85;
    audioRef.current = audio;

    try {
      const ctx = new AudioContext();
      const source = ctx.createMediaElementSource(audio);
      const filter = ctx.createBiquadFilter();
      const filter2 = ctx.createBiquadFilter();
      const wet = ctx.createGain();
      const freq = muffledRef.current ? MUFFLE_CUTOFF : openCutoff(ctx);
      filter.type = "lowpass";
      filter.frequency.value = freq;
      filter.Q.value = 0.7;
      filter2.type = "lowpass";
      filter2.frequency.value = freq;
      filter2.Q.value = 0.7;
      wet.gain.value = muffledRef.current ? 0.7 : 1;
      source.connect(filter);
      filter.connect(filter2);
      filter2.connect(wet);
      wet.connect(ctx.destination);
      ctxRef.current = ctx;
      filterRef.current = filter;
      filter2Ref.current = filter2;
      wetRef.current = wet;
    } catch {
      ctxRef.current = null;
    }

    const onTime = () => {
      if (engineRef.current === "html5") setProgress(audio.currentTime);
    };
    const onMeta = () => {
      if (engineRef.current === "html5") setDuration(audio.duration || 0);
    };
    const onEnded = () => {
      if (engineRef.current !== "html5") return;
      setIsPlaying(false);
      const list = queueRef.current;
      const now = currentRef.current;
      if (!now || list.length === 0) return;
      const index = list.findIndex((track) => track.id === now.id);
      const upcoming = list[(index + 1) % list.length];
      if (upcoming) loadAndPlayRef.current(upcoming, list, true);
    };
    const onPlay = () => {
      if (engineRef.current !== "html5" || currentRef.current?.preferExternal) {
        audio.pause();
        return;
      }
      pauseExternalsRef.current();
      setIsPlaying(true);
    };
    const onPause = () => {
      if (engineRef.current === "html5") setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      window.cancelAnimationFrame(progressRafRef.current);
      audio.pause();
      audio.src = "";
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      void ctxRef.current?.close();
      ctxRef.current = null;
      filterRef.current = null;
      filter2Ref.current = null;
      wetRef.current = null;
    };
  }, []);

  const playTrack = useCallback(
    (track: Track, nextQueue?: Track[]) => {
      loadAndPlay(track, nextQueue ?? queueRef.current, true);
    },
    [loadAndPlay],
  );

  const bootTitleTrack = useCallback(
    (track: Track, nextQueue?: Track[]) => {
      muffledRef.current = true;
      setMuffledState(true);
      applyMuffle(true, 0);
      applyExternalGain(0.26);
      resumeEngine();
      const queue = nextQueue ?? queueRef.current;
      setCurrent(track);
      setQueue(queue);
      currentRef.current = track;
      queueRef.current = queue;
      engineRef.current = "external";
      stopHtml5();
      isPlayingRef.current = true;
      setIsPlaying(true);
      const external = externalsRef.current.get(track.id);
      if (external) {
        pendingExternalPlayRef.current = null;
        external.setVolume?.(volumeRef.current * 0.26);
        external.play();
        return;
      }
      pendingExternalPlayRef.current = track.id;
    },
    [applyExternalGain, applyMuffle, resumeEngine, stopHtml5],
  );

  const resolveExternal = useCallback(() => {
    const now = currentRef.current;
    if (now && externalsRef.current.has(now.id)) {
      const player = externalsRef.current.get(now.id)!;
      if (!player.independent) return { id: now.id, player };
    }
    if (externalsRef.current.has(SC_CATALOG_ID)) {
      return { id: SC_CATALOG_ID, player: externalsRef.current.get(SC_CATALOG_ID)! };
    }
    for (const [id, player] of externalsRef.current) {
      if (player.independent) continue;
      return { id, player };
    }
    return null;
  }, []);

  const pauseGlobalForForeign = useCallback(
    (exceptId?: string) => {
      handoffRef.current = true;
      pauseHtml5();
      pauseExternals(exceptId);
      window.clearTimeout(pauseRetryRef.current);
      pauseRetryRef.current = window.setTimeout(() => pauseExternals(exceptId), 160);
      isPlayingRef.current = false;
      setIsPlaying(false);
      window.setTimeout(() => {
        handoffRef.current = false;
      }, 220);
    },
    [pauseExternals, pauseHtml5],
  );

  const toggle = useCallback(() => {
    const now = currentRef.current;
    const resolved = resolveExternal();
    if (resolved && (engineRef.current === "external" || now?.preferExternal || !now)) {
      if (isPlayingRef.current) {
        pauseHtml5();
        resolved.player.pause();
        isPlayingRef.current = false;
        setIsPlaying(false);
      } else {
        takeExclusive(resolved.id);
        engineRef.current = "external";
        resolved.player.play();
        isPlayingRef.current = true;
        setIsPlaying(true);
        if (now) onListenRef.current?.(now.slug);
      }
      return;
    }
    if (!now) {
      const catalog = externalsRef.current.get(SC_CATALOG_ID);
      if (catalog) {
        takeExclusive(SC_CATALOG_ID);
        engineRef.current = "external";
        pendingExternalPlayRef.current = SC_CATALOG_ID;
        catalog.play();
        isPlayingRef.current = true;
        setIsPlaying(true);
        return;
      }
      const first = queueRef.current[0];
      if (first) loadAndPlay(first, queueRef.current, true);
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    if (now.preferExternal) {
      stopHtml5();
      pendingExternalPlayRef.current = now.id;
      return;
    }
    engineRef.current = "html5";
    pauseExternals();
    if (audio.paused) {
      resumeEngine();
      void audio.play().then(
        () => onListenRef.current?.(now.slug),
        () => setIsPlaying(false),
      );
    } else {
      audio.pause();
    }
  }, [loadAndPlay, pauseExternals, pauseHtml5, resolveExternal, resumeEngine, stopHtml5, takeExclusive]);

  const seek = useCallback((time: number) => {
    const resolved = resolveExternal();
    if (resolved && engineRef.current === "external") {
      resolved.player.seek(time);
      setProgress(time);
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setProgress(time);
  }, [resolveExternal]);

  const setVolume = useCallback((value: number) => {
    const nextValue = Math.min(1, Math.max(0, value));
    if (audioRef.current) audioRef.current.volume = nextValue;
    externalsRef.current.forEach((player) => player.setVolume?.(nextValue * muffleGainRef.current));
    setVolumeState(nextValue);
  }, []);

  const activeQueue = useCallback(() => {
    const now = currentRef.current;
    const queued = queueRef.current;
    if (!now?.soundcloudUrl) return queued;
    const fromQueue = queued.filter((track) => track.soundcloudUrl);
    return fromQueue.length ? fromQueue : getSoundCloudQueue();
  }, []);

  const next = useCallback(() => {
    const resolved = resolveExternal();
    if (resolved?.player.next && (engineRef.current === "external" || currentRef.current?.id === SC_CATALOG_ID)) {
      resolved.player.next();
      return;
    }
    const list = activeQueue();
    const now = currentRef.current;
    if (list.length === 0) return;
    const index = now ? list.findIndex((track) => track.id === now.id) : -1;
    const upcoming = list[(index + 1 + list.length) % list.length];
    if (upcoming) loadAndPlay(upcoming, list, true);
  }, [activeQueue, loadAndPlay, resolveExternal]);

  const prev = useCallback(() => {
    const resolved = resolveExternal();
    if (
      resolved?.player.prev &&
      progress <= 3 &&
      (engineRef.current === "external" || currentRef.current?.id === SC_CATALOG_ID)
    ) {
      resolved.player.prev();
      return;
    }
    if (progress > 3) {
      seek(0);
      return;
    }
    const list = activeQueue();
    const now = currentRef.current;
    if (list.length === 0) return;
    const index = now ? list.findIndex((track) => track.id === now.id) : 0;
    const upcoming = list[(index - 1 + list.length) % list.length];
    if (upcoming) loadAndPlay(upcoming, list, true);
  }, [activeQueue, loadAndPlay, progress, resolveExternal, seek]);

  const registerExternal = useCallback((trackId: string, player: ExternalPlayer) => {
    const prev = externalsRef.current.get(trackId);
    if (prev && prev !== player) {
      try {
        prev.pause();
      } catch {
        /* replaced */
      }
    }
    externalsRef.current.set(trackId, player);
    player.setVolume?.(volumeRef.current * muffleGainRef.current);
    const now = currentRef.current;
    const shouldPlay =
      pendingExternalPlayRef.current === trackId ||
      (now?.id === trackId && isPlayingRef.current) ||
      (now?.id === trackId && engineRef.current === "html5");
    if (engineRef.current === "html5" && now?.id === trackId) {
      stopHtml5();
      engineRef.current = "external";
    }
    if (shouldPlay && (now?.id === trackId || pendingExternalPlayRef.current === trackId)) {
      pendingExternalPlayRef.current = null;
      engineRef.current = "external";
      if (progressRef.current > 1) player.seek(progressRef.current);
      player.play();
      return;
    }
    // Never pause the artist catalog host for a stale single-track current id.
    if (isPlayingRef.current && now?.id !== trackId && trackId !== SC_CATALOG_ID) {
      player.pause();
    }
  }, [stopHtml5]);

  const unregisterExternal = useCallback((trackId: string, player?: ExternalPlayer) => {
    if (player && externalsRef.current.get(trackId) !== player) return;
    externalsRef.current.delete(trackId);
  }, []);

  const adoptExternal = useCallback((track: Track, nextDuration = 0) => {
    const now = currentRef.current;
    if (!now) {
      setCurrent(track);
      currentRef.current = track;
      if (nextDuration) setDuration(nextDuration);
      return;
    }
    if (now.id === track.id) {
      if (now.title !== track.title || now.cover !== track.cover) {
        currentRef.current = track;
        setCurrent(track);
      }
      if (nextDuration) setDuration(nextDuration);
    }
  }, []);

  const reportExternalPlay = useCallback(
    (track: Track) => {
      // Independent embeds must not steal the bottom bar — they call pauseGlobalForForeign.
      if (externalsRef.current.get(track.id)?.independent) {
        pauseGlobalForForeign(track.id);
        return;
      }
      const prev = currentRef.current;
      const already =
        engineRef.current === "external" &&
        prev?.id === track.id &&
        isPlayingRef.current;
      engineRef.current = "external";
      currentRef.current = track;
      isPlayingRef.current = true;
      // Keep SoundCloud in its own continuum so FINISH advances to the next SC cut.
      if (track.soundcloudUrl) {
        const scQueue = getSoundCloudQueue();
        queueRef.current = scQueue;
        setQueue(scQueue);
      }
      if (already) {
        // Artist widget advanced — refresh title/art without tearing down playback.
        if (prev.title !== track.title || prev.cover !== track.cover) {
          setCurrent(track);
        }
        setIsPlaying(true);
        return;
      }
      setCurrent(track);
      takeExclusive(track.id);
      setIsPlaying(true);
      onListenRef.current?.(track.slug);
    },
    [pauseGlobalForForeign, takeExclusive],
  );

  const reportExternalPause = useCallback((trackId: string) => {
    if (handoffRef.current) return;
    if (!externalsRef.current.has(trackId)) return;
    const now = currentRef.current;
    const owns =
      now?.id === trackId ||
      (trackId === SC_CATALOG_ID && (now?.id === SC_CATALOG_ID || Boolean(now?.soundcloudUrl)));
    if (owns && engineRef.current === "external") {
      isPlayingRef.current = false;
      setIsPlaying(false);
    }
  }, []);

  const reportExternalProgress = useCallback((trackId: string, nextProgress: number, nextDuration: number) => {
    if (engineRef.current !== "external") return;
    const now = currentRef.current;
    const owns =
      now?.id === trackId ||
      (trackId === SC_CATALOG_ID && (now?.id === SC_CATALOG_ID || Boolean(now?.soundcloudUrl)));
    if (!owns) return;
    progressRef.current = nextProgress;
    if (nextDuration) pendingDurationRef.current = nextDuration;
    if (progressRafRef.current) return;
    progressRafRef.current = window.requestAnimationFrame(() => {
      progressRafRef.current = 0;
      setProgress(progressRef.current);
      if (pendingDurationRef.current) setDuration(pendingDurationRef.current);
    });
  }, []);

  const reportExternalEnded = useCallback(
    (trackId: string) => {
      if (currentRef.current?.id !== trackId) return;
      setIsPlaying(false);
      const list = activeQueue();
      if (list.length === 0) return;
      const index = list.findIndex((track) => track.id === trackId);
      const upcoming = list[(index + 1 + list.length) % list.length];
      if (upcoming) loadAndPlay(upcoming, list, true);
    },
    [activeQueue, loadAndPlay],
  );

  const value = useMemo(
    () => ({
      current,
      queue,
      isPlaying,
      progress,
      duration,
      volume,
      muffled,
      playTrack,
      toggle,
      seek,
      setVolume,
      next,
      prev,
      setMuffled,
      resumeEngine,
      bootTitleTrack,
      registerExternal,
      unregisterExternal,
      adoptExternal,
      reportExternalPlay,
      reportExternalPause,
      reportExternalProgress,
      reportExternalEnded,
      pauseGlobalForForeign,
    }),
    [
      adoptExternal,
      bootTitleTrack,
      current,
      duration,
      isPlaying,
      muffled,
      next,
      pauseGlobalForForeign,
      playTrack,
      prev,
      progress,
      queue,
      registerExternal,
      reportExternalEnded,
      reportExternalPause,
      reportExternalPlay,
      reportExternalProgress,
      resumeEngine,
      seek,
      setMuffled,
      setVolume,
      toggle,
      unregisterExternal,
      volume,
    ],
  );

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
}

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useAudio must be used inside AudioProvider");
  return ctx;
}
