import { SecretRoom } from "@/components/play/SecretRoom";
import { SectionTitle } from "@/components/game-ui/SectionTitle";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SECRET",
  robots: { index: false, follow: false },
};

export default function SecretPage() {
  return (
    <div>
      <SectionTitle
        kicker="UNLISTED FILE"
        title="ROOM 00"
        subtitle="A tiny room under the map. Move the pixel. Take what glints."
      />
      <SecretRoom />
      <p className="mt-6 max-w-md text-sm text-muted">
        You were not supposed to have this URL. That is why it works.
      </p>
    </div>
  );
}
