"use client";

import { MovingIcon } from "@/components/MovingIcon";
import InstagramIcon from "@/components/itshover/instagram-icon";
import PlayerIcon from "@/components/itshover/player-icon";
import SendIcon from "@/components/itshover/send-icon";
import Stack3Icon from "@/components/itshover/stack-3-icon";
import UploadIcon from "@/components/itshover/upload-icon";
import YoutubeIcon from "@/components/itshover/youtube-icon";

/** Big tilted outline icons in the hero's side margins. Each moves when you hover it. */
const ICONS = [
  { icon: UploadIcon, size: 88, cls: "hi-1" },
  { icon: PlayerIcon, size: 132, cls: "hi-2" },
  { icon: YoutubeIcon, size: 76, cls: "hi-3" },
  { icon: InstagramIcon, size: 96, cls: "hi-4" },
  { icon: Stack3Icon, size: 124, cls: "hi-5" },
  { icon: SendIcon, size: 92, cls: "hi-6" },
];

export function HeroIcons() {
  return (
    <div className="hero-icons" aria-hidden="true">
      {ICONS.map(({ icon, size, cls }, i) => (
        <span key={cls} className={`hi ${cls}`} style={{ animationDelay: `${0.15 + i * 0.12}s` }}>
          <MovingIcon icon={icon} size={size} strokeWidth={1.6} trigger=".hi" />
        </span>
      ))}
    </div>
  );
}
