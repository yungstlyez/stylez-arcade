import { ComingSoonScreen } from "@/components/game-ui/ComingSoonScreen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ONLINE",
  description: "External networks for Callmestylez.",
};

export default function OnlinePage() {
  return (
    <ComingSoonScreen
      title="ONLINE"
      blurb="Transmissions and outside networks will jack in here. The signal is still warming up."
    />
  );
}
