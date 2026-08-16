import { site } from "@/data/site";
import { cn } from "@/lib/cn";

export function LogoMark({
  className,
  alt = "Stylez",
}: {
  className?: string;
  alt?: string;
}) {
  return (
    <span
      role="img"
      aria-label={alt}
      className={cn("logo-mark inline-block shrink-0 bg-green", className)}
      style={{
        WebkitMaskImage: `url(${site.logo})`,
        maskImage: `url(${site.logo})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        maskMode: "luminance",
      }}
    />
  );
}
