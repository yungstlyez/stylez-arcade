import { SectionTitle } from "@/components/game-ui/SectionTitle";
import { StageArt } from "@/components/game-ui/StageArt";
import { socials } from "@/data/socials";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ONLINE",
  description: "External networks for Callmestylez.",
};

export default function OnlinePage() {
  return (
    <div>
      <SectionTitle
        kicker="SIGNAL"
        title="EXTERNAL NETWORKS"
        subtitle="Social media brings people in. This machine is the home. Jack into a channel, then come back."
      />
      <div className="grid gap-3">
        {socials.map((network) => (
          <a
            key={network.id}
            href={network.href}
            target="_blank"
            rel="noreferrer"
            className="hud-panel hud-lift relative overflow-hidden"
          >
            <div className="absolute inset-0">
              <StageArt seed={network.id} />
              <div className="absolute inset-0 bg-gradient-to-r from-void via-void/85 to-void/55" />
            </div>
            <div className="relative flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="hud-label text-lime">{network.network}</p>
                <h2 className="mt-1 font-display text-2xl uppercase">{network.label}</h2>
                <p className="text-sm text-muted">{network.handle}</p>
              </div>
              <p className="font-hud text-[10px] tracking-[0.2em] text-cyan">
                {network.placeholder ? "STANDBY" : network.signal} →
              </p>
            </div>
          </a>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted">
        TikTok, Twitch, and YouTube stay on standby until those handles are confirmed.
      </p>
    </div>
  );
}
