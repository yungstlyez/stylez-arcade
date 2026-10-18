import { archiveItems } from "@/data/archive";
import { achievements } from "@/data/achievements";
import { characters } from "@/data/characters";
import { chronicles } from "@/data/chronicles";
import { collectibles } from "@/data/collectibles";
import { games } from "@/data/games";
import { items } from "@/data/items";
import { locations } from "@/data/locations";
import { lore } from "@/data/lore";
import { releases } from "@/data/releases";
import { site } from "@/data/site";
import { currentMission, transmissions } from "@/data/transmissions";
import type {
  ArchiveItem,
  Achievement,
  Character,
  Chronicle,
  Collectible,
  GameRecord,
  ItemRecord,
  LocationRecord,
  LoreEntry,
  Release,
  Track,
} from "@/types";

/**
 * Content access layer.
 * TODO(supabase): swap these mock reads for Supabase queries.
 * Keep the function signatures stable so pages and components do not need rewrites.
 */

export function getReleases(): Release[] {
  return releases;
}

export function getRelease(slug: string): Release | undefined {
  return releases.find((item) => item.slug === slug);
}

export function getFeaturedRelease(): Release {
  return releases.find((item) => item.slug === site.featuredReleaseSlug) ?? releases[0];
}

export function getLatestSpotifyRelease(): Release | undefined {
  const pinned = releases.find(
    (item) => item.slug === site.latestSpotifySlug && Boolean(item.streamingLinks.spotify),
  );
  if (pinned) return pinned;
  return releases.find((item) => !item.soundcloudOnly && Boolean(item.streamingLinks.spotify));
}

export function getCharacters(): Character[] {
  return characters;
}

export function getCharacter(slug: string): Character | undefined {
  return characters.find((item) => item.slug === slug);
}

export function getLocations(): LocationRecord[] {
  return locations;
}

export function getLocation(slug: string): LocationRecord | undefined {
  return locations.find((item) => item.slug === slug);
}

export function getItems(): ItemRecord[] {
  return items;
}

export function getItem(slug: string): ItemRecord | undefined {
  return items.find((item) => item.slug === slug);
}

export function getLore(): LoreEntry[] {
  return lore;
}

export function getLoreEntry(slug: string): LoreEntry | undefined {
  return lore.find((item) => item.slug === slug);
}

export function getChronicles(): Chronicle[] {
  return [...chronicles].sort((a, b) => b.number - a.number);
}

export function getChronicle(slug: string): Chronicle | undefined {
  return chronicles.find((item) => item.slug === slug);
}

export function getLatestChronicle(): Chronicle {
  return getChronicles()[0];
}

export function getGames(): GameRecord[] {
  return games;
}

export function getGame(slug: string): GameRecord | undefined {
  return games.find((item) => item.slug === slug);
}

export function getAchievements(): Achievement[] {
  return achievements;
}

export function getCollectibles(): Collectible[] {
  return collectibles;
}

export function getArchive(): ArchiveItem[] {
  return archiveItems;
}

export function getTransmissions() {
  return transmissions;
}

export function getCurrentMission() {
  return currentMission;
}

export function listenHref(release: Release): string | undefined {
  if (release.soundcloudOnly) return release.streamingLinks.soundcloud;
  return release.streamingLinks.spotify ?? release.streamingLinks.soundcloud;
}

export function releaseToTrack(release: Release): Track {
  return {
    id: release.id,
    title: release.title,
    artist: site.artist,
    cover: release.cover,
    src: release.audio,
    slug: release.slug,
    preferExternal: Boolean(release.streamingLinks.soundcloud || release.streamingLinks.spotify),
  };
}

export function getTrackQueue(): Track[] {
  return releases.map(releaseToTrack);
}

export function resolveReleases(slugs: string[]): Release[] {
  return slugs
    .map((slug) => getRelease(slug))
    .filter((item): item is Release => Boolean(item));
}

export function releaseLinkItems(slugs: string[]) {
  return resolveReleases(slugs).map((item) => ({
    href: listenHref(item) ?? `/music/${item.slug}`,
    label: item.title,
    note: item.soundcloudOnly ? "SOUNDCLOUD ONLY" : "ALL PLATS",
    external: Boolean(listenHref(item)),
  }));
}

export function resolveCharacters(slugs: string[]): Character[] {
  return slugs
    .map((slug) => getCharacter(slug))
    .filter((item): item is Character => Boolean(item));
}

export function resolveLocations(slugs: string[]): LocationRecord[] {
  return slugs
    .map((slug) => getLocation(slug))
    .filter((item): item is LocationRecord => Boolean(item));
}

export function resolveChronicles(slugs: string[]): Chronicle[] {
  return slugs
    .map((slug) => getChronicle(slug))
    .filter((item): item is Chronicle => Boolean(item));
}
