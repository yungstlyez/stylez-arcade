import { ReturnLink } from "@/components/game-ui/ReturnLink";
import { SectionTitle } from "@/components/game-ui/SectionTitle";
import { ItemCard } from "@/components/world/ItemCard";
import { getItems } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "ITEMS" };

export default function ItemsPage() {
  return (
    <div>
      <ReturnLink href="/world" />
      <SectionTitle
        kicker="INVENTORY"
        title="ITEMS"
        subtitle="Relics, tools, and objects that keep showing up in the footage."
      />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {getItems().map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
