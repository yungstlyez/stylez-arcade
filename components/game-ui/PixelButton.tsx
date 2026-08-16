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
    primary: "bg-green text-bg border-lime hover:bg-lime play-orb",
    ghost: "bg-navy/80 text-cyan border-cyan/50 hover:border-cyan hover:text-mist",
    danger: "bg-magenta/80 text-mist border-pink hover:bg-pink",
  } as const;

  const classes = cn(
    "hud-press inline-flex min-h-10 items-center justify-center gap-2 border px-4 py-2 font-display text-[11px] font-semibold uppercase tracking-[0.16em] disabled:cursor-not-allowed disabled:opacity-50",
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
