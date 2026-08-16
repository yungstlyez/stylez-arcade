"use client";

import { usePlayer } from "@/components/player/PlayerProvider";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

export function UnlockToasts() {
  const { toasts, dismissToast } = usePlayer();

  return (
    <div className="pointer-events-none fixed top-4 right-4 z-[60] flex w-[min(20rem,calc(100vw-2rem))] flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDone={() => dismissToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastCard({
  toast,
  onDone,
}: {
  toast: { id: string; kind: string; title: string; body: string };
  onDone: () => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 4200);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      className="pointer-events-auto hud-panel-green px-4 py-3"
      role="status"
    >
      <p className="font-hud text-[10px] tracking-[0.18em] text-lime">
        {toast.kind === "achievement" ? "ACHIEVEMENT UNLOCKED" : "SECRET FOUND"}
      </p>
      <p className="mt-1 font-hud text-sm font-bold uppercase text-mist">{toast.title}</p>
      <p className="mt-1 font-hud text-[12px] text-lime">{toast.body}</p>
    </motion.div>
  );
}
