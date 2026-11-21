import { A16zMark, ClaudeMark, KinnMark } from "@/components/brand/Venues";
import { BrandIcon, FileLogo, icons } from "@/components/brand/Logo";

const FEEDS = [
  { icon: icons.tiktok, name: "TikTok" },
  { icon: icons.instagram, name: "Instagram" },
  { icon: icons.youtube, name: "YouTube" },
  { icon: icons.facebook, name: "Facebook" },
  { file: "linkedin" as const, name: "LinkedIn" },
  { icon: icons.x, name: "X" },
  { icon: icons.twitch, name: "Twitch" },
  { icon: icons.spotify, name: "Spotify" },
  { icon: icons.applepodcasts, name: "Apple Podcasts" },
];

export function Proof() {
  return (
    <section className="proof" aria-labelledby="proof-title">
      <div className="wrap">
        <h2 className="proof-lead" id="proof-title">
          Shown to creators and media teams at
        </h2>
        <ul className="venues">
          <li>
            <ClaudeMark className="mark claude" />
            <span>Claude Code Creators Summit</span>
          </li>
          <li>
            <A16zMark className="mark a16z" />
            <span>Tech Week Los Angeles</span>
          </li>
          <li>
            <KinnMark className="mark kinn" />
            <span className="sr">The KINN</span>
          </li>
        </ul>
        <p className="proof-lead feeds-lead">Made for every feed you post to</p>
        <ul className="feeds" aria-label="Platforms">
          {FEEDS.map((f) => (
            <li key={f.name} title={f.name}>
              {"file" in f ? <FileLogo name={f.file!} size={28} /> : <BrandIcon icon={f.icon!} />}
              <span className="sr">{f.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
