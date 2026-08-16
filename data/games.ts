import type { GameRecord } from "@/types";

export const games: GameRecord[] = [
  {
    id: "game-flatbed-run",
    slug: "flatbed-run",
    name: "FLATBED RUN",
    thumbnail: "/art/placeholders/stage-el-train.gif",
    description:
      "Drive through Southside at night while FlatBed Freestyle plays. Avoid obstacles, collect items, and chase the high score.",
    soundtrack: "flatbed-freestyle",
    status: "locked",
    releaseDate: "TBD",
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
