"use client";

import { useLibrary } from "@/components/music/LibraryProvider";
import { useEffect } from "react";

export function OpenLibraryOnMount() {
  const { openLibrary } = useLibrary();

  useEffect(() => {
    openLibrary();
  }, [openLibrary]);

  return null;
}
