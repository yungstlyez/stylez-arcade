"use client";

import { HomeHub } from "@/components/hub/HomeHub";
import { LoadingScreen } from "@/components/game-ui/LoadingScreen";
import { PressStartScreen } from "@/components/game-ui/PressStartScreen";
import { usePlayer } from "@/components/player/PlayerProvider";
import { useReducedMotion } from "framer-motion";
import { useState } from "react";

export default function HomePage() {
  const { save, ready, enterWorld } = usePlayer();
  const reduce = useReducedMotion();
  const [booting, setBooting] = useState(false);

  if (!ready) {
    return <div className="min-h-[100dvh] bg-bg" />;
  }

  if (booting) {
    return <LoadingScreen />;
  }

  if (!save.started) {
    return (
      <PressStartScreen
        onStart={() => {
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
    );
  }

  return <HomeHub />;
}
