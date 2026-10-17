export const site = {
  artist: "Callmestylez",
  shortName: "Stylez",
  chris: "Chris",
  phrase: "STYLEZ WILL SAVE US",
  byline: "BY CALLMESTYLEZ",
  instagram: "@stylezflew",
  twitch: "@stylezflew",
  tiktok: "@notcallmestylez",
  chronicleHandle: "@stylezchroniclez",
  featuredReleaseSlug: "body-by-raven",
  latestSpotifySlug: "gl0ckianna",
  featuredGameSlug: "flatbed-run",
  featuredLocationSlug: "southside",
  title: "STYLEZ ARCADE",
  logo: "/art/logo-primary.png",
  portrait: "/art/portrait-stylez.png",
  description:
    "You found it. The world Callmestylez exists inside — music, Southside, Chronicles, and whatever is still being written.",
} as const;

export const navItems = [
  { href: "/", label: "HOME", subtitle: "Player Hub", icon: "folder" },
  { href: "/play", label: "PLAY", subtitle: "Arcade Games", icon: "cabinet" },
  { href: "/music", label: "MUSIC", subtitle: "Songs & Releases", icon: "disc" },
  { href: "/world", label: "WORLD", subtitle: "Characters & Places", icon: "world", comingSoon: true },
  { href: "/chronicles", label: "CHRONICLES", subtitle: "Journal / Devlog", icon: "scroll", comingSoon: true },
  { href: "/archive", label: "ARCHIVE", subtitle: "Old Files", icon: "archive", comingSoon: true },
  { href: "/online", label: "ONLINE", subtitle: "Transmissions", icon: "signal", comingSoon: true },
  { href: "/shop", label: "SHOP", subtitle: "Locked", icon: "key", comingSoon: true },
] as const;

export const comingSoonScreens = {
  "/world": {
    title: "WORLD",
    blurb: "Characters, places, and the Southside map will live here. The codex is still being drawn.",
  },
  "/chronicles": {
    title: "CHRONICLES",
    blurb: "Mission logs and field notes will live here. The nights are still being written.",
  },
  "/archive": {
    title: "ARCHIVE",
    blurb: "Old save files, flyers, and previous eras will live here. The drawers are still locked.",
  },
  "/online": {
    title: "ONLINE",
    blurb: "Transmissions and outside networks will jack in here. The signal is still warming up.",
  },
  "/shop": {
    title: "SHOP",
    blurb: "Merch, physical releases, and collectibles will live here. The counter is still closed.",
  },
} as const;

export type ComingSoonHref = keyof typeof comingSoonScreens;

export function isComingSoonHref(href: string): href is ComingSoonHref {
  return href in comingSoonScreens;
}

export const mobileNavItems = [
  { href: "/", label: "HOME", icon: "folder" },
  { href: "/music", label: "MUSIC", icon: "disc" },
  { href: "/play", label: "PLAY", icon: "cabinet" },
  { href: "/world", label: "WORLD", icon: "world", comingSoon: true },
  { href: "/chronicles", label: "LOGS", icon: "scroll", comingSoon: true },
] as const;
