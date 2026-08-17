"use client";

import { usePlayer } from "@/components/player/PlayerProvider";
import { xpFromSave } from "@/lib/xp";
import { cn } from "@/lib/cn";
import Link from "next/link";

export function PlayerHud({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { save, ready } = usePlayer();
  if (!ready) return null;
  const { xp, max } = xpFromSave(save);

  if (compact) {
    return (
      <Link
        href="/achievements"
        className={cn("hud-panel-green flex items-center gap-2 px-2 py-1", className)}
        aria-label="Player 1 save file"
      >
        <span className="cover-frame size-8 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/art/portrait-stylez.svg" alt="" className="size-8 object-cover" />
        </span>
        <span className="hidden sm:block">
          <span className="block font-hud text-[10px] text-lime">P1</span>
          <span className="block font-hud text-[10px] text-cyan">LV {String(save.level).padStart(2, "0")}</span>
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/achievements"
      className={cn("hud-panel-green hud-lift block p-3 text-left", className)}
      aria-label="Player 1 save file"
    >
      <div className="flex items-center gap-3">
        <span className="cover-frame size-16 shrink-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/art/portrait-stylez.svg"
            alt="Player 1 portrait"
            className="size-16 object-cover"
          />
        </span>
        <div className="min-w-0">
          <p className="hud-label text-mist">PLAYER 1</p>
          <p className="mt-1 font-display text-[11px] text-lime">
            LEVEL {String(save.level).padStart(2, "0")}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <p className="hud-label text-cyan">STYLEZ TOKENS</p>
        <p className="font-hud text-sm text-lime">{String(save.tokens).padStart(3, "0")}</p>
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <p className="hud-label text-muted">XP</p>
        <p className="font-hud text-[11px] text-mist">
          {xp} / {max}
        </p>
      </div>
      <div className="hp-track mt-1">
        <div className="hp-fill" style={{ width: `${(xp / max) * 100}%` }} />
      </div>
      <p className="mt-2 flex items-center gap-2 hud-label text-lime">
        <i className="pulse-dot inline-block size-2 bg-lime" />
        STATUS: CONNECTED
      </p>
    </Link>
  );
}
