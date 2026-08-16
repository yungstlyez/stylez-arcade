"use client";

import { PixelButton } from "@/components/game-ui/PixelButton";
import { ReleaseTile } from "@/components/music/ReleaseTile";
import { site } from "@/data/site";
import { cn } from "@/lib/cn";
import { cueUiSound } from "@/lib/ui-sound";
import type { Release } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type Filter = "all" | "spotify" | "soundcloud";

export function MusicLibrary({ releases }: { releases: Release[] }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const preview = releases.slice(0, 4);

  const catalog = useMemo(() => {
    if (filter === "soundcloud") return releases.filter((item) => item.soundcloudOnly);
    if (filter === "spotify") return releases.filter((item) => !item.soundcloudOnly);
    return releases;
  }, [filter, releases]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <section className="hud-panel flex min-h-0 flex-col overflow-hidden p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="hud-label text-cyan">LATEST RELEASES</p>
          <button
            type="button"
            className="hud-label text-lime hover:text-mist"
            onClick={() => {
              cueUiSound("press");
              setOpen(true);
            }}
          >
            OPEN LIBRARY
          </button>
        </div>
        <div className="mt-3 grid min-h-0 flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
          {preview.map((release) => (
            <ReleaseTile key={release.id} release={release} compact />
          ))}
        </div>
      </section>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-x-0 top-0 z-[45] flex flex-col p-2 sm:p-3 lg:p-4 bottom-[calc(var(--player-h)+var(--nav-h)+env(safe-area-inset-bottom))] lg:bottom-[var(--player-h)]"
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
                  <PixelButton variant="ghost" onClick={() => setOpen(false)}>
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
    </>
  );
}
