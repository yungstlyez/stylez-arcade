"use client";

import {
  draftToChronicle,
  loadAuthoredChronicles,
  persistAuthoredChronicles,
  mergeChronicles,
  type ChronicleDraft,
} from "@/lib/chronicle-log";
import { getLatestChronicle } from "@/lib/content";
import type { Chronicle } from "@/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ChronicleContextValue = {
  chronicles: Chronicle[];
  latest: Chronicle;
  authored: Chronicle[];
  authorUnlocked: boolean;
  terminalOpen: boolean;
  reading: Chronicle | null;
  openTerminal: (editId?: string) => void;
  closeTerminal: () => void;
  editingId: string | null;
  openFile: (slug: string) => void;
  closeFile: () => void;
  saveLog: (draft: ChronicleDraft) => Chronicle;
  deleteLog: (id: string) => void;
  signOut: () => Promise<void>;
};

const ChronicleContext = createContext<ChronicleContextValue | null>(null);

async function readJson(response: Response) {
  try {
    return (await response.json()) as { message?: string; authenticated?: boolean };
  } catch {
    return {};
  }
}

export function ChronicleProvider({ children }: { children: ReactNode }) {
  const [authored, setAuthored] = useState<Chronicle[]>([]);
  const [authorUnlocked, setAuthorUnlocked] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [readingSlug, setReadingSlug] = useState<string | null>(null);

  useEffect(() => {
    const previous = loadAuthoredChronicles();
    const loaded = previous.filter(
      (item) => !/first of it.?s kind/i.test(`${item.excerpt}\n${item.content}`),
    );
    if (loaded.length !== previous.length) persistAuthoredChronicles(loaded);
    setAuthored(loaded);
    void fetch("/api/admin/session", { credentials: "include" })
      .then(readJson)
      .then((data) => setAuthorUnlocked(Boolean(data.authenticated)))
      .catch(() => setAuthorUnlocked(false));
    const params = new URLSearchParams(window.location.search);
    if (params.get("log")) setTerminalOpen(true);
  }, []);

  const chronicles = useMemo(() => mergeChronicles(authored), [authored]);
  const latest = chronicles[0] ?? getLatestChronicle();
  const reading = readingSlug ? chronicles.find((item) => item.slug === readingSlug) ?? null : null;

  const openTerminal = useCallback((editId?: string) => {
    setEditingId(editId ?? null);
    setReadingSlug(null);
    setTerminalOpen(true);
  }, []);

  const closeTerminal = useCallback(() => {
    setTerminalOpen(false);
    setEditingId(null);
  }, []);

  const openFile = useCallback((slug: string) => {
    setTerminalOpen(false);
    setReadingSlug(slug);
  }, []);

  const closeFile = useCallback(() => setReadingSlug(null), []);

  const saveLog = useCallback((draft: ChronicleDraft) => {
    const nextEntry = draftToChronicle(draft, mergeChronicles(authored));
    setAuthored((current) => {
      const next = current.some((item) => item.id === nextEntry.id)
        ? current.map((item) => (item.id === nextEntry.id ? nextEntry : item))
        : [nextEntry, ...current.filter((item) => item.id !== nextEntry.id)];
      persistAuthoredChronicles(next);
      return next;
    });
    return nextEntry;
  }, [authored]);

  const deleteLog = useCallback((id: string) => {
    setAuthored((current) => {
      const next = current.filter((item) => item.id !== id);
      persistAuthoredChronicles(next);
      return next;
    });
    setEditingId((current) => (current === id ? null : current));
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    setAuthorUnlocked(false);
    setTerminalOpen(false);
    setEditingId(null);
  }, []);

  const value = useMemo<ChronicleContextValue>(
    () => ({
      chronicles,
      latest,
      authored,
      authorUnlocked,
      terminalOpen,
      reading,
      openTerminal,
      closeTerminal,
      editingId,
      openFile,
      closeFile,
      saveLog,
      deleteLog,
      signOut,
    }),
    [
      authored,
      authorUnlocked,
      chronicles,
      closeFile,
      closeTerminal,
      deleteLog,
      editingId,
      latest,
      openFile,
      openTerminal,
      reading,
      saveLog,
      signOut,
      terminalOpen,
    ],
  );

  return <ChronicleContext.Provider value={value}>{children}</ChronicleContext.Provider>;
}

export function useChronicles() {
  const context = useContext(ChronicleContext);
  if (!context) throw new Error("useChronicles must be used inside ChronicleProvider");
  return context;
}
