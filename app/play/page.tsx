import { ArcadeGameCard } from "@/components/play/ArcadeGameCard";
import { SectionTitle } from "@/components/game-ui/SectionTitle";
import { getGames } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "STYLEZ ARCADE",
  description: "Browser games scored by Callmestylez.",
};

export default function PlayPage() {
  return (
    <div>
      <SectionTitle
        kicker="STYLEZ ARCADE"
        title="CHOOSE YOUR GAME"
        subtitle="Cabinets in a dark room. The soundtrack is the point. Most machines are still being wired."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {getGames().map((game) => (
          <ArcadeGameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
