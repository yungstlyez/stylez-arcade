"use client";

import { ComingSoonTag } from "@/components/game-ui/ComingSoonTag";
import { STAGE_THRONE } from "@/lib/placeholders";

export function ComingSoonScreen({
  title,
  blurb,
  fill = false,
}: {
  title: string;
  blurb: string;
  fill?: boolean;
}) {
  return (
    <div
      className={
        fill
          ? "hud-panel relative h-full min-h-0 w-full flex-1 overflow-hidden"
          : "hud-panel relative min-h-[calc(100dvh-10.5rem)] w-full flex-1 overflow-hidden sm:min-h-[calc(100dvh-8rem)]"
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={STAGE_THRONE}
        alt="Hidden throne stage"
        className="pixelated absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-void/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-void via-void/45 to-void/25" />
      <div className="absolute inset-x-0 top-[42%] z-10 flex -translate-y-4 flex-col items-center px-6 text-center sm:top-[40%] sm:px-8">
        <ComingSoonTag className="border-magenta bg-void/80 shadow-[0_0_18px_rgba(242,11,168,0.55)] glow-pink" />
        <p className="mt-4 hud-label text-lime glow-green [text-shadow:0_0_12px_rgba(98,255,91,0.85),0_0_28px_rgba(25,230,66,0.45)]">
          FILE LOCKED
        </p>
        <h1
          id="coming-soon-title"
          className="mt-2 font-display text-2xl uppercase leading-snug text-mist [text-shadow:0_0_18px_rgba(217,247,245,0.4)] sm:text-3xl"
        >
          {title}
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-7 text-muted sm:text-base">{blurb}</p>
      </div>
    </div>
  );
}
