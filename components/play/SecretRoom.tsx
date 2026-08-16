"use client";

import { StageArt } from "@/components/game-ui/StageArt";
import { STAGE_THRONE } from "@/lib/placeholders";
import { usePlayer } from "@/components/player/PlayerProvider";
import { useEffect, useRef, useState } from "react";

const W = 320;
const H = 224;
const SPEED = 2.2;

export function SecretRoom() {
  const { discoverEgg, markGamePlayed, save } = usePlayer();
  const pos = useRef({ x: 40, y: 150 });
  const keys = useRef<Set<string>>(new Set());
  const got = useRef(save.eggs.includes("secret-room"));
  const [sprite, setSprite] = useState({ x: 40, y: 150 });

  useEffect(() => {
    markGamePlayed("secret-room");
    const down = (event: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
        event.preventDefault();
      }
      keys.current.add(event.key.toLowerCase());
    };
    const up = (event: KeyboardEvent) => {
      keys.current.delete(event.key.toLowerCase());
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    let frame = 0;
    const loop = () => {
      const k = keys.current;
      let { x, y } = pos.current;
      const prevX = x;
      const prevY = y;
      if (k.has("arrowleft") || k.has("a")) x -= SPEED;
      if (k.has("arrowright") || k.has("d")) x += SPEED;
      if (k.has("arrowup") || k.has("w")) y -= SPEED;
      if (k.has("arrowdown") || k.has("s")) y += SPEED;
      x = Math.max(16, Math.min(W - 32, x));
      y = Math.max(48, Math.min(H - 40, y));
      pos.current = { x, y };
      if (!got.current && Math.hypot(x - 268, y - 64) < 18) {
        got.current = true;
        discoverEgg("secret-room", {
          kind: "secret",
          title: "SECRET FOUND",
          body: "+1 STYLEZ TOKEN",
        });
      }
      if (x !== prevX || y !== prevY) setSprite({ x, y });
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [discoverEgg, markGamePlayed]);

  const hold = (key: string, active: boolean) => {
    if (active) keys.current.add(key);
    else keys.current.delete(key);
  };

  return (
    <div className="mx-auto w-full max-w-[320px]">
      <div
        className="relative overflow-hidden border-2 border-gold bg-[#1a1014]"
        style={{ width: W, height: H, maxWidth: "100%" }}
        role="application"
        aria-label="Secret room. Move with arrow keys, WASD, or on-screen controls."
      >
        <StageArt src={STAGE_THRONE} className="absolute inset-0 opacity-80" />
        <div className="absolute inset-0 bg-void/35" />
        <div className="absolute inset-x-0 top-0 z-10 h-8 border-b border-line bg-bg-2/90 px-2 font-hud text-[10px] leading-8 tracking-[0.16em] text-gold">
          SOUTHSIDE ROOM 00
        </div>
        <div
          className="absolute z-10 size-4 bg-gold"
          style={{ left: 268, top: 64 }}
          aria-hidden="true"
        />
        <div
          className="absolute z-10"
          style={{ left: sprite.x, top: sprite.y, width: 16, height: 24 }}
          aria-hidden="true"
        >
          <span className="mx-auto block h-3 w-3 bg-cream" />
          <span className="mt-[1px] block h-4 w-4 bg-red" />
          <span className="mt-[1px] flex justify-between">
            <i className="block h-3 w-[5px] bg-blue" />
            <i className="block h-3 w-[5px] bg-blue" />
          </span>
        </div>
        <p className="absolute bottom-1 left-2 z-10 font-hud text-[9px] tracking-[0.14em] text-muted">
          ARROWS / WASD
        </p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 sm:hidden">
        <span />
        <PadButton label="UP" onHold={(active) => hold("w", active)} />
        <span />
        <PadButton label="LEFT" onHold={(active) => hold("a", active)} />
        <PadButton label="DOWN" onHold={(active) => hold("s", active)} />
        <PadButton label="RIGHT" onHold={(active) => hold("d", active)} />
      </div>
    </div>
  );
}

function PadButton({ label, onHold }: { label: string; onHold: (active: boolean) => void }) {
  return (
    <button
      type="button"
      className="min-h-12 border-2 border-line bg-bg-3 font-hud text-[10px] tracking-[0.16em] text-cream"
      aria-label={label}
      onPointerDown={(event) => {
        event.preventDefault();
        onHold(true);
      }}
      onPointerUp={() => onHold(false)}
      onPointerLeave={() => onHold(false)}
      onPointerCancel={() => onHold(false)}
    >
      {label}
    </button>
  );
}
