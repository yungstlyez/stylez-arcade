import { cn } from "@/lib/cn";

export function SectionTitle({
  kicker,
  title,
  subtitle,
  className,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <header className={cn("mb-6", className)}>
      {kicker ? <p className="hud-label text-lime">{kicker}</p> : null}
      <h1 className="mt-1 font-display text-3xl font-semibold uppercase tracking-[0.08em] text-mist sm:text-4xl">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">{subtitle}</p>
      ) : null}
    </header>
  );
}
