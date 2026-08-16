export type StreamingLinks = {
  spotify?: string;
  appleMusic?: string;
  youtube?: string;
  soundcloud?: string;
};

export type Credit = {
  role: string;
  name: string;
};

export type AlternateVersion = {
  title: string;
  note: string;
};

export type Release = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  year: number;
  cover: string;
  audio: string;
  description: string;
  lyrics?: string;
  credits: Credit[];
  streamingLinks: StreamingLinks;
  video?: { title: string; url: string };
  characters: string[];
  locations: string[];
  chronicles: string[];
  era: string;
  type: string;
  rarity?: string;
  featured?: boolean;
  /** True when the track is not on DSPs — SoundCloud is the official listen. */
  soundcloudOnly?: boolean;
  story?: string;
  alternateVersions?: AlternateVersion[];
  easterEggs?: string[];
};

export type CharacterStatus = "active" | "unknown" | "locked";

export type CharacterStat = {
  label: string;
  value: number;
};

export type Character = {
  id: string;
  slug: string;
  name: string;
  alias?: string;
  portrait: string;
  role: string;
  bio: string;
  firstAppearance: string;
  songs: string[];
  locations: string[];
  stats?: CharacterStat[];
  status: CharacterStatus;
};

export type LocationRecord = {
  id: string;
  slug: string;
  name: string;
  image: string;
  description: string;
  characters: string[];
  songs: string[];
  appearances: string[];
  lore: string;
};

export type ItemRarity = "common" | "uncommon" | "rare" | "relic" | "unknown";

export type ItemRecord = {
  id: string;
  slug: string;
  name: string;
  image: string;
  description: string;
  rarity: ItemRarity;
  relatedSongs: string[];
  relatedLocations: string[];
  relatedCharacters: string[];
  found?: boolean;
};

export type LoreEntry = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  relatedSongs: string[];
  relatedCharacters: string[];
  relatedLocations: string[];
};

export type ChronicleMedia = {
  type: "photo" | "video" | "sketch" | "audio" | "screenshot";
  src: string;
  alt: string;
  caption?: string;
};

export type Chronicle = {
  id: string;
  number: number;
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  media: ChronicleMedia[];
  relatedSongs: string[];
  relatedCharacters: string[];
  relatedLocations: string[];
};

export type GameStatus = "live" | "locked" | "beta";

export type GameRecord = {
  id: string;
  slug: string;
  name: string;
  thumbnail: string;
  description: string;
  soundtrack: string;
  status: GameStatus;
  releaseDate?: string;
  achievements: string[];
  highScore?: number;
};

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockCondition: string;
  hidden?: boolean;
};

export type Collectible = {
  id: string;
  name: string;
  description: string;
  image: string;
  rarity: ItemRarity;
  found?: boolean;
};

export type ArchiveItem = {
  id: string;
  slug: string;
  title: string;
  year: number;
  type: "song" | "video" | "photo" | "flyer" | "artwork" | "era" | "unreleased";
  era: string;
  status: "recovered" | "damaged" | "locked";
  image: string;
  description: string;
};

export type SocialNetwork = {
  id: string;
  label: string;
  handle: string;
  href: string;
  network: string;
  signal: string;
  placeholder?: boolean;
};

export type Transmission = {
  id: string;
  date: string;
  tag: string;
  title: string;
  body: string;
  href: string;
  ago?: string;
};

export type Mission = {
  id: string;
  title: string;
  brief: string;
  href: string;
  locationHint: string;
};

export type Track = {
  id: string;
  title: string;
  artist: string;
  cover: string;
  src: string;
  slug: string;
};

export type SaveData = {
  version: 1;
  started: boolean;
  firstVisitAt: string | null;
  tokens: number;
  level: number;
  visited: string[];
  eggs: string[];
  achievements: string[];
  collectibles: string[];
  gamesPlayed: string[];
  chroniclesRead: string[];
  locationsVisited: string[];
  listened: string[];
};

export type UnlockToast = {
  id: string;
  kind: "achievement" | "secret" | "token";
  title: string;
  body: string;
};
