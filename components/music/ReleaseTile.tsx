"use client";

import { AllPlatsTag } from "@/components/music/AllPlatsTag";
import { ListenLink } from "@/components/music/ListenLink";
import { SoundCloudOnlyTag } from "@/components/music/SoundCloudOnlyTag";
import { cueUiSound } from "@/lib/ui-sound";
import type { Release } from "@/types";

export function ReleaseTile({
  release,
  compact = false,
}: {
  release: Release;
  compact?: boolean;
}) {
  return (
    <ListenLink release={release} className="hud-lift min-w-0">
      <div className="cover-frame aspect-square" onMouseEnter={() => cueUiSound("hover")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={release.cover} alt={release.title} className="h-full w-full object-cover" />
        {release.soundcloudOnly ? (
          <SoundCloudOnlyTag
            compact={compact}
            className="absolute left-1 top-1 z-10 max-w-[calc(100%-0.5rem)]"
          />
        ) : (
          <AllPlatsTag
            compact={compact}
            className="absolute left-1 top-1 z-10 max-w-[calc(100%-0.5rem)]"
          />
        )}
      </div>
      <p className="mt-2 truncate font-display text-[11px] text-mist">{release.title}</p>
      <p className="font-hud text-[10px] text-muted">
        {release.type} • {release.year}
      </p>
    </ListenLink>
  );
}
