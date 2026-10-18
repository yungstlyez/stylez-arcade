"use client";

import { LogoMark } from "@/components/game-ui/LogoMark";
import { PixelLogo } from "@/components/game-ui/PixelLogo";
import { useAudio } from "@/components/audio/AudioProvider";
import { site } from "@/data/site";
import { STAGE_EL_TRAIN } from "@/lib/placeholders";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";

export function PressStartScreen({ onStart, hidden = false }: { onStart: () => void; hidden?: boolean }) {
  const reduce = useReducedMotion();
  const { setMuffled } = useAudio();

  useEffect(() => {
    // Title screen: muffle only — do not start or switch tracks.
    setMuffled(true, 0);
  }, [setMuffled]);

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
        className="absolute inset-0 h-full w-full scale-105 object-cover blur-[2px]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-void/55 via-void/45 to-void/85" />
      <div className="crt-vignette absolute inset-0" />

      <div className="hud-panel relative flex max-w-lg flex-col items-center px-8 py-10 sm:px-12 sm:py-12">
        <LogoMark className="mb-5 h-56 w-56 sm:h-72 sm:w-72" />
        <p className="font-hud text-xs tracking-[0.38em] text-cyan glow-cyan">YOU FOUND IT.</p>
        <h1 className="mt-4">
          <PixelLogo size="hero" />
        </h1>
        <p className="mt-6 max-w-sm font-hud text-sm tracking-[0.22em] text-lime glow-green">
          {site.byline}
        </p>

        <button
          onClick={onStart}
          disabled={hidden}
          className="mt-12 min-h-12 rounded-full border border-lime/80 bg-green/25 px-8 font-display text-[11px] tracking-[0.22em] text-lime shadow-[0_0_28px_rgba(98,255,91,0.35)] backdrop-blur-md"
        >
          <span className={reduce ? "" : "blink"}>PRESS START</span>
        </button>

        <p className="mt-10 font-hud text-[11px] tracking-[0.2em] text-muted">
          {site.instagram} · PLAYER 1
        </p>
      </div>
    </motion.section>
  );
}
