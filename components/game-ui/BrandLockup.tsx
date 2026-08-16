import { LogoMark } from "@/components/game-ui/LogoMark";
import { PixelLogo } from "@/components/game-ui/PixelLogo";
import { site } from "@/data/site";
import Link from "next/link";

export function BrandLockup() {
  return (
    <Link href="/" className="flex flex-col items-center px-3 pb-3 pt-4">
      <PixelLogo size="md" className="text-center" />
      <p className="mt-2 hud-label text-cyan">{site.byline}</p>
      <LogoMark className="mt-3 h-48 w-48" />
    </Link>
  );
}
