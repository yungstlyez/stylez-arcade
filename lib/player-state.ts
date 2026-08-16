import type { SaveData } from "@/types";

export const SAVE_KEY = "stylez-save-v1";

export const defaultSave = (): SaveData => ({
  version: 1,
  started: false,
  firstVisitAt: null,
  tokens: 0,
  level: 1,
  visited: [],
  eggs: [],
  achievements: [],
  collectibles: [],
  gamesPlayed: [],
  chroniclesRead: [],
  locationsVisited: [],
  listened: [],
});

export function loadSave(): SaveData {
  if (typeof window === "undefined") return defaultSave();
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return { ...defaultSave(), ...parsed, version: 1 };
  } catch {
    return defaultSave();
  }
}

export function persistSave(save: SaveData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}

export function padChronicle(n: number, size = 4) {
  return String(n).padStart(size, "0");
}

export function computeLevel(save: SaveData) {
  return Math.min(99, 1 + save.achievements.length + Math.floor(save.tokens / 3));
}
