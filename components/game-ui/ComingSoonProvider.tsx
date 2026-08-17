"use client";

import { isComingSoonHref, type ComingSoonHref } from "@/data/site";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type ComingSoonContextValue = {
  open: boolean;
  href: ComingSoonHref | null;
  openComingSoon: (href: string) => void;
  closeComingSoon: () => void;
};

const ComingSoonContext = createContext<ComingSoonContextValue | null>(null);

export function ComingSoonProvider({ children }: { children: ReactNode }) {
  const [href, setHref] = useState<ComingSoonHref | null>(null);
  const openComingSoon = useCallback((next: string) => {
    if (isComingSoonHref(next)) setHref(next);
  }, []);
  const closeComingSoon = useCallback(() => setHref(null), []);
  const value = useMemo(
    () => ({
      open: href !== null,
      href,
      openComingSoon,
      closeComingSoon,
    }),
    [href, openComingSoon, closeComingSoon],
  );

  return <ComingSoonContext.Provider value={value}>{children}</ComingSoonContext.Provider>;
}

export function useComingSoon() {
  const context = useContext(ComingSoonContext);
  if (!context) {
    throw new Error("useComingSoon must be used within ComingSoonProvider");
  }
  return context;
}
