"use client";

import { PixelIcon, type PixelIconName } from "@/components/game-ui/PixelIcon";
import { mobileNavItems } from "@/data/site";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile"
      className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-cyan/20 bg-void/95 lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {mobileNavItems.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 font-display text-[10px] tracking-[0.12em]",
                  active ? "bg-green/10 text-lime" : "text-muted",
                )}
              >
                <PixelIcon name={item.icon as PixelIconName} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
