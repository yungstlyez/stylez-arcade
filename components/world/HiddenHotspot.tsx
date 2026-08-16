"use client";

import { usePlayer } from "@/components/player/PlayerProvider";

export function HiddenHotspot({
  eggId,
  label,
  className,
}: {
  eggId: string;
  label: string;
  className?: string;
}) {
  const { discoverEgg, save } = usePlayer();
  const found = save.eggs.includes(eggId);

  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      onClick={() => {
        if (found) return;
        discoverEgg(eggId, {
          kind: "secret",
          title: "SECRET FOUND",
          body: "+1 STYLEZ TOKEN",
        });
      }}
    />
  );
}
