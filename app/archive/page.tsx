import { ComingSoonScreen } from "@/components/game-ui/ComingSoonScreen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ARCHIVE",
  description: "Recovered media, previous eras, and damaged files.",
};

export default function ArchivePage() {
  return (
    <ComingSoonScreen
      title="ARCHIVE"
      blurb="Old save files, flyers, and previous eras will live here. The drawers are still locked."
    />
  );
}
