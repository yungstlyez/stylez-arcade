import { ChronicleCard } from "@/components/chronicles/ChronicleCard";
import { SectionTitle } from "@/components/game-ui/SectionTitle";
import { getChronicles } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "STYLEZ CHRONICLES",
  description: "Journal, mission logs, and field notes from Callmestylez.",
};

export default function ChroniclesPage() {
  const entries = getChronicles();

  return (
    <div>
      <SectionTitle
        kicker="SAVE FILES"
        title="STYLEZ CHRONICLES"
        subtitle="Mission logs. Field notes. The nights that would otherwise vanish into the timeline."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {entries.map((entry) => (
          <ChronicleCard key={entry.id} chronicle={entry} />
        ))}
      </div>
    </div>
  );
}
