import { cn } from "@/lib/cn";
import { placeholderStage } from "@/lib/placeholders";

export function StageArt({
  src,
  seed = "stylez",
  className,
  alt = "",
}: {
  src?: string;
  seed?: string;
  className?: string;
  alt?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src ?? placeholderStage(seed)}
      alt={alt}
      className={cn("pixelated h-full w-full object-cover", className)}
    />
  );
}
