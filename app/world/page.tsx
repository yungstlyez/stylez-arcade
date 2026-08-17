import { ComingSoonScreen } from "@/components/game-ui/ComingSoonScreen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WORLD",
  description: "Characters, locations, items, and lore from the Stylez universe.",
};

export default function WorldPage() {
  return (
    <ComingSoonScreen
      title="WORLD"
      blurb="Characters, places, and the Southside map will live here. The codex is still being drawn."
    />
  );
}
