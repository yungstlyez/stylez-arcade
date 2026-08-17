"use client";

import { ComingSoonScreen } from "@/components/game-ui/ComingSoonScreen";
import { useComingSoon } from "@/components/game-ui/ComingSoonProvider";
import { PixelButton } from "@/components/game-ui/PixelButton";
import { useLibrary } from "@/components/music/LibraryProvider";
import { comingSoonScreens } from "@/data/site";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function ComingSoonOverlay() {
  const { open, href, closeComingSoon } = useComingSoon();
  const { closeLibrary } = useLibrary();
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  const screen = href ? comingSoonScreens[href] : null;

  useEffect(() => {
    if (open) closeLibrary();
  }, [open, closeLibrary]);

  useEffect(() => {
    if (pathRef.current !== pathname) {
      pathRef.current = pathname;
      closeComingSoon();
    }
  }, [pathname, closeComingSoon]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeComingSoon();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeComingSoon]);

  return (
    <AnimatePresence>
      {open && screen ? (
        <motion.div
          className="fixed inset-0 z-[55] flex flex-col p-2 pb-[calc(var(--player-h)+var(--nav-h)+env(safe-area-inset-bottom))] sm:p-3 lg:left-56 lg:p-4 lg:pb-[var(--player-h)] xl:left-64"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="coming-soon-title"
            className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
            initial={{ scale: 0.94, y: 28 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 16 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          >
            <ComingSoonScreen title={screen.title} blurb={screen.blurb} fill />
            <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
              <PixelButton variant="ghost" onClick={closeComingSoon}>
                CLOSE
              </PixelButton>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
