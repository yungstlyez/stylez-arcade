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
  const toastSeq = useRef(0);
  const toastedAchievements = useRef(new Set<string>());

  const pushToast = useCallback((toast: UnlockToast) => {
    setToasts((current) => {
      if (current.some((item) => item.id === toast.id)) return current;
      return [...current.slice(-3), toast];
    });
  }, []);

  const toastAchievement = useCallback(
    (id: string) => {
      if (toastedAchievements.current.has(id)) return;
      toastedAchievements.current.add(id);
      toastSeq.current += 1;
      const meta = achievementCatalog.find((item) => item.id === id);
      pushToast({
        id: `ach-${id}-${toastSeq.current}`,
        kind: "achievement",
        title: meta?.name ?? "ACHIEVEMENT",
        body: meta?.description ?? "File unlocked.",
      });
    },
    [pushToast],
  );

  const commit = useCallback(
    (updater: (current: SaveData) => SaveData) => {
      setSave((current) => {
        const next = updater(current);
        const before = new Set(current.achievements);
        const unlocked = evaluateAchievements(next);
        const level = computeLevel({ ...next, achievements: unlocked });
        const sameAchievements =
          unlocked.length === current.achievements.length &&
          unlocked.every((id) => before.has(id));
        if (next === current && sameAchievements && level === current.level) {
          return current;
        }
        const withLevel: SaveData = {
          ...next,
          achievements: unlocked,
          level,
        };
        persistSave(withLevel);
        const fresh = unlocked.filter((id) => !before.has(id));
        if (fresh.length) {
          queueMicrotask(() => {
            for (const id of fresh) toastAchievement(id);
          });
        }
        return withLevel;
      });
    },
    [toastAchievement],
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const enterWorld = useCallback(() => {
    commit((current) => (current.started ? current : { ...current, started: true }));
  }, [commit]);

  const visit = useCallback(
    (path: string) => {
      commit((current) =>
        current.visited.includes(path) ? current : { ...current, visited: [...current.visited, path] },
      );
    },
    [commit],
  );

  const readChronicle = useCallback(
    (slug: string) => {
      commit((current) =>
        current.chroniclesRead.includes(slug)
          ? current
          : { ...current, chroniclesRead: [...current.chroniclesRead, slug] },
      );
    },
    [commit],
  );

  const visitLocation = useCallback(
    (slug: string) => {
      commit((current) =>
        current.locationsVisited.includes(slug)
          ? current
          : { ...current, locationsVisited: [...current.locationsVisited, slug] },
      );
    },
    [commit],
  );

  const markListened = useCallback(
    (slug: string) => {
      commit((current) =>
        current.listened.includes(slug) ? current : { ...current, listened: [...current.listened, slug] },
      );
    },
    [commit],
  );

  const markGamePlayed = useCallback(
    (slug: string) => {
      commit((current) =>
        current.gamesPlayed.includes(slug)
          ? current
          : { ...current, gamesPlayed: [...current.gamesPlayed, slug] },
      );
    },
    [commit],
  );

  const discoverEgg = useCallback(
    (id: string, toast?: Omit<UnlockToast, "id">) => {
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
        toastSeq.current += 1;
        pushToast({ ...toast, id: `${id}-${toastSeq.current}` });
      }
    },
    [commit, pushToast],
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
    toastedAchievements.current = new Set(loaded.achievements);
    const fresh = hydrated.achievements.filter((id) => !loaded.achievements.includes(id));
    for (const id of fresh) {
      toastAchievement(id);
    }
  }, [toastAchievement]);

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
      dismissToast,
      enterWorld,
      visit,
      readChronicle,
      visitLocation,
      markListened,
      markGamePlayed,
      discoverEgg,
    }),
    [
      dismissToast,
      discoverEgg,
      enterWorld,
      markGamePlayed,
      markListened,
      readChronicle,
      ready,
      save,
      toasts,
      visit,
      visitLocation,
    ],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}
