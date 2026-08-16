import { PixelButton } from "@/components/game-ui/PixelButton";
import { ListenLink } from "@/components/music/ListenLink";
import { SoundCloudOnlyTag } from "@/components/music/SoundCloudOnlyTag";
import { cn } from "@/lib/cn";
import { listenHref } from "@/lib/content";
import type { Release } from "@/types";
import Link from "next/link";

export function ReleaseCard({ release, featured = false }: { release: Release; featured?: boolean }) {
  const href = listenHref(release);

  return (
    <article
      className={cn(
        "hud-panel hud-lift group flex flex-col overflow-hidden",
        featured && "hud-panel-green",
      )}
    >
      <ListenLink release={release} className="cover-frame block overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={release.cover}
          alt={`${release.title} cover art`}
          className="aspect-square w-full object-cover"
        />
        {release.soundcloudOnly ? (
          <SoundCloudOnlyTag className="absolute left-2 top-2 z-10" />
        ) : null}
      </ListenLink>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="hud-label text-cyan">
            {release.type} • {release.year}
            {release.rarity ? ` • ${release.rarity}` : ""}
          </p>
          <h3 className="mt-1 font-display text-2xl uppercase leading-tight">
            <ListenLink release={release}>{release.title}</ListenLink>
          </h3>
          {release.subtitle ? <p className="mt-1 text-sm text-muted">{release.subtitle}</p> : null}
          {release.soundcloudOnly ? <SoundCloudOnlyTag className="mt-2" /> : null}
        </div>
        <div className="mt-auto flex gap-2">
          {href ? <PixelButton href={href}>PLAY</PixelButton> : null}
          <Link
            href={`/music/${release.slug}`}
            className="inline-flex min-h-10 items-center border border-cyan/50 px-4 font-display text-[11px] tracking-[0.16em] text-cyan hover:border-cyan"
          >
            OPEN FILE
          </Link>
        </div>
      </div>
    </article>
  );
}
