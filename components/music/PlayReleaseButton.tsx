import { PixelButton } from "@/components/game-ui/PixelButton";
import { listenHref } from "@/lib/content";
import type { Release } from "@/types";

export function PlayReleaseButton({ release }: { release: Release }) {
  const href = listenHref(release);
  if (!href) return null;

  return <PixelButton href={href}>PLAY</PixelButton>;
}
