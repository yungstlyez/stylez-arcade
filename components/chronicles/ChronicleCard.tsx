import { padChronicle } from "@/lib/player-state";
import { formatDate } from "@/lib/cn";
import type { Chronicle } from "@/types";
import Link from "next/link";

export function ChronicleCard({ chronicle }: { chronicle: Chronicle }) {
  const still = chronicle.media[0]?.src ?? "/art/env-studio-crt.svg";

  return (
    <Link href={`/chronicles/${chronicle.slug}`} className="hud-panel hud-lift group block overflow-hidden">
      <div className="relative aspect-[16/9] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={still} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent" />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="hud-label text-cyan">CHRONICLE {padChronicle(chronicle.number)}</p>
          <p className="font-hud text-[10px] text-lime">{formatDate(chronicle.date)}</p>
        </div>
        <h3 className="mt-3 font-display text-sm uppercase leading-snug">{chronicle.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{chronicle.excerpt}</p>
        <p className="mt-4 font-display text-[11px] tracking-[0.16em] text-cyan">OPEN FILE</p>
      </div>
    </Link>
  );
}
