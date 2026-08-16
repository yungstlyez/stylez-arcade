import type { LocationRecord } from "@/types";
import Link from "next/link";

export function LocationCard({ location }: { location: LocationRecord }) {
  return (
    <Link href={`/world/locations/${location.slug}`} className="hud-panel hud-lift group block overflow-hidden">
      <div className="relative aspect-[16/10] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={location.image}
          alt={`${location.name} location art`}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent" />
      </div>
      <div className="p-4">
        <p className="hud-label text-pink">LOCATION FILE</p>
        <h3 className="mt-1 font-display text-2xl uppercase">{location.name}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{location.description}</p>
        <p className="mt-3 font-display text-[11px] tracking-[0.16em] text-pink">ENTER</p>
      </div>
    </Link>
  );
}
