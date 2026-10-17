import type { LocationRecord } from "@/types";

export const locations: LocationRecord[] = [
  {
    id: "loc-southside",
    slug: "southside",
    name: "SOUTHSIDE",
    image: "/art/placeholders/stage-el-train.gif",
    description:
      "Home frequency. Brick, bodega light, night heat, the kind of quiet that still has bass in it. If the rest of the map is a rumor, Southside is the save point.",
    lore: "Every version of Stylez starts here, even when the camera is somewhere else. The streets remember more than the internet does. Walk slow. Look twice. Something in this neighborhood is collectible.",
    characters: ["stylez", "unknown-01"],
    songs: ["flatbed-freestyle", "stylez-be", "different-cloth", "vivienne-westwood"],
    appearances: [
      "FlatBed Freestyle (Stylezmix)",
      "stylez be",
      "Chronicle 0003",
      "BODEGA RUN cabinet",
    ],
  },
  {
    id: "loc-ave",
    slug: "the-ave",
    name: "THE AVE",
    image: "/art/placeholders/stage-el-train.gif",
    description:
      "The corridor. Storefronts repeating like sprites. People you know appearing like NPCs until they speak and become themselves again.",
    lore: "The Ave is where the world performs being a city. It is also where transmissions leak — flyers, rumors, a song playing out of a car that does not stop.",
    characters: ["stylez"],
    songs: ["flatbed-freestyle", "flyest-inna-room"],
    appearances: ["FlatBed Freestyle (Stylezmix)", "flyest inna room", "Chronicle 0012"],
  },
  {
    id: "loc-studio",
    slug: "the-studio",
    name: "THE STUDIO",
    image: "/art/loc-studio.svg",
    description:
      "A room that turns nights into files. Screens, cables, a key that not everybody gets. This is where chapters get rendered.",
    lore: "Not a temple. A workshop. The holy part is the hours. If a song survives this room, it can survive the city.",
    characters: ["stylez", "unknown-02"],
    songs: ["jesus-piece-rockin", "raps-funeral"],
    appearances: ["jesus piece rockin’", "rap's funeral", "Chronicle 0012"],
  },
  {
    id: "loc-city",
    slug: "the-city",
    name: "THE CITY",
    image: "/art/placeholders/stage-el-train.gif",
    description:
      "NYC after the train doors close. Skyline as HUD. Nightlife as weather. Bigger than Southside, but it still answers to it.",
    lore: "The City is the overworld. It contains the other maps and pretends it invented them. Stylez moves through it like someone who already knows which lights are decorative.",
    characters: ["stylez"],
    songs: ["stylez-be", "flyest-inna-room", "rip-fredo", "vivienne-westwood"],
    appearances: ["Callmestylez catalog", "Online networks"],
  },
];
