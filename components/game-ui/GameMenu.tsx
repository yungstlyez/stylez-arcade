"use client";

import { ComingSoonTag } from "@/components/game-ui/ComingSoonTag";
import { useComingSoon } from "@/components/game-ui/ComingSoonProvider";
import { PixelIcon, type PixelIconName } from "@/components/game-ui/PixelIcon";
import { useLibrary } from "@/components/music/LibraryProvider";
import { isComingSoonHref, navItems } from "@/data/site";
import { cn } from "@/lib/cn";
import { cueUiSound } from "@/lib/ui-sound";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent } from "react";

export function GameMenu({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { open, openLibrary, closeLibrary } = useLibrary();
  const { open: comingSoonOpen, href: comingSoonHref, openComingSoon, closeComingSoon } =
    useComingSoon();

  return (
    <nav aria-label="Main">
      <ul className="flex flex-col">
        {navItems.map((item) => {
          const libraryItem = item.href === "/music";
          const lockedItem = isComingSoonHref(item.href);
          const active = libraryItem
            ? open
            : lockedItem
              ? comingSoonOpen && comingSoonHref === item.href
              : item.href === "/"
                ? pathname === "/" && !open && !comingSoonOpen
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href} className="nav-sep">
              <Link
                href={item.href}
                onClick={(event: MouseEvent<HTMLAnchorElement>) => {
                  cueUiSound("select");
                  event.preventDefault();
                  if (libraryItem) {
                    closeComingSoon();
                    openLibrary();
                  } else if (lockedItem) {
                    closeLibrary();
                    openComingSoon(item.href);
                  } else {
                    closeLibrary();
                    closeComingSoon();
                    router.push(item.href);
                  }
                  onNavigate?.();
                }}
                onMouseEnter={() => cueUiSound("hover")}
                className={cn(
                  "relative flex min-h-12 items-center gap-3 px-3 py-2 transition-colors",
                  active
                    ? "select-row glow-green"
                    : "text-mist/80 hover:bg-ocean/25 hover:text-cyan",
                )}
              >
                {active ? (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[10px] text-lime">
                    ▶
                  </span>
                ) : null}
                <PixelIcon
                  name={item.icon as PixelIconName}
                  className={active ? "text-lime" : indexTone(item.label)}
                />
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "block font-display text-[12px] font-semibold tracking-[0.16em]",
                        active ? "text-lime" : "text-mist",
                      )}
                    >
                      {item.label}
                    </span>
                    {"comingSoon" in item && item.comingSoon ? (
                      <ComingSoonTag compact className="shrink-0" />
                    ) : null}
                  </span>
                  <span className={cn("block font-hud text-[10px]", active ? "text-lime/80" : "text-muted")}>
                    {item.subtitle}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function indexTone(label: string) {
  const magenta = new Set(["WORLD", "SHOP"]);
  return magenta.has(label) ? "text-pink" : "text-cyan";
}
