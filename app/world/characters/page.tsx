import { SectionTitle } from "@/components/game-ui/SectionTitle";
import { ReturnLink } from "@/components/game-ui/ReturnLink";
import { CharacterCard } from "@/components/world/CharacterCard";
import { getCharacters } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "CHARACTERS" };

export default function CharactersPage() {
  return (
    <div>
      <ReturnLink href="/world" />
      <SectionTitle
        kicker="SELECT"
        title="CHARACTERS"
        subtitle="Fighting-game select screen energy. Real people enter the roster when the story is ready."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {getCharacters().map((character) => (
          <CharacterCard key={character.id} character={character} />
        ))}
      </div>
    </div>
  );
}
