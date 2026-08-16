import type { ItemRecord } from "@/types";
import Link from "next/link";

export function ItemCard({ item }: { item: ItemRecord }) {
  return (
    <Link href={`/world/items/${item.slug}`} className="hud-panel hud-lift group block overflow-hidden">
      <div className="cover-frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.image} alt={`${item.name} item art`} className="pixelated aspect-square w-full object-cover" />
      </div>
      <div className="p-4">
        <p className="hud-label text-lime">{item.rarity.toUpperCase()}</p>
        <h3 className="mt-1 font-display text-2xl uppercase">{item.name}</h3>
      </div>
    </Link>
  );
}
