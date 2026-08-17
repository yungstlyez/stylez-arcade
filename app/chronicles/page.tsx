import { ComingSoonScreen } from "@/components/game-ui/ComingSoonScreen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "STYLEZ CHRONICLES",
  description: "Journal, mission logs, and field notes from Callmestylez.",
};

export default function ChroniclesPage() {
  return (
    <ComingSoonScreen
      title="CHRONICLES"
      blurb="Mission logs and field notes will live here. The nights are still being written."
    />
  );
}
