import { cn } from "@/lib/cn";

export function ComingSoonTag({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex border border-magenta/70 bg-void/85 px-2 py-0.5 font-hud tracking-[0.16em] text-magenta",
        compact ? "text-[8px]" : "text-[9px]",
        className,
      )}
    >
      {compact ? "SOON" : "COMING SOON"}
    </span>
  );
}
