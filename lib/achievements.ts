import { achievements } from "@/data/achievements";
import { locations } from "@/data/locations";
import { site } from "@/data/site";
import type { SaveData } from "@/types";

export function evaluateAchievements(save: SaveData): string[] {
  const unlocked = new Set(save.achievements);

  for (const achievement of achievements) {
    if (unlocked.has(achievement.id)) continue;
    if (shouldUnlock(achievement.unlockCondition, save)) {
      unlocked.add(achievement.id);
    }
  }

  return [...unlocked];
}

function shouldUnlock(condition: string, save: SaveData) {
  switch (condition) {
    case "first_visit":
      return Boolean(save.firstVisitAt);
    case "chronicles_read_3":
      return save.chroniclesRead.length >= 3;
    case "all_locations":
      return locations.every((location) => save.locationsVisited.includes(location.slug));
    case "easter_egg":
      return save.eggs.length >= 1;
    case "listen_featured":
      return save.listened.includes(site.featuredReleaseSlug);
    default:
      return false;
  }
}
