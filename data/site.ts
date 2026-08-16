export const site = {
  artist: "Callmestylez",
  shortName: "Stylez",
  chris: "Chris",
  phrase: "STYLEZ WILL SAVE US",
  byline: "BY CALLMESTYLEZ",
  instagram: "@stylezflew",
  chronicleHandle: "@stylezchroniclez",
  featuredReleaseSlug: "flatbed-freestyle",
  featuredGameSlug: "flatbed-run",
  featuredLocationSlug: "southside",
  title: "STYLEZ ARCADE",
  logo: "/art/logo-primary.png",
  description:
    "You found it. The world Callmestylez exists inside — music, Southside, Chronicles, and whatever is still being written.",
} as const;

export const navItems = [
  { href: "/", label: "HOME", subtitle: "Player Hub", icon: "folder" },
  { href: "/play", label: "PLAY", subtitle: "Arcade Games", icon: "cabinet" },
  { href: "/music", label: "MUSIC", subtitle: "Songs & Releases", icon: "disc" },
  { href: "/world", label: "WORLD", subtitle: "Characters & Places", icon: "world" },
  { href: "/chronicles", label: "CHRONICLES", subtitle: "Journal / Devlog", icon: "scroll" },
  { href: "/archive", label: "ARCHIVE", subtitle: "Old Files", icon: "archive" },
  { href: "/online", label: "ONLINE", subtitle: "Transmissions", icon: "signal" },
  { href: "/shop", label: "SHOP", subtitle: "Locked", icon: "key" },
] as const;

export const mobileNavItems = [
  { href: "/", label: "HOME", icon: "folder" },
  { href: "/music", label: "MUSIC", icon: "disc" },
  { href: "/play", label: "PLAY", icon: "cabinet" },
  { href: "/world", label: "WORLD", icon: "world" },
  { href: "/chronicles", label: "LOGS", icon: "scroll" },
] as const;
