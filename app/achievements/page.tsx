"use client";

import { SectionTitle } from "@/components/game-ui/SectionTitle";
import { StageArt } from "@/components/game-ui/StageArt";
import { achievements } from "@/data/achievements";
import { collectibles } from "@/data/collectibles";
import { usePlayer } from "@/components/player/PlayerProvider";

export default function AchievementsPage() {
  const { save } = usePlayer();

  return (
    <div>
      <SectionTitle
        kicker="PLAYER 1"
        title="SAVE DATA"
        subtitle="Local for now. Accounts and Supabase sync come later. Do not force a login."
      />
      <div className="hud-panel relative mb-6 overflow-hidden">
        <div className="relative h-28 overflow-hidden">
          <StageArt seed="save-data" />
          <div className="absolute inset-0 bg-void/60" />
        </div>
        <div className="grid grid-cols-3 gap-3 p-4 text-center">
          <div>
            <p className="hud-label text-cyan">LEVEL</p>
            <p className="font-display text-2xl text-green">{String(save.level).padStart(2, "0")}</p>
          </div>
          <div>
            <p className="hud-label text-cyan">TOKENS</p>
            <p className="font-display text-2xl text-green">{save.tokens}</p>
          </div>
          <div>
            <p className="hud-label text-cyan">SECRETS</p>
            <p className="font-display text-2xl text-green">{save.eggs.length}</p>
          </div>
        </div>
      </div>
      <h2 className="mb-3 font-display text-xl uppercase leading-snug">ACHIEVEMENTS</h2>
      <div className="grid gap-3">
        {achievements.map((item) => {
          const unlocked = save.achievements.includes(item.id);
          return (
            <article
              key={item.id}
              className={`hud-panel flex items-center gap-4 overflow-hidden p-0 ${unlocked ? "" : "opacity-55"}`}
            >
              <div className="relative h-20 w-24 shrink-0 overflow-hidden">
                <StageArt seed={item.id} />
              </div>
              <div className="py-3 pr-4">
                <p className="font-display text-sm uppercase leading-snug">{item.name}</p>
                <p className="text-sm text-muted">{item.description}</p>
              </div>
              <p className="ml-auto pr-4 font-hud text-base tracking-wide text-green">
                {unlocked ? "CLEARED" : "LOCKED"}
              </p>
            </article>
          );
        })}
      </div>
      <h2 className="mt-8 mb-3 font-display text-xl uppercase leading-snug">COLLECTIBLES</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {collectibles.map((item) => {
          const found = save.collectibles.includes(item.id);
          return (
            <article key={item.id} className={`hud-panel overflow-hidden ${found ? "" : "opacity-55"}`}>
              <div className="relative h-28 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="p-4">
                <p className="hud-label text-lime">{item.rarity.toUpperCase()}</p>
                <h3 className="font-display text-sm uppercase leading-snug">{item.name}</h3>
                <p className="mt-1 text-sm text-muted">{item.description}</p>
                <p className="mt-2 font-hud text-base text-cyan">{found ? "IN INVENTORY" : "MISSING"}</p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
