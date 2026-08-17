import { StageArt } from "@/components/game-ui/StageArt";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function GameWindow({
  title,
  eyebrow,
  children,
  className,
  actions,
  tone = "cyan",
  art,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
  tone?: "cyan" | "green" | "pink";
  /** Dedicated artwork. Omit to use a shared stage placeholder. Pass false to hide art. */
  art?: string | false;
}) {
  const stage = art === false ? null : art;

  return (
    <section
      className={cn(
        "hud-panel overflow-hidden",
        tone === "green" && "hud-panel-green",
        tone === "pink" && "hud-panel-pink",
        className,
      )}
    >
      {stage !== null ? (
        <div className="relative h-28 overflow-hidden border-b border-cyan/20 sm:h-32">
          <StageArt src={typeof stage === "string" ? stage : undefined} seed={title} />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/20 to-transparent" />
        </div>
      ) : null}
      <header className="flex items-center justify-between gap-3 border-b border-cyan/20 px-3 py-2">
        <div className="min-w-0">
          {eyebrow ? <p className="hud-label text-lime">{eyebrow}</p> : null}
          <h2 className="truncate font-display text-[11px] text-mist">{title}</h2>
        </div>
        {actions}
      </header>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}
