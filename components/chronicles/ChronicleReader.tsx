"use client";

import { PixelButton } from "@/components/game-ui/PixelButton";
import { useChronicles } from "@/components/chronicles/ChronicleProvider";
import { usePlayer } from "@/components/player/PlayerProvider";
import { formatDate } from "@/lib/cn";
import { padChronicle } from "@/lib/player-state";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

export function ChronicleReader() {
  const { reading, closeFile, authorUnlocked, openTerminal } = useChronicles();
  const { readChronicle } = usePlayer();

  useEffect(() => {
    if (reading) readChronicle(reading.slug);
  }, [readChronicle, reading]);

  useEffect(() => {
    if (!reading) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeFile();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeFile, reading]);

  const still = reading?.media[0]?.src;

  return (
    <AnimatePresence>
      {reading ? (
        <motion.div
          className="absolute inset-0 z-[47] flex flex-col p-2 pb-[calc(var(--player-h)+var(--nav-h)+env(safe-area-inset-bottom))] sm:p-3 lg:p-4 lg:pb-[var(--player-h)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.article
            role="dialog"
            aria-modal="true"
            aria-labelledby="chronicle-file-title"
            className="hud-panel flex min-h-0 flex-1 flex-col overflow-hidden"
            initial={{ scale: 0.94, y: 28 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 16 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan/20 px-3 py-3 sm:px-4">
              <p className="hud-label text-cyan">CHRONICLE {padChronicle(reading.number)}</p>
              <div className="flex gap-2">
                {authorUnlocked && reading.authored ? (
                  <PixelButton variant="ghost" onClick={() => openTerminal(reading.id)}>
                    EDIT
                  </PixelButton>
                ) : null}
                <PixelButton variant="ghost" onClick={closeFile}>
                  CLOSE
                </PixelButton>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
              {still ? (
                <div className="relative h-40 overflow-hidden border-b border-cyan/15 sm:h-52">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={still} alt="" className="size-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-void via-void/20 to-transparent" />
                </div>
              ) : null}
              <div className="p-4 sm:p-6">
                <p className="font-hud text-[10px] tracking-[0.18em] text-lime">{formatDate(reading.date)}</p>
                <h2
                  id="chronicle-file-title"
                  className="mt-2 font-display text-2xl uppercase leading-snug text-mist sm:text-3xl"
                >
                  {reading.title}
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">{reading.excerpt}</p>
                <div className="mt-6 max-w-2xl space-y-5 text-base leading-8 text-mist/90">
                  {reading.content.split("\n\n").map((paragraph) => (
                    <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </motion.article>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
