"use client";

import { PlayerHud } from "@/components/game-ui/PlayerHud";
import { RightRail } from "@/components/hub/RightRail";

export function HudDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-label="Player HUD">
      <button
        type="button"
        className="absolute inset-0 bg-void/70"
        aria-label="Close HUD"
        onClick={onClose}
      />
      <aside className="absolute inset-y-0 right-0 flex w-[min(22rem,92vw)] flex-col gap-3 overflow-auto border-l border-cyan/25 bg-navy/95 p-3 shadow-[-16px_0_40px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between">
          <p className="hud-label text-lime">PLAYER HUD</p>
          <button type="button" className="hud-label text-cyan" onClick={onClose}>
            CLOSE
          </button>
        </div>
        <PlayerHud />
        <RightRail compact />
      </aside>
    </div>
  );
}
