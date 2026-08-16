import { cn } from "@/lib/cn";
import { site } from "@/data/site";

export function PixelLogo({
  text = site.title,
  size = "md",
  className,
}: {
  text?: string;
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
}) {
  const sizes = {
    sm: "font-pixel text-[10px] logo-snes",
    md: "font-pixel text-[11px] leading-tight logo-snes xl:text-[13px]",
    lg: "font-pixel text-3xl logo-snes sm:text-4xl",
    hero: "font-pixel text-[7vw] leading-none logo-snes logo-snes-lg sm:text-6xl lg:text-7xl",
  } as const;

  return <span className={cn(sizes[size], className)}>{text}</span>;
}
