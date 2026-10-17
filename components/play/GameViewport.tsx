"use client";

import { BodegaRun } from "@/components/play/BodegaRun";
import { StageArt } from "@/components/game-ui/StageArt";

/**
 * Mount point for arcade cabinets. Live games render their engine here.
 */
export function GameViewport({
  gameId,
  locked = true,
  label = "CABINET OFFLINE",
  art,
  slug,
}: {
  gameId: string;
  locked?: boolean;
  label?: string;
  art?: string;
  slug?: string;
}) {
  if (!locked && slug === "bodega-run") {
    return (
      <div id={`game-root-${gameId}`}>
        <BodegaRun />
      </div>
    );
  }

  return (
    <div
      id={`game-root-${gameId}`}
      className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-violet/30 bg-black"
    >
      <StageArt src={art} seed={gameId} className="absolute inset-0" />
      <div className="absolute inset-0 bg-void/55" />
      {locked ? (
        <p className="relative font-display text-[10px] tracking-[0.18em] text-lime">{label}</p>
      ) : (
        <p className="relative font-hud text-[10px] text-muted">Engine slot ready.</p>
      )}
    </div>
  );
}
