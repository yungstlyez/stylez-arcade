"use client";

import { PixelButton } from "@/components/game-ui/PixelButton";
import { StageArt } from "@/components/game-ui/StageArt";
import { useEffect } from "react";

export function RetroModal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="retro-modal-title"
        className="hud-panel w-full max-w-md overflow-hidden p-0"
      >
        <div className="relative h-24 overflow-hidden">
          <StageArt seed={title} />
          <div className="absolute inset-0 bg-void/50" />
        </div>
        <div className="flex items-center justify-between border-b border-cyan/20 bg-navy px-4 py-2">
          <h2 id="retro-modal-title" className="font-display text-sm tracking-wide text-mist">
            {title}
          </h2>
          <PixelButton variant="ghost" onClick={onClose} className="min-h-9 px-3">
            CLOSE
          </PixelButton>
        </div>
        <div className="p-4 text-sm leading-6 text-muted">{children}</div>
      </div>
    </div>
  );
}
