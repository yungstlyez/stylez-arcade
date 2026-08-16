import { cn } from "@/lib/cn";
import type { Character } from "@/types";
import Link from "next/link";

export function CharacterCard({ character }: { character: Character }) {
  const locked = character.status === "locked";

  return (
    <Link
      href={`/world/characters/${character.slug}`}
      className={cn("hud-panel hud-lift group block overflow-hidden", locked && "opacity-80")}
    >
      <div className="cover-frame relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={character.portrait}
          alt={locked ? "Locked character portrait" : `${character.name} portrait`}
          className="aspect-[3/4] w-full object-cover pixelated"
        />
        <span className="absolute top-2 left-2 border border-lime/70 bg-void/80 px-2 py-1 hud-label text-lime">
          {locked ? "LOCKED" : character.role.toUpperCase()}
        </span>
      </div>
      <div className="p-4">
        <p className="hud-label text-cyan">{character.alias}</p>
        <h3 className="mt-1 font-display text-2xl uppercase">{character.name}</h3>
      </div>
    </Link>
  );
}
