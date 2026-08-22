"use client";

import { OpenTerminalOnMount } from "@/components/chronicles/OpenTerminalOnMount";

export default function TerminalPage() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <OpenTerminalOnMount />
      <p className="hud-label text-lime">OPENING TERMINAL...</p>
    </div>
  );
}
