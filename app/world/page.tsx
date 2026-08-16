import { SectionTitle } from "@/components/game-ui/SectionTitle";
import { CharacterCard } from "@/components/world/CharacterCard";
import { ItemCard } from "@/components/world/ItemCard";
import { LocationCard } from "@/components/world/LocationCard";
import { StageArt } from "@/components/game-ui/StageArt";
import { getCharacters, getItems, getLocations, getLore } from "@/lib/content";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "WORLD",
  description: "Characters, locations, items, and lore from the Stylez universe.",
};

export default function WorldPage() {
  const characters = getCharacters();
  const locations = getLocations();
  const itemList = getItems();
  const lore = getLore();

  return (
    <div className="space-y-10">
      <SectionTitle
        kicker="CODEX"
        title="WORLD"
        subtitle="Welcome to Southside. People become characters. Places become levels. Objects keep secrets."
      />
      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-3xl uppercase">CHARACTERS</h2>
          <Link href="/world/characters" className="font-hud text-[10px] tracking-[0.18em] text-gold">
            OPEN FILE
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {characters.map((character) => (
            <CharacterCard key={character.id} character={character} />
          ))}
        </div>
      </section>
      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-3xl uppercase">LOCATIONS</h2>
          <Link href="/world/locations" className="font-hud text-[10px] tracking-[0.18em] text-gold">
            ENTER
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {locations.map((location) => (
            <LocationCard key={location.id} location={location} />
          ))}
        </div>
      </section>
      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-3xl uppercase">ITEMS</h2>
          <Link href="/world/items" className="font-hud text-[10px] tracking-[0.18em] text-gold">
            OPEN FILE
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {itemList.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>
      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-3xl uppercase">LORE</h2>
          <Link href="/world/lore" className="font-hud text-[10px] tracking-[0.18em] text-gold">
            OPEN FILE
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {lore.map((entry) => (
            <Link key={entry.id} href={`/world/lore/${entry.slug}`} className="hud-panel hud-lift overflow-hidden">
              <div className="relative h-28 overflow-hidden">
                <StageArt seed={entry.id} />
                <div className="absolute inset-0 bg-gradient-to-t from-void via-void/20 to-transparent" />
              </div>
              <div className="p-4">
                <p className="hud-label text-lime">LORE FILE</p>
                <h3 className="mt-2 font-display text-xl uppercase">{entry.title}</h3>
                <p className="mt-2 text-sm text-muted">{entry.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
