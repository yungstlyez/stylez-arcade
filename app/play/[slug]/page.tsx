import { ReturnLink } from "@/components/game-ui/ReturnLink";
import { GameWindow } from "@/components/game-ui/GameWindow";
import { GameViewport } from "@/components/play/GameViewport";
import { SoundCloudOnlyTag } from "@/components/music/SoundCloudOnlyTag";
import { getGame, getGames, getRelease, listenHref } from "@/lib/content";
import { statusLabel } from "@/lib/cn";
import type { SlugParams } from "@/types/pages";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return getGames().map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({
  params,
}: SlugParams): Promise<Metadata> {
  const { slug } = await params;
  const game = getGame(slug);
  return { title: game?.name ?? "CABINET" };
}

export default async function GamePage({ params }: SlugParams) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();
  const soundtrack = getRelease(game.soundtrack);
  const soundtrackHref = soundtrack ? listenHref(soundtrack) : undefined;

  return (
    <article>
      <ReturnLink href="/play" />
      <p className="font-hud text-[10px] tracking-[0.24em] text-gold">{statusLabel(game.status)}</p>
      <h1 className="mt-2 font-display text-2xl uppercase leading-snug sm:text-3xl">{game.name}</h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">{game.description}</p>
      <div className="mt-6">
        <GameViewport gameId={game.id} locked={game.status !== "live"} label="LOCKED" art={game.thumbnail} />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <GameWindow title="SOUNDTRACK" eyebrow="CHAPTER">
          {soundtrack ? (
            <div className="space-y-2">
              {soundtrackHref ? (
                <a
                  href={soundtrackHref}
                  target="_blank"
                  rel="noreferrer"
                  className="font-display text-sm uppercase leading-snug text-gold"
                >
                  {soundtrack.title}
                </a>
              ) : (
                <Link href={`/music/${soundtrack.slug}`} className="font-display text-sm uppercase leading-snug text-gold">
                  {soundtrack.title}
                </Link>
              )}
              {soundtrack.soundcloudOnly ? <SoundCloudOnlyTag /> : null}
            </div>
          ) : (
            <p className="text-sm text-muted">Unassigned.</p>
          )}
        </GameWindow>
        <GameWindow title="CABINET DATA" eyebrow="STATUS">
          <ul className="space-y-1 font-hud text-xs tracking-[0.12em] text-muted">
            <li>HIGH SCORE · {game.highScore ?? 0}</li>
            <li>RELEASE · {game.releaseDate ?? "TBD"}</li>
            <li>ENGINE SLOT · PHASER-READY</li>
          </ul>
        </GameWindow>
      </div>
      <p className="mt-6 text-sm text-muted">
        TODO: embed Phaser.js (or another engine) inside GameViewport when FLATBED RUN ships. Do not
        rebuild site chrome for the game.
      </p>
    </article>
  );
}
