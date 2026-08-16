import { statusLabel } from "@/lib/cn";
import type { GameRecord } from "@/types";
import Link from "next/link";

export function ArcadeGameCard({ game }: { game: GameRecord }) {
  return (
    <Link href={`/play/${game.slug}`} className="hud-panel hud-lift group block overflow-hidden">
      <div className="cover-frame relative aspect-[4/5]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={game.thumbnail}
          alt={`${game.name} cabinet art`}
          className="h-full w-full object-cover pixelated"
        />
      </div>
      <div className="p-4">
        <p className="hud-label text-lime">{statusLabel(game.status)}</p>
        <h3 className="mt-1 font-display text-2xl uppercase">{game.name}</h3>
        <p className="mt-2 text-sm leading-6 text-muted">{game.description}</p>
      </div>
    </Link>
  );
}
