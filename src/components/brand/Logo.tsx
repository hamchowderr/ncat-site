import Image from "next/image";
import type { SimpleIcon } from "simple-icons";
import {
  siApplepodcasts,
  siClaude,
  siDavinciresolve,
  siFacebook,
  siFfmpeg,
  siInstagram,
  siN8n,
  siSpotify,
  siTiktok,
  siTwitch,
  siX,
  siYoutube,
} from "simple-icons";

/** A platform or company mark from Simple Icons, drawn in its own brand colour unless told otherwise. */
export function BrandIcon({ icon, mono = false, className = "bi" }: { icon: SimpleIcon; mono?: boolean; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill={mono ? "currentColor" : `#${icon.hex}`}>
      <path d={icon.path} />
    </svg>
  );
}

/** Marks that Simple Icons does not carry, served from /public/logos as each company publishes them. */
const files = {
  linkedin: { src: "/logos/linkedin.svg", alt: "LinkedIn" },
  premiere: { src: "/logos/premiere-pro.svg", alt: "Adobe Premiere Pro" },
  finalcut: { src: "/logos/final-cut-pro.png", alt: "Final Cut Pro" },
  capcut: { src: "/logos/capcut.svg", alt: "CapCut" },
} as const;

export function FileLogo({ name, size = 24 }: { name: keyof typeof files; size?: number }) {
  const f = files[name];
  return <Image className="fl" src={f.src} alt="" width={size} height={size} aria-hidden="true" />;
}

export const icons = {
  tiktok: siTiktok,
  instagram: siInstagram,
  youtube: siYoutube,
  facebook: siFacebook,
  x: siX,
  twitch: siTwitch,
  spotify: siSpotify,
  applepodcasts: siApplepodcasts,
  n8n: siN8n,
  ffmpeg: siFfmpeg,
  claude: siClaude,
  resolve: siDavinciresolve,
};

/** One logo by key, whichever source it comes from. */
export function Logo({ name, size }: { name: keyof typeof icons | keyof typeof files; size?: number }) {
  if (name in files) return <FileLogo name={name as keyof typeof files} size={size} />;
  return <BrandIcon icon={icons[name as keyof typeof icons]} />;
}
