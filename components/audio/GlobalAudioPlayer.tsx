"use client";

import { useAudio } from "@/components/audio/AudioProvider";
import { socials } from "@/data/socials";
import { formatTime } from "@/lib/cn";
import { cueUiSound } from "@/lib/ui-sound";
import { useState, type ReactNode } from "react";
import Link from "next/link";

export function GlobalAudioPlayer({ visible }: { visible: boolean }) {
  const { current, isPlaying, progress, duration, volume, toggle, seek, next, prev, setVolume } =
    useAudio();
  const [liked, setLiked] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  if (!visible) return null;

  const title = current?.title ?? "NO FILE LOADED";
  const artist = current?.artist ?? "Callmestylez";
  const cover = current?.cover ?? "/art/placeholders/stage-el-train.gif";
  const href = current ? `/music/${current.slug}` : "/music";

  return (
    <div className="shell-chrome fixed inset-x-0 bottom-[calc(var(--nav-h)+env(safe-area-inset-bottom))] z-30 border-t lg:bottom-0">
      <div className="mx-auto flex h-[var(--player-h)] max-w-[1920px] items-center gap-3 px-3">
        <Link href={href} className="shrink-0">
          <span className="cover-frame size-12 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt="" className="size-12 object-cover" />
          </span>
        </Link>
        <div className="min-w-0 w-40 shrink-0 sm:w-52">
          <p className="truncate font-display text-[12px] text-mist">{title}</p>
          <p className="truncate font-hud text-[10px] text-muted">{artist}</p>
        </div>
        <button
          type="button"
          aria-pressed={liked}
          aria-label="Favorite"
          onClick={() => {
            cueUiSound("press");
            setLiked((value) => !value);
          }}
          className={liked ? "text-pink" : "text-muted hover:text-pink"}
        >
          ♥
        </button>
        <div className="flex items-center gap-1">
          <IconButton
            label="Shuffle"
            pressed={shuffle}
            onClick={() => setShuffle((value) => !value)}
          >
            ⇄
          </IconButton>
          <IconButton label="Previous" onClick={prev}>
            ⏮
          </IconButton>
          <button
            type="button"
            onClick={() => {
              cueUiSound("press");
              toggle();
            }}
            className="play-orb hud-press flex size-12 items-center justify-center rounded-full border border-lime bg-green text-lg text-bg"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? "❚❚" : "▶"}
          </button>
          <IconButton label="Next" onClick={next}>
            ⏭
          </IconButton>
          <IconButton
            label="Repeat"
            pressed={repeat}
            onClick={() => setRepeat((value) => !value)}
          >
            ↻
          </IconButton>
        </div>
        <p className="hidden w-16 shrink-0 font-hud text-[10px] text-cyan sm:block">
          {formatTime(progress)}
        </p>
        <div className="hidden min-w-0 flex-1 items-center gap-2 md:flex">
          <label className="sr-only" htmlFor="seek">
            Seek
          </label>
          <input
            id="seek"
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={progress}
            onChange={(event) => seek(Number(event.target.value))}
            className="h-1.5 w-full accent-lime"
            disabled={!current}
          />
        </div>
        <p className="hidden w-16 shrink-0 font-hud text-[10px] text-muted sm:block">
          {formatTime(duration)}
        </p>
        <label className="hidden items-center gap-2 lg:flex">
          <span className="hud-label text-muted">VOL</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            className="w-20 accent-lime"
            aria-label="Volume"
          />
        </label>
        <Link href="/music" className="hidden hud-label text-cyan hover:text-lime xl:inline">
          QUEUE
        </Link>
        <p className="hidden truncate font-hud text-[9px] tracking-[0.16em] text-ocean 2xl:block">
          YOU FOUND IT. WELCOME TO SOUTHSIDE.
        </p>
        <div className="hidden gap-2 2xl:flex">
          {socials.slice(0, 3).map((network) => (
            <a
              key={network.id}
              href={network.href}
              target="_blank"
              rel="noreferrer"
              className="hud-label text-muted hover:text-lime"
            >
              {network.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
  pressed,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        cueUiSound("press");
        onClick();
      }}
      aria-pressed={pressed}
      className={`flex size-9 items-center justify-center border text-mist hover:border-cyan ${
        pressed ? "border-lime text-lime" : "border-transparent"
      }`}
      aria-label={label}
    >
      {children}
    </button>
  );
}
