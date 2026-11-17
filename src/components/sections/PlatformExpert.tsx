import { BrandIcon, FileLogo, icons } from "@/components/brand/Logo";

const PLATFORMS = [
  { icon: icons.tiktok, name: "TikTok", formats: "Short videos, carousels, Stories" },
  { icon: icons.instagram, name: "Instagram", formats: "Reels, Stories, carousels, posts" },
  { icon: icons.youtube, name: "YouTube", formats: "Long-form, Shorts, thumbnails, chapters" },
  { icon: icons.facebook, name: "Facebook", formats: "Reels, video posts, Stories" },
  { file: "linkedin" as const, name: "LinkedIn", formats: "Native video, document carousels" },
  { icon: icons.x, name: "X", formats: "Video clips, posts, threads" },
  { icon: icons.spotify, name: "Spotify", formats: "Audio and video podcast episodes" },
  { icon: icons.applepodcasts, name: "Apple Podcasts", formats: "Episodes, chapters, transcripts" },
];

export function PlatformExpert() {
  return (
    <section className="platforms" aria-labelledby="platforms-title">
      <div className="wrap">
        <header className="sec-head">
          <h2 id="platforms-title">It knows every feed you post to</h2>
          <p>The agent knows each platform’s shapes, lengths and formats, and builds clips that fit them, starting with the main ones.</p>
        </header>
        <ul className="plat-grid">
          {PLATFORMS.map((p) => (
            <li key={p.name}>
              <span className="plat-logo">{"file" in p ? <FileLogo name={p.file!} size={26} /> : <BrandIcon icon={p.icon!} />}</span>
              <span className="plat-text">
                <span className="plat-name">{p.name}</span>
                <span className="plat-formats">{p.formats}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
