import type { LoreEntry } from "@/types";

export const lore: LoreEntry[] = [
  {
    id: "lore-save-us",
    slug: "stylez-will-save-us",
    title: "STYLEZ WILL SAVE US",
    excerpt: "Not a slogan. A load-bearing sentence.",
    content:
      "The phrase sits on the title screen because it already sat on the night. It is half prayer, half joke, half promise — the kind of line a neighborhood can repeat until it becomes architecture. In this world it functions like a crest. In the real world it functions like a reason to keep going.",
    relatedSongs: ["flatbed-freestyle", "jesus-piece-rockin"],
    relatedCharacters: ["stylez"],
    relatedLocations: ["southside"],
  },
  {
    id: "lore-piece",
    slug: "the-piece",
    title: "THE PIECE",
    excerpt: "Jewelry that behaves like a character.",
    content:
      "The Jesus Piece is logged as an item because it keeps appearing with its own gravity. Gold against night. Faith against flex. It is not used as decoration in this universe — it is used as a witness. When it shows up in a frame, the scene is already about survival.",
    relatedSongs: ["jesus-piece-rockin"],
    relatedCharacters: ["stylez"],
    relatedLocations: ["the-city"],
  },
  {
    id: "lore-nights",
    slug: "southside-nights",
    title: "SOUTHSIDE NIGHTS",
    excerpt: "The current era. The lights stay orange.",
    content:
      "An era is not a marketing window. It is a weather system. Southside Nights is the present save file: freestyles, street footage, friends who have not been fully written into the codex yet, and a cabinet in the arcade that is still being wired.",
    relatedSongs: ["flatbed-freestyle"],
    relatedCharacters: ["stylez"],
    relatedLocations: ["southside", "the-ave"],
  },
];
