"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type LibraryContextValue = {
  open: boolean;
  openLibrary: () => void;
  closeLibrary: () => void;
};

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openLibrary = useCallback(() => setOpen(true), []);
  const closeLibrary = useCallback(() => setOpen(false), []);
  const value = useMemo(
    () => ({ open, openLibrary, closeLibrary }),
    [open, openLibrary, closeLibrary],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error("useLibrary must be used within LibraryProvider");
  }
  return context;
}
