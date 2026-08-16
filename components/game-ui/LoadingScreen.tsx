"use client";

import { StageArt } from "@/components/game-ui/StageArt";
import { motion } from "framer-motion";

export function LoadingScreen({ label = "LOADING SOUTHSIDE..." }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg">
      <div className="relative w-[min(28rem,90vw)] overflow-hidden border border-cyan/30 bg-panel p-0">
        <div className="relative h-28 overflow-hidden">
          <StageArt seed="loading" />
          <div className="absolute inset-0 bg-void/45" />
        </div>
        <div className="p-6">
          <p className="hud-label text-lime">SYSTEM</p>
          <p className="mt-3 font-pixel text-[10px] leading-6 text-cream">{label}</p>
          <div className="hp-track mt-5">
            <motion.div
              className="hp-fill"
              initial={{ width: "4%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.05, ease: "easeInOut" }}
            />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="boot-scan absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-green/20 to-transparent" />
        </div>
      </div>
    </div>
  );
}
