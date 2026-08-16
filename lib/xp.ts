import type { SaveData } from "@/types";

export function xpFromSave(save: SaveData) {
  const xp = Math.min(
    1000,
    save.tokens * 40 + save.achievements.length * 120 + save.visited.length * 8 + 150,
  );
  return { xp, max: 1000 };
}
