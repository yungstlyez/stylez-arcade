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
          ? "hud-panel relative flex h-full min-h-0 w-full flex-1 flex-col items-center justify-end overflow-hidden p-6 sm:p-8"
          : "hud-panel relative flex min-h-[calc(100dvh-10.5rem)] w-full flex-1 flex-col items-center justify-end overflow-hidden p-6 sm:min-h-[calc(100dvh-8rem)] sm:p-8"
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={STAGE_THRONE}
        alt="Hidden throne stage"
        className="pixelated absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-void/15" />
      <div className="relative flex w-full max-w-lg flex-col items-center text-center">
        <ComingSoonTag />
        <p className="mt-4 hud-label text-lime">FILE LOCKED</p>
        <h1
          id="coming-soon-title"
          className="mt-2 font-display text-4xl font-semibold uppercase tracking-[0.08em] text-mist sm:text-5xl"
        >
          {title}
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted sm:text-base">{blurb}</p>
      </div>
    </div>
  );
}
