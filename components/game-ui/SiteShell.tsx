"use client";

import { BottomNav } from "@/components/game-ui/BottomNav";
import { BrandLockup } from "@/components/game-ui/BrandLockup";
import { ComingSoonOverlay } from "@/components/game-ui/ComingSoonOverlay";
import { CrtOverlay } from "@/components/game-ui/CrtOverlay";
import { GameMenu } from "@/components/game-ui/GameMenu";
import { HudDrawer } from "@/components/game-ui/HudDrawer";
import { PlayerHud } from "@/components/game-ui/PlayerHud";
import { UnlockToasts } from "@/components/game-ui/SecretUnlockNotification";
import { TopBar } from "@/components/game-ui/TopBar";
import { WorldBackdrop } from "@/components/game-ui/WorldBackdrop";
import { GlobalAudioPlayer } from "@/components/audio/GlobalAudioPlayer";
import { LibraryOverlay } from "@/components/music/LibraryOverlay";
import { FeaturedSoundCloudLayer } from "@/components/music/FeaturedSoundCloud";
import { ChronicleReader } from "@/components/chronicles/ChronicleReader";
import { ChronicleTerminal } from "@/components/chronicles/ChronicleTerminal";
import { SocialsBanner } from "@/components/hub/SocialsBanner";
import { usePlayer } from "@/components/player/PlayerProvider";
import { cn } from "@/lib/cn";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { save, ready, visit } = usePlayer();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hudOpen, setHudOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);
  const [hudPath, setHudPath] = useState(pathname);
  const titleScreen = pathname === "/" && (!ready || !save.started);
  const isMenuOpen = menuOpen && menuPath === pathname;
  const isHudOpen = hudOpen && hudPath === pathname;
  const isHub = pathname === "/";
  const [fxReady, setFxReady] = useState(false);

  useEffect(() => {
    visit(pathname);
  }, [pathname, visit]);

  useEffect(() => {
    if (titleScreen) {
      setFxReady(false);
      return;
    }
    const id = window.setTimeout(() => setFxReady(true), 350);
    return () => window.clearTimeout(id);
  }, [titleScreen]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[70] focus:bg-lime focus:px-3 focus:py-2 focus:text-bg"
      >
        Skip to content
      </a>
      <WorldBackdrop />
      <FeaturedSoundCloudLayer />
      {fxReady ? <CrtOverlay /> : null}
      <UnlockToasts />

      {!titleScreen ? (
        <div className="app-shell">
          <aside className="shell-rail relative z-50 hidden h-full w-56 shrink-0 flex-col xl:w-64 lg:flex">
            <BrandLockup />
            <div className="min-h-0 flex-1 overflow-auto px-2 pb-2">
              <GameMenu />
            </div>
            <div className="p-2">
              <PlayerHud />
            </div>
          </aside>

          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
            <TopBar
              menuOpen={isMenuOpen}
              hudOpen={isHudOpen}
              onMenu={() => {
                setMenuPath(pathname);
                setHudOpen(false);
                setMenuOpen((open) => !(open && menuPath === pathname));
              }}
              onHud={() => {
                setHudPath(pathname);
                setMenuOpen(false);
                setHudOpen((open) => !(open && hudPath === pathname));
              }}
            />
            <SocialsBanner />
            {isMenuOpen ? (
              <div id="mobile-menu" className="shell-chrome border-b p-3 lg:hidden">
                <GameMenu onNavigate={() => setMenuOpen(false)} />
              </div>
            ) : null}
            <main
              id="main"
              className={cn(
                "page-pad relative flex w-full flex-1 flex-col px-3 py-3 sm:px-4 lg:px-5",
                isHub ? "min-h-0 lg:overflow-hidden lg:py-3" : "min-h-0 overflow-auto",
              )}
            >
              {children}
            </main>
            <LibraryOverlay />
            <ComingSoonOverlay />
            <ChronicleReader />
            <ChronicleTerminal />
          </div>
        </div>
      ) : (
        <main id="main" className="relative z-10">
          {children}
        </main>
      )}

      <HudDrawer open={isHudOpen && !titleScreen} onClose={() => setHudOpen(false)} />
      <GlobalAudioPlayer visible={!titleScreen} />
      {!titleScreen ? <BottomNav /> : null}
    </>
  );
}
