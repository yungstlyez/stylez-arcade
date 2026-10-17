"use client";

import { ComingSoonTag } from "@/components/game-ui/ComingSoonTag";
import { useComingSoon } from "@/components/game-ui/ComingSoonProvider";
import { PixelIcon, type PixelIconName } from "@/components/game-ui/PixelIcon";
import { useLibrary } from "@/components/music/LibraryProvider";
import { isComingSoonHref, mobileNavItems } from "@/data/site";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent } from "react";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { open, openLibrary, closeLibrary } = useLibrary();
  const { open: comingSoonOpen, href: comingSoonHref, openComingSoon, closeComingSoon } =
    useComingSoon();

  return (
    <nav
      aria-label="Mobile"
      className="shell-chrome safe-bottom fixed inset-x-0 bottom-0 z-30 border-t lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {mobileNavItems.map((item) => {
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
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={(event: MouseEvent<HTMLAnchorElement>) => {
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
                }}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 font-display text-[9px]",
                  active ? "bg-green/10 text-lime" : "text-muted",
                )}
              >
                <PixelIcon name={item.icon as PixelIconName} />
                {item.label}
                {"comingSoon" in item && item.comingSoon ? (
                  <ComingSoonTag compact className="mt-0.5" />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
