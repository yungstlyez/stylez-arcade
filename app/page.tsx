"use client";

import { HomeHub } from "@/components/hub/HomeHub";
import { LoadingScreen } from "@/components/game-ui/LoadingScreen";
import { PressStartScreen } from "@/components/game-ui/PressStartScreen";
import { useAudio } from "@/components/audio/AudioProvider";
import { usePlayer } from "@/components/player/PlayerProvider";
import { useReducedMotion } from "framer-motion";
import { useState } from "react";

export default function HomePage() {
  const { save, ready, enterWorld } = usePlayer();
  const { setMuffled } = useAudio();
  const reduce = useReducedMotion();
  const [booting, setBooting] = useState(false);

  if (!ready) {
    return <div className="min-h-[100dvh] bg-bg" />;
  }

  if (!save.started || booting) {
    return (
      <>
        <PressStartScreen
          hidden={booting}
          onStart={() => {
            // Unmute only — keep whatever is already playing.
            setMuffled(false, reduce ? 0.18 : 1.15);
            setBooting(true);
            window.setTimeout(
              () => {
                enterWorld();
                setBooting(false);
              },
              reduce ? 180 : 1150,
            );
          }}
        />
        {booting ? <LoadingScreen /> : null}
      </>
    );
  }

  return <HomeHub />;
}
