import { ReleaseCard } from "@/components/music/ReleaseCard";
import { SectionTitle } from "@/components/game-ui/SectionTitle";
import { getReleases } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MUSIC",
  description: "Releases, mixes, and chapters from Callmestylez.",
};

export default function MusicPage() {
  const releases = getReleases();

  return (
    <div>
      <SectionTitle
        kicker="LIBRARY"
        title="MUSIC"
        subtitle="Songs are chapters. Press play when you are ready — nothing starts without you."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {releases.map((release) => (
          <ReleaseCard key={release.id} release={release} featured={release.featured} />
        ))}
      </div>
    </div>
  );
}
