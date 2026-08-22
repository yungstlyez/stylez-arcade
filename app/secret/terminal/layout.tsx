import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "TERMINAL",
  robots: { index: false, follow: false },
};

export default function TerminalLayout({ children }: { children: ReactNode }) {
  return children;
}
