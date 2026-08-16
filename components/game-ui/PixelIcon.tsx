import { cn } from "@/lib/cn";

const icons = {
  folder: (
    <path fill="currentColor" d="M2 4h6l2 2h8v10H2V4zm2 4h12v6H4V8z" />
  ),
  disc: (
    <>
      <path fill="currentColor" d="M4 2h8v2H4V2zm-2 4h12v8H2V6zm4 2h4v4H6V8z" />
      <path fill="#62FF5B" d="M7 9h2v2H7V9z" />
    </>
  ),
  cabinet: (
    <path fill="currentColor" d="M3 1h10v14H3V1zm2 2h6v6H5V3zm1 9h2v1H6v-1zm3 0h2v1H9v-1z" />
  ),
  world: (
    <path fill="currentColor" d="M3 3h10v10H3V3zm2 2h2v2H5V5zm4 0h2v2H9V5zM5 9h6v2H5V9z" />
  ),
  scroll: (
    <path fill="currentColor" d="M3 2h10v12H3V2zm2 3h6v1H5V5zm0 3h6v1H5V8zm0 3h4v1H5v-1z" />
  ),
  archive: (
    <path fill="currentColor" d="M2 3h12v3H2V3zm1 4h10v7H3V7zm3 2h4v2H6V9z" />
  ),
  signal: (
    <path fill="currentColor" d="M2 12h2v2H2v-2zm4-3h2v5H6V9zm4-3h2v8h-2V6zm4-4h2v12h-2V2z" />
  ),
  key: (
    <path fill="currentColor" d="M2 5h6v6H2V5zm2 2h2v2H4V7zm6 1h5v2h-2v3h-2v-3H8V8z" />
  ),
  heart: (
    <path fill="#FF2AC3" d="M3 3h3v1h1V3h3v2H9v2H7v2H6V7H4V5H3V3zm1 1v1h1V4H4zm5 0h1v1H9V4z" />
  ),
  coin: (
    <path fill="#62FF5B" d="M5 2h6v1h1v1h1v6h-1v1h-1v1H5v-1H4v-1H3V5h1V4h1V2zm2 3h2v4H7V5z" />
  ),
  sword: (
    <path fill="currentColor" d="M13 1h2v2h-1v1h-1v1h-1v1H11v1h-1v1H9v1H8v1H6v-2h1V9h1V8h1V7h1V6h1V5h1V4h1V1zM2 11h3v1h1v3H4v-1H2v-3z" />
  ),
  mic: (
    <path fill="currentColor" d="M6 1h4v7H6V1zM4 6h1v3h6V6h1v4H9v3h2v1H5v-1h2v-3H4V6z" />
  ),
  play: (
    <path fill="currentColor" d="M5 3h2v1h2v1h2v1h2v2h-2v1H9v1H7v1H5V3z" />
  ),
  star: (
    <path fill="#62FF5B" d="M7 1h2v2h2v2h2v2h-2v2H9v2H7v-2H5V7H3V5h2V3h2V1z" />
  ),
  user: (
    <path fill="currentColor" d="M6 2h4v4H6V2zM4 8h8v2H4V8zm-1 3h10v2H3v-2z" />
  ),
} as const;

export type PixelIconName = keyof typeof icons;

export function PixelIcon({
  name,
  className,
  label,
}: {
  name: PixelIconName;
  className?: string;
  label?: string;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={cn("inline-block size-4 shrink-0 pixelated", className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      shapeRendering="crispEdges"
    >
      {icons[name]}
    </svg>
  );
}
