"use client";

import { LogoMark } from "@/components/game-ui/LogoMark";
import { PixelLogo } from "@/components/game-ui/PixelLogo";
import { useAudio } from "@/components/audio/AudioProvider";
import { site } from "@/data/site";
import { getFeaturedRelease, releaseToTrack } from "@/lib/content";
import { STAGE_EL_TRAIN } from "@/lib/placeholders";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";

export function PressStartScreen({ onStart, hidden = false }: { onStart: () => void; hidden?: boolean }) {
  const reduce = useReducedMotion();
  const { setMuffled, bootTitleTrack } = useAudio();

  useEffect(() => {
    const next = releaseToTrack(getFeaturedRelease());
    setMuffled(true, 0);
    bootTitleTrack(next);
  }, [bootTitleTrack, setMuffled]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (hidden) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onStart();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hidden, onStart]);

  return (
    <motion.section
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-void px-5 text-center"
      initial={reduce || hidden ? false : { opacity: 0 }}
      animate={{ opacity: hidden ? 0 : 1 }}
      aria-hidden={hidden || undefined}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={STAGE_EL_TRAIN}
        alt=""
        className="pixelated absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-void/45 via-void/35 to-void/80" />
      <div className="crt-vignette absolute inset-0" />

      <LogoMark className="relative mb-5 h-72 w-72 sm:h-96 sm:w-96" />
      <p className="relative font-hud text-xs tracking-[0.38em] text-cyan glow-cyan">YOU FOUND IT.</p>
      <h1 className="relative mt-4">
        <PixelLogo size="hero" />
      </h1>
      <p className="relative mt-6 max-w-sm font-hud text-sm tracking-[0.22em] text-lime glow-green">
        {site.byline}
      </p>

      <button
        onClick={onStart}
        disabled={hidden}
        className="relative mt-12 min-h-12 rounded-md border border-lime bg-green/20 px-6 font-pixel text-[10px] tracking-[0.2em] text-lime shadow-[0_0_20px_rgba(98,255,91,0.35)]"
      >
        <span className={reduce ? "" : "blink"}>PRESS START</span>
      </button>

      <p className="relative mt-16 font-hud text-[11px] tracking-[0.2em] text-muted">
        {site.instagram} · PLAYER 1
      </p>
    </motion.section>
  );
}
