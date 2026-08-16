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
  }, [current, queue]);

  const loadAndPlay = useCallback((track: Track, nextQueue: Track[], autoplay: boolean) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (currentRef.current?.id !== track.id) {
      audio.src = track.src;
      audio.currentTime = 0;
    }
    setCurrent(track);
    setQueue(nextQueue);
    currentRef.current = track;
    queueRef.current = nextQueue;
    if (autoplay) {
      void audio.play().then(
        () => onListenRef.current?.(track.slug),
        () => setIsPlaying(false),
      );
    }
  }, []);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audio.volume = 0.85;
    audioRef.current = audio;

    const onTime = () => setProgress(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      setIsPlaying(false);
      const list = queueRef.current;
      const now = currentRef.current;
      if (!now || list.length === 0) return;
      const index = list.findIndex((track) => track.id === now.id);
      const upcoming = list[(index + 1) % list.length];
      if (upcoming) loadAndPlay(upcoming, list, true);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

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
  }, [loadAndPlay]);

  const playTrack = useCallback(
    (track: Track, nextQueue?: Track[]) => {
      loadAndPlay(track, nextQueue ?? queueRef.current, true);
    },
    [loadAndPlay],
  );

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!currentRef.current) {
      const first = queueRef.current[0];
      if (first) loadAndPlay(first, queueRef.current, true);
      return;
    }
    if (audio.paused) {
      void audio.play().then(
        () => {
          if (currentRef.current) onListenRef.current?.(currentRef.current.slug);
        },
        () => setIsPlaying(false),
      );
    } else {
      audio.pause();
    }
  }, [loadAndPlay]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setProgress(time);
  }, []);

  const setVolume = useCallback((value: number) => {
    const audio = audioRef.current;
    const nextValue = Math.min(1, Math.max(0, value));
    if (audio) audio.volume = nextValue;
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
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const list = queueRef.current;
    const now = currentRef.current;
    if (list.length === 0) return;
    const index = now ? list.findIndex((track) => track.id === now.id) : 0;
    const upcoming = list[(index - 1 + list.length) % list.length];
    if (upcoming) loadAndPlay(upcoming, list, true);
  }, [loadAndPlay]);

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
    }),
    [current, duration, isPlaying, next, playTrack, prev, progress, queue, seek, setVolume, toggle, volume],
  );

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
}

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useAudio must be used inside AudioProvider");
  return ctx;
}
