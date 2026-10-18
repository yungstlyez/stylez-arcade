import type { Chronicle } from "@/types";

export const chronicles: Chronicle[] = [
  {
    id: "chr-30",
    number: 30,
    slug: "bodega-run-minigame",
    title: "Bodega Run minigame",
    date: "2026-10-17",
    excerpt: "BODEGA RUN MINIGAME BELOW!!! TRY NOW!!!!",
    content: "BODEGA RUN MINIGAME BELOW!!! TRY NOW!!!!",
    media: [],
    relatedSongs: ["gl0ckianna", "body-by-raven"],
    relatedCharacters: ["stylez"],
    relatedLocations: ["southside"],
  },
  {
    id: "chr-29",
    number: 29,
    slug: "dedicated-arcade-blog",
    title: "Dedicated arcade blog",
    date: "2026-08-22",
    excerpt:
      "New dedicated arcade blog for all my music and content, gonna add mini games soon...stay tuned!",
    content:
      "New dedicated arcade blog for all my music and content, gonna add mini games soon...stay tuned!",
    media: [],
    relatedSongs: ["flatbed-freestyle"],
    relatedCharacters: ["stylez"],
    relatedLocations: ["southside"],
  },
  {
    id: "chr-28",
    number: 28,
    slug: "the-world-comes-online",
    title: "The world comes online",
    date: "2026-08-16",
    excerpt:
      "The cartridge finally boots. Not a website. A place to put the nights so they stop disappearing.",
    content: `The files were always scattered — phone clips, voice notes, a caption, a block, a friend in the frame who deserved a name in the codex.

Tonight the machine is on.

This is not a press release. It is a save point. Music still sits in the middle of the map. Everything else — the arcade, the characters, the locations, the secrets — is how the story stops leaking out of the timeline.

If you found this from the short signal, you are already in. Press start when you are ready. The rest of the world is still being written on purpose.

Room 00 is not on the menu. Southside still hides a glint if you look twice.`,
    media: [
      {
        type: "screenshot",
        src: "/art/chronicle-boot.svg",
        alt: "Title screen sketch of the word STYLEZ on a CRT",
        caption: "Boot sketch. Keep the scanlines.",
      },
    ],
    relatedSongs: ["flatbed-freestyle"],
    relatedCharacters: ["stylez"],
    relatedLocations: ["southside", "the-city"],
  },
  {
    id: "chr-12",
    number: 12,
    slug: "night-shift-on-the-bed",
    title: "Night shift on the bed",
    date: "2026-06-04",
    excerpt:
      "The flatbed does not care what time it is. Southside either.",
    content: `We took the long way because the long way is the point.

The mix was already in the body before it was in the file. That is how you know it is a chapter and not a leftover. Streetlights doing that orange thing they do when the city is tired and still showing off.

Somebody asked where we were going. Nobody gave a real answer. That is also the point.

If FLATBED RUN ever boots, this is the reference footage: not a chase, a procession. Avoid the obvious. Collect what glints. Do not stop for the skyline unless the skyline earned it.`,
    media: [
      {
        type: "photo",
        src: "/art/chronicle-flatbed.svg",
        alt: "Night sketch of a flatbed under streetlights",
        caption: "Field note. Plate number later.",
      },
    ],
    relatedSongs: ["flatbed-freestyle"],
    relatedCharacters: ["stylez"],
    relatedLocations: ["southside", "the-ave"],
  },
  {
    id: "chr-7",
    number: 7,
    slug: "gold-in-the-mirror",
    title: "Gold in the mirror",
    date: "2026-03-21",
    excerpt: "The piece caught the bathroom light like it had something to say.",
    content: `Some objects refuse to stay in the background.

I kept seeing it in the reflection before I saw my own face. That felt accurate. The song started as a joke about the chain and ended as a record about remaining.

Studio key on the table. Mic already warm. Nobody needed a big speech. We just let the gold do what gold does in a dark room — tell the truth louder than the person wearing it.`,
    media: [
      {
        type: "sketch",
        src: "/art/item-jesus-piece.svg",
        alt: "Line sketch of a Jesus piece",
        caption: "Relic study.",
      },
    ],
    relatedSongs: ["jesus-piece-rockin"],
    relatedCharacters: ["stylez"],
    relatedLocations: ["the-studio"],
  },
  {
    id: "chr-3",
    number: 3,
    slug: "welcome-to-southside",
    title: "Welcome to Southside",
    date: "2025-11-02",
    excerpt: "If you know, you know. If you don't, the block will teach you the long way.",
    content: `First proper log. Not the first night.

Southside is not a metaphor I invented for a website. It is the map I already had. The rest of the city is an expansion pack that thinks it is the main game.

I am writing this down so the lore does not only live in group chats and memory. Friends will get pages. Places will get pages. The music will keep being the boss fights.

For now: you are here. That is enough.`,
    media: [],
    relatedSongs: ["flatbed-freestyle"],
    relatedCharacters: ["stylez"],
    relatedLocations: ["southside"],
  },
  {
    id: "chr-1",
    number: 1,
    slug: "file-0001",
    title: "FILE 0001",
    date: "2025-08-16",
    excerpt: "A blank cartridge with a name already scratched into it.",
    content: `Callmestylez.

The internet wanted a link. The night wanted a world.

This file exists so there is a beginning to point at later. No thesis. No rollout language. Just a marker in the dirt: the story starts, and it does not start clean.

STYLEZ WILL SAVE US.

Keep it.`,
    media: [],
    relatedSongs: [],
    relatedCharacters: ["stylez"],
    relatedLocations: ["southside"],
  },
];
