"use client";

import { PixelIcon } from "@/components/game-ui/PixelIcon";
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
  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-cyan/20 bg-navy/70 px-3 backdrop-blur-md">
      <div className="flex min-w-0 items-center gap-3">
        {onMenu ? (
          <button
            type="button"
            className="flex size-10 items-center justify-center border border-cyan/40 text-cyan lg:hidden"
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
            <span key={h} className="w-[3px] bg-lime" style={{ height: h }} />
          ))}
        </div>
        <Link href="/online" className="p-2 text-cyan hover:text-lime" aria-label="Transmissions">
          <PixelIcon name="signal" />
        </Link>
        <Link href="/achievements" className="p-2 text-cyan hover:text-lime" aria-label="Save data">
          <PixelIcon name="star" />
        </Link>
        {onHud ? (
          <button
            type="button"
            className="flex size-10 items-center justify-center border border-magenta/40 text-pink lg:hidden"
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
