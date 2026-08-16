"use client";

import { achievements as achievementCatalog } from "@/data/achievements";
import { evaluateAchievements } from "@/lib/achievements";
import { matchesKonami } from "@/lib/easter-eggs";
import { computeLevel, defaultSave, loadSave, persistSave } from "@/lib/player-state";
import type { SaveData, UnlockToast } from "@/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type PlayerContextValue = {
  save: SaveData;
  ready: boolean;
  toasts: UnlockToast[];
  dismissToast: (id: string) => void;
  enterWorld: () => void;
  visit: (path: string) => void;
  readChronicle: (slug: string) => void;
  visitLocation: (slug: string) => void;
  markListened: (slug: string) => void;
  markGamePlayed: (slug: string) => void;
  discoverEgg: (id: string, toast?: Omit<UnlockToast, "id">) => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [save, setSave] = useState<SaveData>(defaultSave);
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState<UnlockToast[]>([]);
  const keys = useRef<string[]>([]);

  const pushToast = useCallback((toast: UnlockToast) => {
    setToasts((current) => [...current.slice(-3), toast]);
  }, []);

  const commit = useCallback(
    (updater: (current: SaveData) => SaveData) => {
      setSave((current) => {
        const next = updater(current);
        const before = new Set(current.achievements);
        const unlocked = evaluateAchievements(next);
        const withLevel: SaveData = {
          ...next,
          achievements: unlocked,
          level: computeLevel({ ...next, achievements: unlocked }),
        };
        persistSave(withLevel);
        for (const id of unlocked) {
          if (!before.has(id)) {
            const meta = achievementCatalog.find((item) => item.id === id);
            pushToast({
              id: `ach-${id}-${Date.now()}`,
              kind: "achievement",
              title: meta?.name ?? "ACHIEVEMENT",
              body: meta?.description ?? "File unlocked.",
            });
          }
        }
        return withLevel;
      });
    },
    [pushToast],
  );

  useEffect(() => {
    const loaded = loadSave();
    const firstVisitAt = loaded.firstVisitAt ?? new Date().toISOString();
    const hydrated: SaveData = {
      ...loaded,
      firstVisitAt,
      achievements: evaluateAchievements({ ...loaded, firstVisitAt }),
    };
    hydrated.level = computeLevel(hydrated);
    // Hydrate local save after mount to avoid SSR/localStorage mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage bootstrap
    setSave(hydrated);
    persistSave(hydrated);
    setReady(true);
    const fresh = hydrated.achievements.filter((id) => !loaded.achievements.includes(id));
    for (const id of fresh) {
      const meta = achievementCatalog.find((item) => item.id === id);
      pushToast({
        id: `ach-${id}-${Date.now()}`,
        kind: "achievement",
        title: meta?.name ?? "ACHIEVEMENT",
        body: meta?.description ?? "File unlocked.",
      });
    }
  }, [pushToast]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      keys.current = [...keys.current.slice(-12), event.key];
      if (matchesKonami(keys.current)) {
        keys.current = [];
        let unlocked = false;
        commit((current) => {
          if (current.eggs.includes("konami")) return current;
          unlocked = true;
          return {
            ...current,
            eggs: [...current.eggs, "konami"],
            tokens: current.tokens + 1,
            collectibles: current.collectibles.includes("token-stylez")
              ? current.collectibles
              : [...current.collectibles, "token-stylez"],
          };
        });
        if (unlocked) {
          pushToast({
            id: `egg-konami-${Date.now()}`,
            kind: "secret",
            title: "SECRET FOUND",
            body: "+1 STYLEZ TOKEN",
          });
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commit, pushToast]);

  const value = useMemo<PlayerContextValue>(
    () => ({
      save,
      ready,
      toasts,
      dismissToast: (id) => setToasts((current) => current.filter((toast) => toast.id !== id)),
      enterWorld: () => commit((current) => ({ ...current, started: true })),
      visit: (path) =>
        commit((current) =>
          current.visited.includes(path)
            ? current
            : { ...current, visited: [...current.visited, path] },
        ),
      readChronicle: (slug) =>
        commit((current) =>
          current.chroniclesRead.includes(slug)
            ? current
            : { ...current, chroniclesRead: [...current.chroniclesRead, slug] },
        ),
      visitLocation: (slug) =>
        commit((current) =>
          current.locationsVisited.includes(slug)
            ? current
            : { ...current, locationsVisited: [...current.locationsVisited, slug] },
        ),
      markListened: (slug) =>
        commit((current) =>
          current.listened.includes(slug)
            ? current
            : { ...current, listened: [...current.listened, slug] },
        ),
      markGamePlayed: (slug) =>
        commit((current) =>
          current.gamesPlayed.includes(slug)
            ? current
            : { ...current, gamesPlayed: [...current.gamesPlayed, slug] },
        ),
      discoverEgg: (id, toast) => {
        commit((current) => {
          if (current.eggs.includes(id)) return current;
          return {
            ...current,
            eggs: [...current.eggs, id],
            tokens: current.tokens + 1,
            collectibles: current.collectibles.includes("southside-chip")
              ? current.collectibles
              : [...current.collectibles, "southside-chip"],
          };
        });
        if (toast) {
          pushToast({ ...toast, id: `${id}-${Date.now()}` });
        }
      },
    }),
    [commit, pushToast, ready, save, toasts],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}
