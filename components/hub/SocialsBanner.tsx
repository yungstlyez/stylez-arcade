"use client";

import { hubSocials } from "@/data/socials";
import { cueUiSound } from "@/lib/ui-sound";

export function SocialsBanner() {
  return (
    <div className="social-banner lg:hidden" role="region" aria-label="Socials">
      <div className="social-marquee">
        <BannerTrack />
        <BannerTrack duplicate />
      </div>
    </div>
  );
}

function BannerTrack({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center" aria-hidden={duplicate || undefined}>
      {hubSocials.map((item) => (
        <li key={`${duplicate ? "b" : "a"}-${item.id}`} className="flex shrink-0 items-center">
          <div className="flex flex-col justify-center px-5 py-2">
            <span className="flex gap-2">
              {item.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={() => cueUiSound("hover")}
                  className="hud-label text-[9px] text-pink hover:text-lime"
                >
                  {link.label}
                </a>
              ))}
            </span>
            <a
              href={item.links[0].href}
              target="_blank"
              rel="noreferrer"
              onMouseEnter={() => cueUiSound("hover")}
              className="mt-0.5 font-display text-xl font-semibold leading-none tracking-[-0.03em] text-mist hover:text-lime"
            >
              {item.handle}
            </a>
          </div>
          <span aria-hidden="true" className="text-[10px] text-magenta/70">
            ◆
          </span>
        </li>
      ))}
    </ul>
  );
}
