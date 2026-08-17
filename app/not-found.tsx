import Link from "next/link";
import { StageArt } from "@/components/game-ui/StageArt";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden border border-cyan/20 text-center">
      <StageArt seed="404" className="absolute inset-0" />
      <div className="absolute inset-0 bg-void/75" />
      <div className="relative px-6 py-16">
        <p className="hud-label text-lime">ERROR 404</p>
        <h1 className="mt-3 font-display text-2xl uppercase leading-snug sm:text-3xl">FILE NOT FOUND</h1>
        <p className="mt-3 max-w-sm text-sm text-muted">
          This sector is empty, locked, or not written yet. Return to Southside.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center border border-lime px-4 font-display text-[11px] tracking-[0.18em] text-lime"
        >
          RETURN
        </Link>
      </div>
    </div>
  );
}
