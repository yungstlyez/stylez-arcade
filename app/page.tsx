"use client";

import { HomeHub } from "@/components/hub/HomeHub";
import { usePlayer } from "@/components/player/PlayerProvider";
import { useEffect } from "react";

export default function HomePage() {
  const { save, ready, enterWorld } = usePlayer();

  useEffect(() => {
    if (ready && !save.started) enterWorld();
  }, [enterWorld, ready, save.started]);

  if (!ready) {
    return <div className="min-h-[100dvh] bg-bg" />;
  }

  return <HomeHub />;
}
