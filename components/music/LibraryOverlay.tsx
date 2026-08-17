"use client";

import { PixelButton } from "@/components/game-ui/PixelButton";
import { useLibrary } from "@/components/music/LibraryProvider";
import { ReleaseTile } from "@/components/music/ReleaseTile";
import { site } from "@/data/site";
import { cn } from "@/lib/cn";
import { getReleases } from "@/lib/content";
import { cueUiSound } from "@/lib/ui-sound";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type Filter = "all" | "spotify" | "soundcloud";

export function LibraryOverlay() {
  const { open, closeLibrary } = useLibrary();
  const [filter, setFilter] = useState<Filter>("all");
  const releases = getReleases();
  const router = useRouter();
  const pathname = usePathname();

  const catalog = useMemo(() => {
    if (filter === "soundcloud") return releases.filter((item) => item.soundcloudOnly);
    if (filter === "spotify") return releases.filter((item) => !item.soundcloudOnly);
    return releases;
  }, [filter, releases]);

  const close = useCallback(() => {
    closeLibrary();
    if (pathname === "/music") router.replace("/");
  }, [closeLibrary, pathname, router]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, close]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="absolute inset-0 z-[45] flex flex-col p-2 pb-[calc(var(--player-h)+var(--nav-h)+env(safe-area-inset-bottom))] sm:p-3 lg:p-4 lg:pb-[var(--player-h)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="library-title"
            className="hud-panel flex min-h-0 flex-1 flex-col overflow-hidden p-3 sm:p-4"
            initial={{ scale: 0.94, y: 28 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 16 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan/20 pb-3">
              <div>
                <h2 id="library-title" className="font-display text-2xl uppercase text-mist sm:text-3xl">
                  {site.title}
                </h2>
                <p className="mt-1 hud-label text-lime">{site.byline}</p>
                <p className="mt-1 font-hud text-[10px] tracking-[0.16em] text-muted">
                  {catalog.length} FILES • CLICK A TRACK TO LISTEN
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {(["all", "spotify", "soundcloud"] as const).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      cueUiSound("press");
                      setFilter(id);
                    }}
                    className={cn(
                      "hud-press border px-3 py-1.5 font-hud text-[9px] tracking-[0.16em]",
                      filter === id
                        ? "border-lime bg-green/20 text-lime"
                        : "border-cyan/35 text-cyan hover:border-cyan",
                    )}
                  >
                    {id === "all" ? "ALL" : id === "spotify" ? "SPOTIFY" : "SOUNDCLOUD"}
                  </button>
                ))}
                <PixelButton variant="ghost" onClick={close}>
                  CLOSE
                </PixelButton>
              </div>
            </div>
            <div className="mt-4 min-h-0 flex-1 overflow-auto pr-1">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {catalog.map((release) => (
                  <ReleaseTile key={release.id} release={release} />
                ))}
              </div>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
