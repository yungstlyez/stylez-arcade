import type { GameRecord } from "@/types";

export const games: GameRecord[] = [
  {
    id: "game-bodega-run",
    slug: "bodega-run",
    name: "BODEGA RUN",
    thumbnail: "/art/placeholders/stage-skyline.gif",
    description:
      "Grab the sandwich from the deli and run the New York sidewalk. Jump hydrants, trash bags, and street clutter in this endless side-scroller.",
    soundtrack: "flatbed-freestyle",
    status: "beta",
    releaseDate: "NOW",
    achievements: ["day-one"],
    highScore: 0,
  },
  {
    id: "game-unknown",
    slug: "unknown-cabinet",
    name: "???",
    thumbnail: "/art/placeholders/stage-throne.gif",
    description: "A silhouette in the cabinet. Coming soon.",
    soundtrack: "flatbed-freestyle",
    status: "locked",
    releaseDate: "UNKNOWN",
    achievements: [],
    highScore: 0,
  },
];
