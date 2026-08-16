import type { SocialNetwork } from "@/types";

/**
 * Central social config. Spotify and SoundCloud are live Callmestylez profiles.
 * TikTok, Twitch, and YouTube stay on standby until those handles are confirmed.
 */
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
    id: "chroniclez",
    label: "Stylez Chroniclez",
    handle: "@stylezchroniclez",
    href: "https://instagram.com/stylezchroniclez",
    network: "SHORT SIGNAL",
    signal: "LIVE",
  },
  {
    id: "tiktok",
    label: "TikTok",
    handle: "@stylezflew",
    href: "https://www.tiktok.com/@stylezflew",
    network: "CLIP FEED",
    signal: "STANDBY",
    placeholder: true,
  },
  {
    id: "twitch",
    label: "Twitch",
    handle: "stylezflew",
    href: "https://twitch.tv/stylezflew",
    network: "NIGHT STREAM",
    signal: "OFFLINE",
    placeholder: true,
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
    id: "youtube",
    label: "YouTube",
    handle: "Callmestylez",
    href: "https://youtube.com/@stylezflew",
    network: "BROADCAST",
    signal: "STANDBY",
    placeholder: true,
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
