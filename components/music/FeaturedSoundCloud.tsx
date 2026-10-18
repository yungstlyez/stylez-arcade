"use client";

import { SoundCloudEmbed } from "@/components/music/SoundCloudEmbed";
import { useComingSoon } from "@/components/game-ui/ComingSoonProvider";
import { useLibrary } from "@/components/music/LibraryProvider";
import { useChronicles } from "@/components/chronicles/ChronicleProvider";
import { usePlayer } from "@/components/player/PlayerProvider";
import { site } from "@/data/site";
import type { Track } from "@/types";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useMemo, useRef } from "react";

export const FEATURED_SC_SLOT_ID = "featured-sc-slot";

const PARKED =
  "position:fixed;left:-10000px;top:0;width:320px;height:166px;opacity:0;pointer-events:none;z-index:0;overflow:hidden;";

/** Stable host for the artist-page widget — SoundCloud owns track-to-track advance. */
export const SOUNDCLOUD_CATALOG_TRACK: Track = {
  id: "sc-artist-catalog",
  title: `${site.artist} · SoundCloud`,
  artist: site.artist,
  cover: site.portrait,
  src: "",
  slug: "soundcloud",
  preferExternal: true,
  soundcloudUrl: site.soundcloud,
};

export function FeaturedSoundCloudSlot({ className }: { className?: string }) {
  return <div id={FEATURED_SC_SLOT_ID} className={className} />;
}

export function FeaturedSoundCloudLayer() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { open: libraryOpen } = useLibrary();
  const { open: comingSoonOpen } = useComingSoon();
  const { terminalOpen, reading } = useChronicles();
  const { save, ready } = usePlayer();
  const url = site.soundcloud;
  const track = useMemo(() => SOUNDCLOUD_CATALOG_TRACK, []);
  const showOnHome =
    ready &&
    save.started &&
    pathname === "/" &&
    !libraryOpen &&
    !comingSoonOpen &&
    !terminalOpen &&
    !reading;

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const park = () => {
      wrap.style.cssText = PARKED;
    };

    const sync = () => {
      if (!showOnHome) {
        park();
        return;
      }
      const slot = document.getElementById(FEATURED_SC_SLOT_ID);
      if (!slot) {
        park();
        return;
      }
      const rect = slot.getBoundingClientRect();
      if (rect.width < 8 || rect.height < 8) {
        park();
        return;
      }
      wrap.style.cssText = `position:fixed;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;opacity:1;pointer-events:auto;z-index:20;overflow:hidden;`;
    };

    sync();
    const mutations = new MutationObserver(sync);
    mutations.observe(document.body, { childList: true, subtree: true });
    const resize = new ResizeObserver(sync);
    resize.observe(document.documentElement);
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, true);
    return () => {
      mutations.disconnect();
      resize.disconnect();
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync, true);
    };
  }, [showOnHome]);

  if (!url) return null;

  return (
    <div ref={wrapRef} aria-hidden={!showOnHome}>
      <SoundCloudEmbed
        url={url}
        title={`${site.artist} on SoundCloud`}
        track={track}
        autoPlay
        advanceOnEnd={false}
        visual={false}
        className="size-full"
      />
    </div>
  );
}
