import { listenHref } from "@/lib/content";
import type { Release } from "@/types";
import type { ReactNode } from "react";

export function ListenLink({
  release,
  className,
  children,
}: {
  release: Release;
  className?: string;
  children: ReactNode;
}) {
  const href = listenHref(release);
  if (!href) return <span className={className}>{children}</span>;

  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children}
    </a>
  );
}
