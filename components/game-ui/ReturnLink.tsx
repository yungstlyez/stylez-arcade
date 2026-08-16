import Link from "next/link";

export function ReturnLink({ href = "/", label = "RETURN" }: { href?: string; label?: string }) {
  return (
    <Link
      href={href}
      className="mb-5 inline-flex min-h-11 items-center font-hud text-[11px] font-bold tracking-[0.16em] text-cyan hover:text-lime"
    >
      ← {label}
    </Link>
  );
}
