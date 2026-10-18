import { cn } from "@/lib/cn";

export function AllPlatsTag({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex border border-cyan/80 bg-void/85 px-2 py-0.5 font-hud tracking-[0.16em] text-cyan",
        compact ? "text-[8px]" : "text-[9px]",
        className,
      )}
    >
      ALL PLATS
    </span>
  );
}
