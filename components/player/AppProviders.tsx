"use client";

import { AudioProvider } from "@/components/audio/AudioProvider";
import { LibraryProvider } from "@/components/music/LibraryProvider";
import { ComingSoonProvider } from "@/components/game-ui/ComingSoonProvider";
import { ChronicleProvider } from "@/components/chronicles/ChronicleProvider";
import { PlayerProvider, usePlayer } from "@/components/player/PlayerProvider";
import type { ReactNode } from "react";

function AudioBridge({ children }: { children: ReactNode }) {
  const { markListened } = usePlayer();
  return <AudioProvider onListen={markListened}>{children}</AudioProvider>;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PlayerProvider>
      <AudioBridge>
        <LibraryProvider>
          <ComingSoonProvider>
            <ChronicleProvider>{children}</ChronicleProvider>
          </ComingSoonProvider>
        </LibraryProvider>
      </AudioBridge>
    </PlayerProvider>
  );
}
