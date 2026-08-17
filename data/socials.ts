import type { SocialNetwork } from "@/types";

export const socials: SocialNetwork[] = [
  {
    id: "instagram",
    label: "Instagram",
    handle: "@stylezflew",
    href: "https://instagram.com/stylezflew",
    network: "FIELD CAM",
    signal: "LIVE",
  },
  {
    id: "twitch",
    label: "Twitch",
    handle: "@stylezflew",
    href: "https://twitch.tv/stylezflew",
    network: "NIGHT STREAM",
    signal: "LIVE",
  },
  {
    id: "tiktok",
    label: "TikTok",
    handle: "@notcallmestylez",
    href: "https://www.tiktok.com/@notcallmestylez",
    network: "CLIP FEED",
    signal: "LIVE",
  },
  {
    id: "chroniclez-ig",
    label: "Chroniclez IG",
    handle: "@stylezchroniclez",
    href: "https://instagram.com/stylezchroniclez",
    network: "SHORT SIGNAL",
    signal: "LIVE",
  },
  {
    id: "chroniclez-tiktok",
    label: "Chroniclez TikTok",
    handle: "@stylezchroniclez",
    href: "https://www.tiktok.com/@stylezchroniclez",
    network: "SHORT SIGNAL",
    signal: "LIVE",
  },
  {
    id: "spotify",
    label: "Spotify",
    handle: "Callmestylez",
    href: "https://open.spotify.com/artist/7BgBZqsMY03cdXtiIi6n1o",
    network: "MAIN STAGE",
    signal: "LIVE",
  },
  {
    id: "soundcloud",
    label: "SoundCloud",
    handle: "Callmestylez",
    href: "https://soundcloud.com/user-363377229",
    network: "RAW FILES",
    signal: "LIVE",
  },
];

export const hubSocials = [
  {
    id: "music",
    title: "Music Platforms",
    handle: "Callmestylez",
    links: [
      { label: "Spotify", href: "https://open.spotify.com/artist/7BgBZqsMY03cdXtiIi6n1o" },
      { label: "SoundCloud", href: "https://soundcloud.com/user-363377229" },
    ],
  },
  {
    id: "main",
    title: "Instagram / Twitch",
    handle: "@stylezflew",
    links: [
      { label: "Instagram", href: "https://instagram.com/stylezflew" },
      { label: "Twitch", href: "https://twitch.tv/stylezflew" },
    ],
  },
  {
    id: "tiktok",
    title: "TikTok",
    handle: "@notcallmestylez",
    links: [{ label: "TikTok", href: "https://www.tiktok.com/@notcallmestylez" }],
  },
  {
    id: "chroniclez",
    title: "Chroniclez",
    handle: "@stylezchroniclez",
    links: [
      { label: "Instagram", href: "https://instagram.com/stylezchroniclez" },
      { label: "TikTok", href: "https://www.tiktok.com/@stylezchroniclez" },
    ],
  },
] as const;
