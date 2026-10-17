"use client";

import { useEffect, useRef, useState } from "react";

type ObstacleKind = "hydrant" | "trash" | "crate" | "scooter";

type Obstacle = {
  x: number;
  w: number;
  h: number;
  kind: ObstacleKind;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
};

const GRAVITY = 2200;
const JUMP_V = -780;
const GROUND_Y_RATIO = 0.78;
/** Drawn player size (sprite source cells are 147×212). */
const PLAYER_W = 72;
const PLAYER_H = 104;
const SHEET_SRC = "/art/bodega/runner-sheet.png";
const FRAME_W = 147;
const FRAME_H = 212;
const FRAME_IDLE = 0;
const FRAME_RUN = [1, 2, 3, 4] as const;
const FRAME_JUMP = 5;
const FRAME_LAND = 6;

function kindSize(kind: ObstacleKind) {
  switch (kind) {
    case "hydrant":
      return { w: 34, h: 46 };
    case "trash":
      return { w: 48, h: 34 };
    case "crate":
      return { w: 52, h: 42 };
    case "scooter":
      return { w: 64, h: 38 };
  }
}

export function BodegaRun() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hud, setHud] = useState({ score: 0, best: 0, state: "ready" as "ready" | "run" | "dead" });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let best = 0;
    try {
      best = Number(window.localStorage.getItem("bodega-run-best") || 0) || 0;
    } catch {
      best = 0;
    }

    let raf = 0;
    let running = false;
    let dead = false;
    let score = 0;
    let speed = 320;
    let spawnTimer = 0;
    let world = 0;
    let last = performance.now();
    let landTimer = 0;
    let wasAirborne = false;
    let animTime = 0;

    const sheet = new Image();
    sheet.src = SHEET_SRC;
    let sheetReady = false;
    sheet.onload = () => {
      sheetReady = true;
    };

    const player = {
      x: 88,
      y: 0,
      vy: 0,
      onGround: true,
      sandwich: true,
    };

    let obstacles: Obstacle[] = [];
    let particles: Particle[] = [];
    let groundY = 0;
    let W = 800;
    let H = 450;

    const resize = () => {
      const parent = canvas.parentElement;
      const w = parent?.clientWidth || 800;
      const h = Math.max(280, Math.round(w * 9 / 16));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      W = w;
      H = h;
      groundY = H * GROUND_Y_RATIO;
      if (player.onGround) player.y = groundY - PLAYER_H;
    };

    const reset = () => {
      dead = false;
      running = true;
      score = 0;
      speed = 320;
      spawnTimer = 0.6;
      world = 0;
      landTimer = 0;
      wasAirborne = false;
      animTime = 0;
      obstacles = [];
      particles = [];
      player.vy = 0;
      player.onGround = true;
      player.y = groundY - PLAYER_H;
      player.sandwich = true;
      setHud({ score: 0, best, state: "run" });
    };

    const jump = () => {
      if (dead) {
        reset();
        return;
      }
      if (!running) {
        reset();
        return;
      }
      if (player.onGround) {
        player.vy = JUMP_V;
        player.onGround = false;
      }
    };

    const spawn = () => {
      const kinds: ObstacleKind[] = ["hydrant", "trash", "crate", "scooter"];
      const kind = kinds[Math.floor(Math.random() * kinds.length)];
      const size = kindSize(kind);
      obstacles.push({
        x: W + 40 + Math.random() * 80,
        w: size.w,
        h: size.h,
        kind,
      });
    };

    const collide = (o: Obstacle) => {
      const px = player.x + 18;
      const py = player.y + 18;
      const pw = PLAYER_W - 34;
      const ph = PLAYER_H - 22;
      const ox = o.x;
      const oy = groundY - o.h;
      return px < ox + o.w && px + pw > ox && py < oy + o.h && py + ph > oy;
    };

    const playerFrame = () => {
      if (dead) return FRAME_LAND;
      if (!running) return FRAME_IDLE;
      if (!player.onGround) return FRAME_JUMP;
      if (landTimer > 0) return FRAME_LAND;
      const idx = Math.floor(animTime * 10) % FRAME_RUN.length;
      return FRAME_RUN[idx];
    };

    const burst = (x: number, y: number) => {
      for (let i = 0; i < 14; i++) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 280,
          vy: -Math.random() * 320 - 40,
          life: 0.45 + Math.random() * 0.35,
        });
      }
    };

    const drawBg = () => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#1a0f33");
      g.addColorStop(0.55, "#120a22");
      g.addColorStop(1, "#0a0614");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // distant buildings
      const scroll = world * 0.25;
      for (let i = 0; i < 12; i++) {
        const bw = 70 + ((i * 37) % 50);
        const bh = 80 + ((i * 53) % 140);
        const bx = ((i * 110 - scroll) % (W + 140)) - 70;
        ctx.fillStyle = i % 2 ? "#1e1438" : "#26184a";
        ctx.fillRect(bx, groundY - bh - 8, bw, bh);
        ctx.fillStyle = "rgba(255, 220, 120, 0.35)";
        for (let wy = groundY - bh + 12; wy < groundY - 20; wy += 18) {
          for (let wx = bx + 8; wx < bx + bw - 10; wx += 14) {
            if ((wx + wy + i) % 5 !== 0) ctx.fillRect(wx, wy, 5, 7);
          }
        }
      }

      // sidewalk
      ctx.fillStyle = "#2a2438";
      ctx.fillRect(0, groundY, W, H - groundY);
      ctx.fillStyle = "#3a3350";
      ctx.fillRect(0, groundY, W, 6);
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 2;
      const stripe = world % 48;
      for (let x = -stripe; x < W; x += 48) {
        ctx.beginPath();
        ctx.moveTo(x, groundY + 22);
        ctx.lineTo(x + 26, groundY + 22);
        ctx.stroke();
      }

      // bodega awning cue on the left at start
      if (world < 420) {
        const ax = 24 - world * 0.4;
        ctx.fillStyle = "#c41e3a";
        ctx.fillRect(ax, groundY - 110, 120, 18);
        ctx.fillStyle = "#f5f0e6";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText("BODEGA", ax + 28, groundY - 97);
      }
    };

    const drawPlayer = () => {
      const x = player.x;
      const y = player.y;

      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath();
      ctx.ellipse(x + PLAYER_W / 2, groundY - 2, 26, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      const frame = playerFrame();
      if (sheetReady) {
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(
          sheet,
          frame * FRAME_W,
          0,
          FRAME_W,
          FRAME_H,
          x,
          y,
          PLAYER_W,
          PLAYER_H,
        );
      } else {
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(x + 16, y + 20, 36, 60);
      }
    };

    const drawObstacle = (o: Obstacle) => {
      const x = o.x;
      const y = groundY - o.h;
      if (o.kind === "hydrant") {
        ctx.fillStyle = "#e11d48";
        ctx.fillRect(x + 6, y, 16, o.h);
        ctx.fillRect(x, y + 8, 28, 10);
      } else if (o.kind === "trash") {
        ctx.fillStyle = "#334155";
        ctx.fillRect(x, y + 6, o.w, o.h - 6);
        ctx.fillStyle = "#22c55e";
        ctx.fillRect(x + 4, y, o.w - 8, 10);
      } else if (o.kind === "crate") {
        ctx.fillStyle = "#a16207";
        ctx.fillRect(x, y, o.w, o.h);
        ctx.strokeStyle = "#713f12";
        ctx.strokeRect(x + 2, y + 2, o.w - 4, o.h - 4);
      } else {
        ctx.fillStyle = "#0ea5e9";
        ctx.fillRect(x + 8, y + 8, o.w - 12, 12);
        ctx.fillStyle = "#111";
        ctx.beginPath();
        ctx.arc(x + 12, y + o.h - 4, 7, 0, Math.PI * 2);
        ctx.arc(x + o.w - 10, y + o.h - 4, 7, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawHud = () => {
      ctx.fillStyle = "rgba(8,5,15,0.45)";
      ctx.fillRect(12, 12, 160, 44);
      ctx.strokeStyle = "rgba(167,139,250,0.45)";
      ctx.strokeRect(12, 12, 160, 44);
      ctx.fillStyle = "#e8fbf8";
      ctx.font = "600 12px Orbitron, sans-serif";
      ctx.fillText(`BLOCKS  ${Math.floor(score)}`, 24, 32);
      ctx.fillStyle = "#c4b5fd";
      ctx.fillText(`BEST  ${best}`, 24, 48);

      if (!running && !dead) {
        ctx.fillStyle = "rgba(8,5,15,0.55)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#62ff5b";
        ctx.font = "700 22px Orbitron, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("BODEGA RUN", W / 2, H / 2 - 24);
        ctx.fillStyle = "#e8fbf8";
        ctx.font = "14px sans-serif";
        ctx.fillText("Tap / Space / Click to grab the sandwich & run", W / 2, H / 2 + 8);
        ctx.textAlign = "left";
      }

      if (dead) {
        ctx.fillStyle = "rgba(8,5,15,0.6)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#ff2ac3";
        ctx.font = "700 22px Orbitron, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("DROPPED THE SANDWICH", W / 2, H / 2 - 16);
        ctx.fillStyle = "#e8fbf8";
        ctx.font = "14px sans-serif";
        ctx.fillText(`Score ${Math.floor(score)} · Tap to run again`, W / 2, H / 2 + 14);
        ctx.textAlign = "left";
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;

      if (running && !dead) {
        speed = Math.min(620, 320 + score * 2.2);
        world += speed * dt;
        score += (speed * dt) / 18;
        animTime += dt;
        spawnTimer -= dt;
        if (spawnTimer <= 0) {
          spawn();
          spawnTimer = Math.max(0.75, 1.55 - score * 0.012) + Math.random() * 0.45;
        }

        if (landTimer > 0) landTimer = Math.max(0, landTimer - dt);

        player.vy += GRAVITY * dt;
        player.y += player.vy * dt;
        if (player.y >= groundY - PLAYER_H) {
          if (wasAirborne) landTimer = 0.16;
          player.y = groundY - PLAYER_H;
          player.vy = 0;
          player.onGround = true;
          wasAirborne = false;
        } else {
          wasAirborne = true;
          player.onGround = false;
        }

        obstacles = obstacles
          .map((o) => ({ ...o, x: o.x - speed * dt }))
          .filter((o) => o.x + o.w > -40);

        for (const o of obstacles) {
          if (collide(o)) {
            dead = true;
            running = false;
            player.sandwich = false;
            burst(player.x + PLAYER_W / 2, player.y + PLAYER_H / 2);
            best = Math.max(best, Math.floor(score));
            try {
              window.localStorage.setItem("bodega-run-best", String(best));
            } catch {
              /* ignore */
            }
            setHud({ score: Math.floor(score), best, state: "dead" });
            break;
          }
        }

        if (!dead) setHud({ score: Math.floor(score), best, state: "run" });
      }

      particles = particles
        .map((p) => ({
          ...p,
          x: p.x + p.vx * dt,
          y: p.y + p.vy * dt,
          vy: p.vy + 900 * dt,
          life: p.life - dt,
        }))
        .filter((p) => p.life > 0);

      drawBg();
      for (const o of obstacles) drawObstacle(o);
      drawPlayer();
      for (const p of particles) {
        ctx.fillStyle = `rgba(255, 42, 195, ${Math.max(0, p.life)})`;
        ctx.fillRect(p.x, p.y, 4, 4);
      }
      drawHud();

      raf = requestAnimationFrame(tick);
    };

    resize();
    player.y = groundY - PLAYER_H;
    setHud({ score: 0, best, state: "ready" });
    raf = requestAnimationFrame(tick);

    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        jump();
      }
    };
    const onPointer = () => jump();
    window.addEventListener("keydown", onKey);
    canvas.addEventListener("pointerdown", onPointer);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-violet/35 bg-black shadow-[0_0_40px_rgba(139,92,246,0.2)]">
      <canvas ref={canvasRef} className="block w-full touch-none" aria-label="Bodega Run game" />
      <div className="pointer-events-none absolute right-3 top-3 rounded-full border border-violet/40 bg-void/50 px-3 py-1 font-hud text-[10px] tracking-[0.16em] text-violet backdrop-blur-md">
        {hud.state === "ready" ? "READY" : hud.state === "dead" ? "RETRY" : "RUNNING"} · {hud.score}
      </div>
    </div>
  );
}
