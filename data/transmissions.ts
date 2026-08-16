import type { Mission, Transmission } from "@/types";

export const transmissions: Transmission[] = [
  {
    id: "tx-01",
    date: "2026-08-16",
    tag: "IG",
    title: "New Instagram Post",
    body: "A still from the night. Southside in the glass.",
    href: "/online",
    ago: "2h ago",
  },
  {
    id: "tx-02",
    date: "2026-08-16",
    tag: "LOG",
    title: "New Chronicle 0028",
    body: "The world comes online. Save point written.",
    href: "/chronicles/the-world-comes-online",
    ago: "4h ago",
  },
  {
    id: "tx-03",
    date: "2026-08-16",
    tag: "LIVE",
    title: "Stream Tonight",
    body: "Frequency opens after dark. Bring headphones.",
    href: "/online",
    ago: "8h ago",
  },
  {
    id: "tx-04",
    date: "2026-08-15",
    tag: "BEAT",
    title: "New Beat Preview",
    body: "A loop leaking from the studio. Not a chapter yet.",
    href: "/music",
    ago: "1d ago",
  },
];

export const currentMission: Mission = {
  id: "mission-flatbed",
  title: "FLATBED FREESTYLE",
  brief: "Unlock a hidden scene",
  href: "/music/flatbed-freestyle",
  locationHint: "Southside",
};
