import type { ItemRecord } from "@/types";

export const items: ItemRecord[] = [
  {
    id: "item-jesus-piece",
    slug: "jesus-piece",
    name: "Jesus Piece",
    image: "/art/item-jesus-piece.svg",
    description:
      "Gold. Heavy for its size. Not costume jewelry and not a logo. A relic that shows up in songs, mirrors, and night photos.",
    rarity: "relic",
    relatedSongs: ["jesus-piece-rockin"],
    relatedLocations: ["the-city", "the-studio"],
    relatedCharacters: ["stylez"],
  },
  {
    id: "item-metrocard",
    slug: "metrocard",
    name: "MetroCard",
    image: "/art/item-metrocard.svg",
    description:
      "Yellow-blue ticket to the overworld. Scratched, bent, still working. Some versions of this object are rumored to open more than turnstiles.",
    rarity: "uncommon",
    relatedSongs: ["flatbed-freestyle"],
    relatedLocations: ["the-city", "southside"],
    relatedCharacters: ["stylez"],
  },
  {
    id: "item-mic",
    slug: "microphone",
    name: "Microphone",
    image: "/art/item-microphone.svg",
    description:
      "The weapon and the instrument. Studio or sidewalk, it does not care. First tool of every chapter.",
    rarity: "common",
    relatedSongs: ["flatbed-freestyle", "jesus-piece-rockin"],
    relatedLocations: ["the-studio", "southside"],
    relatedCharacters: ["stylez"],
  },
  {
    id: "item-camera",
    slug: "camera",
    name: "Camera",
    image: "/art/item-camera.svg",
    description:
      "Street photography as worldbuilding. Whoever holds this decides which nights become canon.",
    rarity: "uncommon",
    relatedSongs: [],
    relatedLocations: ["the-ave", "southside"],
    relatedCharacters: ["stylez"],
  },
  {
    id: "item-studio-key",
    slug: "studio-key",
    name: "Studio Key",
    image: "/art/item-key.svg",
    description:
      "Access. Hours. The difference between wanting a song and finishing one.",
    rarity: "rare",
    relatedSongs: ["jesus-piece-rockin"],
    relatedLocations: ["the-studio"],
    relatedCharacters: ["stylez"],
  },
  {
    id: "item-mystery",
    slug: "mystery-object",
    name: "???",
    image: "/art/placeholders/stage-throne.gif",
    description:
      "An object the world has not named yet. If you find it in Southside, you were not supposed to, which means you were.",
    rarity: "unknown",
    relatedSongs: [],
    relatedLocations: ["southside"],
    relatedCharacters: [],
  },
];
