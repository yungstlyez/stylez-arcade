"use client";

import { LogoMark } from "@/components/game-ui/LogoMark";
import { PixelLogo } from "@/components/game-ui/PixelLogo";
import { useComingSoon } from "@/components/game-ui/ComingSoonProvider";
import { useLibrary } from "@/components/music/LibraryProvider";
import { site } from "@/data/site";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";

export function BrandLockup() {
  const router = useRouter();
  const { closeLibrary } = useLibrary();
  const { closeComingSoon } = useComingSoon();

  return (
    <Link
      href="/"
      className="flex flex-col items-center px-3 pb-3 pt-4"
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        closeLibrary();
        closeComingSoon();
        router.push("/");
      }}
    >
      <PixelLogo size="md" className="text-center" />
      <p className="mt-2 hud-label text-cyan">{site.byline}</p>
      <LogoMark className="mt-3 h-48 w-48" />
    </Link>
  );
}
