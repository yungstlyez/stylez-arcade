import Link from "next/link";

export function RelatedList({
  title,
  items,
}: {
  title: string;
  items: { href: string; label: string; note?: string; external?: boolean }[];
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="font-hud text-base text-green">{title}</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.href}>
            {item.external ? (
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center border-2 border-white bg-bg-3 px-3 font-hud text-base text-cream hover:bg-blue hover:text-green"
              >
                {item.label}
                {item.note ? (
                  <span className="ml-2 font-hud text-[9px] tracking-[0.14em] text-magenta">{item.note}</span>
                ) : null}
              </a>
            ) : (
              <Link
                href={item.href}
                className="inline-flex min-h-10 items-center border-2 border-white bg-bg-3 px-3 font-hud text-base text-cream hover:bg-blue hover:text-green"
              >
                {item.label}
                {item.note ? (
                  <span className="ml-2 font-hud text-[9px] tracking-[0.14em] text-magenta">{item.note}</span>
                ) : null}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
