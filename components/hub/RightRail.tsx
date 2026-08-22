"use client";

import { LogoMark } from "@/components/game-ui/LogoMark";
import { achievements } from "@/data/achievements";
import { hubSocials } from "@/data/socials";
import { usePlayer } from "@/components/player/PlayerProvider";
import { site } from "@/data/site";
import { xpFromSave } from "@/lib/xp";
import { cn } from "@/lib/cn";
import { cueUiSound } from "@/lib/ui-sound";
import Link from "next/link";

export function RightRail({ compact = false }: { compact?: boolean }) {
  const { save } = usePlayer();
  const { xp, max } = xpFromSave(save);
  const unlocked =
    achievements.find((item) => item.id === "first-contact" && save.achievements.includes(item.id)) ??
    achievements.find((item) => save.achievements.includes(item.id));

  return (
    <aside className={cn("flex h-full min-h-0 flex-col gap-3", compact && "h-auto")}>
      <section className="hud-panel flex shrink-0 flex-col p-3">
        <p className="hud-label text-cyan">PLAYER STATS</p>
        <div className="mt-3 flex items-center gap-3">
          <span className="cover-frame size-14 shrink-0 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={site.portrait} alt="" className="size-14 object-cover" />
          </span>
          <div>
            <p className="font-display text-[11px] text-lime">LEVEL {String(save.level).padStart(2, "0")}</p>
            <p className="font-hud text-[11px] text-cyan">
              STYLEZ TOKENS {String(save.tokens).padStart(3, "0")}
            </p>
          </div>
        </div>
        <div className="hp-track mt-3">
          <div className="hp-fill" style={{ width: `${(xp / max) * 100}%` }} />
        </div>
        <p className="mt-1 font-hud text-[10px] text-muted">
          XP {xp} / {max}
        </p>
        <ul className="mt-3 space-y-1 font-hud text-[11px]">
          <Stat label="ACHIEVEMENTS" value={`${String(save.achievements.length).padStart(2, "0")} / 20`} />
          <Stat label="EASTER EGGS" value={`${String(save.eggs.length).padStart(2, "0")} / 15`} />
          <Stat label="GAMES PLAYED" value={String(save.gamesPlayed.length).padStart(2, "0")} />
        </ul>
      </section>

      <section className="hud-panel-pink flex min-h-0 flex-1 flex-col overflow-hidden p-3.5">
        <div className="flex items-center justify-between gap-2">
          <p className="hud-label text-[11px] text-pink">SOCIALS</p>
          <p className="flex items-center gap-1.5 hud-label text-[11px] text-magenta">
            <i className="pulse-dot size-2 bg-magenta" />
            LIVE
          </p>
        </div>
        <ul className="mt-4 flex min-h-0 flex-1 flex-col justify-between gap-4">
          {hubSocials.map((item) => (
            <li key={item.id} className="min-w-0">
              <p className="flex flex-wrap gap-x-2 gap-y-0.5">
                {item.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    onMouseEnter={() => cueUiSound("hover")}
                    className="hud-label text-[10px] text-pink hover:text-lime"
                  >
                    {link.label}
                  </a>
                ))}
              </p>
              <a
                href={item.links[0].href}
                target="_blank"
                rel="noreferrer"
                onMouseEnter={() => cueUiSound("hover")}
                className="mt-1 block w-full break-words font-display text-[0.85rem] leading-snug text-mist hover:text-lime xl:text-[0.95rem]"
              >
                {item.handle}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="hud-panel-green hud-scan achieve-pulse relative shrink-0 p-3">
        <p className="hud-label text-lime">ACHIEVEMENT UNLOCKED</p>
        {unlocked ? (
          <>
            <div className="mt-3 flex items-center gap-3">
              <LogoMark className="size-40 shrink-0" />
              <div>
                <p className="font-pixel text-[11px] leading-5 text-mist">{unlocked.name}</p>
                <p className="mt-1 text-sm text-muted">
                  {unlocked.id === "first-contact" ? "Entered the world." : unlocked.description}
                </p>
              </div>
            </div>
            <p className="mt-3 font-display text-[11px] text-lime">+10 TOKENS</p>
          </>
        ) : (
          <p className="mt-3 text-sm text-muted">No signal yet. Press start.</p>
        )}
        <Link href="/achievements" className="mt-3 inline-block hud-label text-lime">
          VIEW ALL ACHIEVEMENTS
        </Link>
      </section>

      <Link href="/secret" className="self-end font-hud text-[10px] tracking-[0.3em] text-ocean hover:text-lime">
        00
      </Link>
    </aside>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="text-muted">{label}</span>
      <span className="text-lime">{value}</span>
    </li>
  );
}
