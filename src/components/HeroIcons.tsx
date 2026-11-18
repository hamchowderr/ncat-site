"use client";

import { MovingIcon } from "@/components/MovingIcon";
import FacebookIcon from "@/components/itshover/facebook-icon";
import InstagramIcon from "@/components/itshover/instagram-icon";
import LinkedinIcon from "@/components/itshover/linkedin-icon";
import TiktokIcon from "@/components/itshover/tiktok-icon";
import TwitterXIcon from "@/components/itshover/twitter-x-icon";
import YoutubeIcon from "@/components/itshover/youtube-icon";

/** Big tilted outline logos of the social platforms in the hero's side margins. Each moves when you hover it. */
export const HERO_PLATFORMS = [
  { name: "TikTok", icon: TiktokIcon, size: 96, cls: "hi-1" },
  { name: "YouTube", icon: YoutubeIcon, size: 124, cls: "hi-2" },
  { name: "X", icon: TwitterXIcon, size: 72, cls: "hi-3" },
  { name: "Instagram", icon: InstagramIcon, size: 100, cls: "hi-4" },
  { name: "LinkedIn", icon: LinkedinIcon, size: 112, cls: "hi-5" },
  { name: "Facebook", icon: FacebookIcon, size: 92, cls: "hi-6" },
];

export function HeroIcons() {
  return (
    <div className="hero-icons" aria-hidden="true">
      {HERO_PLATFORMS.map(({ name, icon, size, cls }, i) => (
        <span key={cls} className={`hi ${cls}`} data-platform={name} style={{ animationDelay: `${0.15 + i * 0.12}s` }}>
          <MovingIcon icon={icon} size={size} strokeWidth={1.6} trigger=".hi" />
        </span>
      ))}
    </div>
  );
}
