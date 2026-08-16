import { ReturnLink } from "@/components/game-ui/ReturnLink";
import { SectionTitle } from "@/components/game-ui/SectionTitle";
import { LocationCard } from "@/components/world/LocationCard";
import { getLocations } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "LOCATIONS" };

export default function LocationsPage() {
  return (
    <div>
      <ReturnLink href="/world" />
      <SectionTitle
        kicker="MAP"
        title="LOCATIONS"
        subtitle="GTA guide energy. RPG map energy. Real Queens, rendered as a world."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {getLocations().map((location) => (
          <LocationCard key={location.id} location={location} />
        ))}
      </div>
    </div>
  );
}
