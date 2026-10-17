"use client";

import { cn } from "@/lib/cn";
import { cueUiSound } from "@/lib/ui-sound";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
  children: ReactNode;
  href?: string;
};

export function PixelButton({ variant = "primary", className, children, onClick, href, ...props }: Props) {
  const styles = {
    primary:
      "bg-green/90 text-bg border-lime/70 hover:bg-lime play-orb shadow-[0_0_24px_rgba(25,230,66,0.28)]",
    ghost:
      "glass-btn text-cyan border-cyan/40 hover:border-cyan hover:text-mist hover:bg-cyan/10",
    danger:
      "bg-magenta/70 text-mist border-pink/70 hover:bg-pink shadow-[0_0_20px_rgba(242,11,168,0.25)]",
  } as const;

  const classes = cn(
    "hud-press inline-flex min-h-10 items-center justify-center gap-2 rounded-full border px-5 py-2 font-display text-[10px] uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-50",
    styles[variant],
    className,
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={classes}
        onClick={() => cueUiSound("press")}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      className={classes}
      onClick={(event) => {
        cueUiSound("press");
        onClick?.(event);
      }}
      {...props}
    >
      {children}
    </button>
  );
}
