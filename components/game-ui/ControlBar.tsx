"use client";

import { useEffect, useState } from "react";

export function ControlBar({ className = "" }: { className?: string }) {
  const [now, setNow] = useState("88:88:88");

  useEffect(() => {
    const tick = () => {
      const date = new Date();
      setNow(
        date.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className={`flex items-center justify-between gap-3 border-t-2 border-white bg-bg px-3 py-1 font-hud text-[15px] text-cyan ${className}`}
    >
      <p className="flex flex-wrap gap-x-3">
        <span>A:SELECT</span>
        <span>B:RETURN</span>
        <span className="hidden sm:inline">X:MENU</span>
      </p>
      <p className="text-green">{now}</p>
    </div>
  );
}
