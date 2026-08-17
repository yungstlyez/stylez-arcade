"use client";

import { getTrackQueue } from "@/lib/content";
import type { Track } from "@/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ExternalPlayer = {
  play: () => void;
  pause: () => void;
  seek: (seconds: number) => void;
  setVolume?: (volume: number) => void;
};

type AudioContextValue = {
  current: Track | null;
  queue: Track[];
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  playTrack: (track: Track, queue?: Track[]) => void;
  toggle: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  next: () => void;
  prev: () => void;
  registerExternal: (trackId: string, player: ExternalPlayer) => void;
  unregisterExternal: (trackId: string) => void;
  adoptExternal: (track: Track, duration?: number) => void;
  reportExternalPlay: (track: Track) => void;
  reportExternalPause: (trackId: string) => void;
  reportExternalProgress: (trackId: string, progress: number, duration: number) => void;
  reportExternalEnded: (trackId: string) => void;
};

const AudioCtx = createContext<AudioContextValue | null>(null);

export function AudioProvider({
  children,
  onListen,
}: {
  children: ReactNode;
  onListen?: (slug: string) => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onListenRef = useRef(onListen);
  const currentRef = useRef<Track | null>(null);
  const queueRef = useRef<Track[]>(getTrackQueue());
  const externalsRef = useRef(new Map<string, ExternalPlayer>());
  const engineRef = useRef<"html5" | "external">("html5");
  const isPlayingRef = useRef(false);
  const volumeRef = useRef(0.85);
  const pauseRetryRef = useRef(0);
  const [current, setCurrent] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>(() => getTrackQueue());
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);

  useEffect(() => {
    onListenRef.current = onListen;
  }, [onListen]);

  useEffect(() => {
    currentRef.current = current;
    queueRef.current = queue;
    isPlayingRef.current = isPlaying;
    volumeRef.current = volume;
  }, [current, isPlaying, queue, volume]);

  const pauseHtml5 = useCallback(() => {
    audioRef.current?.pause();
  }, []);

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

      if (external) {
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

      if (!audio) return;
      engineRef.current = "html5";
      takeExclusive();
      if (switching) {
        audio.src = track.src;
        audio.currentTime = 0;
      }
      if (autoplay) {
        void audio.play().then(
          () => onListenRef.current?.(track.slug),
          () => setIsPlaying(false),
        );
      }
    },
    [takeExclusive],
  );

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audio.volume = 0.85;
    audioRef.current = audio;

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
      if (upcoming) loadAndPlay(upcoming, list, true);
    };
    const onPlay = () => {
      if (engineRef.current === "html5") {
        pauseExternals();
        setIsPlaying(true);
      }
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
      audio.pause();
      audio.src = "";
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [loadAndPlay, pauseExternals]);

  const playTrack = useCallback(
    (track: Track, nextQueue?: Track[]) => {
      loadAndPlay(track, nextQueue ?? queueRef.current, true);
    },
    [loadAndPlay],
  );

  const toggle = useCallback(() => {
    const now = currentRef.current;
    if (!now) {
      const first = queueRef.current[0];
      if (first) loadAndPlay(first, queueRef.current, true);
      return;
    }
    const external = externalsRef.current.get(now.id);
    if (external) {
      engineRef.current = "external";
      if (isPlayingRef.current) {
        pauseHtml5();
        external.pause();
        isPlayingRef.current = false;
        setIsPlaying(false);
      } else {
        takeExclusive(now.id);
        external.play();
        isPlayingRef.current = true;
        setIsPlaying(true);
        onListenRef.current?.(now.slug);
      }
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    engineRef.current = "html5";
    pauseExternals();
    if (audio.paused) {
      void audio.play().then(
        () => onListenRef.current?.(now.slug),
        () => setIsPlaying(false),
      );
    } else {
      audio.pause();
    }
  }, [loadAndPlay, pauseExternals, pauseHtml5, takeExclusive]);

  const seek = useCallback((time: number) => {
    const now = currentRef.current;
    const external = now ? externalsRef.current.get(now.id) : undefined;
    if (external) {
      external.seek(time);
      setProgress(time);
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setProgress(time);
  }, []);

  const setVolume = useCallback((value: number) => {
    const nextValue = Math.min(1, Math.max(0, value));
    if (audioRef.current) audioRef.current.volume = nextValue;
    externalsRef.current.forEach((player) => player.setVolume?.(nextValue));
    setVolumeState(nextValue);
  }, []);

  const next = useCallback(() => {
    const list = queueRef.current;
    const now = currentRef.current;
    if (list.length === 0) return;
    const index = now ? list.findIndex((track) => track.id === now.id) : -1;
    const upcoming = list[(index + 1 + list.length) % list.length];
    if (upcoming) loadAndPlay(upcoming, list, true);
  }, [loadAndPlay]);

  const prev = useCallback(() => {
    if (progress > 3) {
      seek(0);
      return;
    }
    const list = queueRef.current;
    const now = currentRef.current;
    if (list.length === 0) return;
    const index = now ? list.findIndex((track) => track.id === now.id) : 0;
    const upcoming = list[(index - 1 + list.length) % list.length];
    if (upcoming) loadAndPlay(upcoming, list, true);
  }, [loadAndPlay, progress, seek]);

  const registerExternal = useCallback((trackId: string, player: ExternalPlayer) => {
    externalsRef.current.set(trackId, player);
    player.setVolume?.(volumeRef.current);
    const now = currentRef.current;
    if (now?.id === trackId && isPlayingRef.current) {
      engineRef.current = "external";
      takeExclusive(trackId);
      player.play();
    } else if (isPlayingRef.current && now?.id !== trackId) {
      player.pause();
    }
  }, [takeExclusive]);

  const unregisterExternal = useCallback((trackId: string) => {
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
    if (now.id === track.id && nextDuration) setDuration(nextDuration);
  }, []);

  const reportExternalPlay = useCallback(
    (track: Track) => {
      engineRef.current = "external";
      currentRef.current = track;
      isPlayingRef.current = true;
      setCurrent(track);
      takeExclusive(track.id);
      setIsPlaying(true);
      onListenRef.current?.(track.slug);
    },
    [takeExclusive],
  );

  const reportExternalPause = useCallback((trackId: string) => {
    if (currentRef.current?.id === trackId && engineRef.current === "external") {
      isPlayingRef.current = false;
      setIsPlaying(false);
    }
  }, []);

  const reportExternalProgress = useCallback((trackId: string, nextProgress: number, nextDuration: number) => {
    if (currentRef.current?.id !== trackId || engineRef.current !== "external") return;
    setProgress(nextProgress);
    if (nextDuration) setDuration(nextDuration);
  }, []);

  const reportExternalEnded = useCallback(
    (trackId: string) => {
      if (currentRef.current?.id !== trackId) return;
      setIsPlaying(false);
      const list = queueRef.current;
      const index = list.findIndex((track) => track.id === trackId);
      const upcoming = list[(index + 1) % list.length];
      if (upcoming) loadAndPlay(upcoming, list, true);
    },
    [loadAndPlay],
  );

  const value = useMemo(
    () => ({
      current,
      queue,
      isPlaying,
      progress,
      duration,
      volume,
      playTrack,
      toggle,
      seek,
      setVolume,
      next,
      prev,
      registerExternal,
      unregisterExternal,
      adoptExternal,
      reportExternalPlay,
      reportExternalPause,
      reportExternalProgress,
      reportExternalEnded,
    }),
    [
      adoptExternal,
      current,
      duration,
      isPlaying,
      next,
      playTrack,
      prev,
      progress,
      queue,
      registerExternal,
      reportExternalEnded,
      reportExternalPause,
      reportExternalPlay,
      reportExternalProgress,
      seek,
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
