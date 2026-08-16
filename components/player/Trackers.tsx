"use client";

import { usePlayer } from "@/components/player/PlayerProvider";
import { useEffect } from "react";

export function ChronicleTracker({ slug }: { slug: string }) {
  const { readChronicle } = usePlayer();
  useEffect(() => {
    readChronicle(slug);
  }, [readChronicle, slug]);
  return null;
}

export function LocationTracker({ slug }: { slug: string }) {
  const { visitLocation } = usePlayer();
  useEffect(() => {
    visitLocation(slug);
  }, [slug, visitLocation]);
  return null;
}
