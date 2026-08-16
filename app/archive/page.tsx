import { SectionTitle } from "@/components/game-ui/SectionTitle";
import { getArchive } from "@/lib/content";
import { statusLabel } from "@/lib/cn";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ARCHIVE",
  description: "Recovered media, previous eras, and damaged files.",
};

export default function ArchivePage() {
  const items = getArchive();

  return (
    <div>
      <SectionTitle
        kicker="RECOVERED MEDIA"
        title="ARCHIVE"
        subtitle="Old save files. Flyers. Voice notes. Eras that still have a drawer even if they do not have a key."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article key={item.id} className="game-panel overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image} alt="" className="pixelated aspect-[16/10] w-full object-cover" />
            <div className="p-4">
              <p className="font-hud text-[10px] tracking-[0.18em] text-gold">
                {item.year} · {item.type.toUpperCase()} · {statusLabel(item.status)}
              </p>
              <h2 className="mt-2 font-display text-xl uppercase">{item.title}</h2>
              <p className="mt-1 font-hud text-[10px] tracking-[0.14em] text-muted">ERA · {item.era}</p>
              <p className="mt-3 text-sm leading-6 text-muted">{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
