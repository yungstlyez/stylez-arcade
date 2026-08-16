"use client";

import { AudioProvider } from "@/components/audio/AudioProvider";
import { PlayerProvider, usePlayer } from "@/components/player/PlayerProvider";
import type { ReactNode } from "react";

function AudioBridge({ children }: { children: ReactNode }) {
  const { markListened } = usePlayer();
  return <AudioProvider onListen={markListened}>{children}</AudioProvider>;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PlayerProvider>
      <AudioBridge>{children}</AudioBridge>
    </PlayerProvider>
  );
}
