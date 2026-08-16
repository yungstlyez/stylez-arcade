"use client";

import { cn } from "@/lib/cn";

export function Waveform({ active = false, bars = 36 }: { active?: boolean; bars?: number }) {
  return (
    <div className="flex h-10 items-end gap-[3px]" aria-hidden="true">
      {Array.from({ length: bars }, (_, index) => (
        <span
          key={index}
          className={cn("w-[3px] bg-lime/80", active && "wave-bar")}
          style={{
            height: `${14 + ((index * 17) % 26)}px`,
            animationDelay: `${(index % 8) * 0.08}s`,
          }}
        />
      ))}
    </div>
  );
}
