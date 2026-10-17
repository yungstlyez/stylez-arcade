"use client";

import { PixelIcon } from "@/components/game-ui/PixelIcon";
import { useChronicles } from "@/components/chronicles/ChronicleProvider";
import { site } from "@/data/site";
import Link from "next/link";

export function TopBar({
  onMenu,
  menuOpen,
  onHud,
  hudOpen,
}: {
  onMenu?: () => void;
  menuOpen?: boolean;
  onHud?: () => void;
  hudOpen?: boolean;
}) {
  const { authorUnlocked, openTerminal } = useChronicles();
  return (
    <header className="shell-chrome flex h-12 shrink-0 items-center justify-between gap-3 border-b px-3">
      <div className="flex min-w-0 items-center gap-3">
        {onMenu ? (
          <button
            type="button"
            className="glass-btn flex size-10 items-center justify-center text-cyan lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={onMenu}
          >
            <span className="font-hud text-lg">☰</span>
          </button>
        ) : null}
        <p className="hud-label truncate text-cyan glow-cyan">{site.title}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden items-end gap-[3px] sm:flex" aria-label="Signal strength">
          {[6, 10, 14, 18].map((h) => (
            <span key={h} className="w-[3px] rounded-full bg-lime" style={{ height: h }} />
          ))}
        </div>
        {authorUnlocked ? (
          <button
            type="button"
            className="glass-btn px-3 py-1 font-hud text-[9px] tracking-[0.16em] text-lime hover:border-lime"
            onClick={() => openTerminal()}
          >
            LOG
          </button>
        ) : null}
        <Link href="/online" className="p-2 text-cyan hover:text-lime" aria-label="Transmissions">
          <PixelIcon name="signal" />
        </Link>
        <Link href="/achievements" className="p-2 text-cyan hover:text-lime" aria-label="Save data">
          <PixelIcon name="star" />
        </Link>
        {onHud ? (
          <button
            type="button"
            className="glass-btn flex size-10 items-center justify-center text-pink lg:hidden"
            aria-expanded={hudOpen}
            aria-label="Open player HUD"
            onClick={onHud}
          >
            <PixelIcon name="user" />
          </button>
        ) : null}
      </div>
    </header>
  );
}
