import { cn } from "@/lib/cn";

export function soundCloudEmbedSrc(permalink: string, visual = true) {
  const params = new URLSearchParams({
    url: permalink,
    color: "#19e642",
    auto_play: "false",
    hide_related: "true",
    show_comments: "false",
    show_user: "true",
    show_reposts: "false",
    show_teaser: "false",
    visual: visual ? "true" : "false",
  });
  return `https://w.soundcloud.com/player/?${params.toString()}`;
}

export function SoundCloudEmbed({
  url,
  title,
  visual = true,
  className,
}: {
  url: string;
  title: string;
  visual?: boolean;
  className?: string;
}) {
  return (
    <iframe
      title={`${title} on SoundCloud`}
      src={soundCloudEmbedSrc(url, visual)}
      allow="autoplay"
      loading="lazy"
      className={cn("h-full w-full border-0", className)}
    />
  );
}
