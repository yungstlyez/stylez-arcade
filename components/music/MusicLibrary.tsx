"use client";

import { useLibrary } from "@/components/music/LibraryProvider";
import { ReleaseTile } from "@/components/music/ReleaseTile";
import { cueUiSound } from "@/lib/ui-sound";
import type { Release } from "@/types";

export function MusicLibrary({ releases }: { releases: Release[] }) {
  const { openLibrary } = useLibrary();
  const preview = releases.slice(0, 4);

  return (
    <section className="hud-panel flex min-h-0 flex-col overflow-hidden p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="hud-label text-cyan">LATEST RELEASES</p>
        <button
          type="button"
          className="hud-label text-lime hover:text-mist"
          onClick={() => {
            cueUiSound("press");
            openLibrary();
          }}
        >
          OPEN LIBRARY
        </button>
      </div>
      <div className="mt-3 grid min-h-0 flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
        {preview.map((release) => (
          <ReleaseTile key={release.id} release={release} compact />
        ))}
      </div>
    </section>
  );
}
