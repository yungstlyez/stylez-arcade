import { JetBrains_Mono, IBM_Plex_Sans, Press_Start_2P, Orbitron } from "next/font/google";
import { AppProviders } from "@/components/player/AppProviders";
import { SiteShell } from "@/components/game-ui/SiteShell";
import { site } from "@/data/site";
import type { Metadata, Viewport } from "next";
import "./globals.css";

const ibm = IBM_Plex_Sans({
  variable: "--font-ibm",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const pixel = Press_Start_2P({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: "400",
});

const hud = JetBrains_Mono({
  variable: "--font-hud",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: site.title,
    template: `%s · ${site.title}`,
  },
  description: site.description,
  applicationName: "Stylez Arcade",
  authors: [{ name: site.artist }],
  keywords: [site.artist, "Stylez", "Southside", "Queens", "hip-hop"],
  openGraph: {
    title: site.title,
    description: site.description,
    siteName: site.title,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#020B11",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${ibm.variable} ${pixel.variable} ${hud.variable} ${orbitron.variable} h-full`}>
      <body className="min-h-full bg-bg font-sans text-cream">
        <AppProviders>
          <SiteShell>{children}</SiteShell>
        </AppProviders>
      </body>
    </html>
  );
}
