import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siFacebook, siInstagram, siTiktok, siX, siYoutube } from "simple-icons";

/** Share cards (Open Graph and X) are 1200 by 630, the size every network crops to. */
export const shareSize = { width: 1200, height: 630 };

const pub = (p: string) => join(process.cwd(), "public", p);
const font = (f: string) => readFileSync(join(process.cwd(), "src/assets/fonts", f));
/** The site's own type: Archivo for headlines, Geist for the rest (both SIL Open Font License). */
const fonts = () => [
  { name: "Archivo", data: font("Archivo-wght-700.ttf"), weight: 700 as const, style: "normal" as const },
  { name: "Geist", data: font("Geist-wght-400.ttf"), weight: 400 as const, style: "normal" as const },
  { name: "Geist", data: font("Geist-wght-600.ttf"), weight: 600 as const, style: "normal" as const },
];
const MARK = `data:image/svg+xml;base64,${Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#5b3df5"/><path d="M26 19.5v25L45 32z" fill="#fff"/></svg>').toString("base64")}`;
const dataUrl = (p: string, type: string) => `data:${type};base64,${readFileSync(pub(p)).toString("base64")}`;

/** The feeds a recording comes out ready for, drawn with their real marks and colours. */
const FEEDS: { name: string; src: () => string }[] = [
  { name: "TikTok", src: () => svg(siTiktok.path, "#000000") },
  { name: "Instagram", src: () => svg(siInstagram.path, "#E4405F") },
  { name: "YouTube", src: () => svg(siYoutube.path, "#FF0000") },
  { name: "LinkedIn", src: () => dataUrl("logos/linkedin.svg", "image/svg+xml") },
  { name: "Facebook", src: () => svg(siFacebook.path, "#0866FF") },
  { name: "X", src: () => svg(siX.path, "#000000") },
];
function svg(path: string, fill: string) {
  const s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${fill}" d="${path}"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(s).toString("base64")}`;
}

/** Real stills from the clips the home page's scene makes from one interview. */
const CLIPS = ["tiktok", "instagram", "youtube"] as const;

export type ShareCard = { eyebrow: string; title: string; line: string };

export const SHARE_CARDS = {
  home: { eyebrow: "Takewon", title: "Your content, social media ready.", line: "One recording in, a clip for every feed out. No fee for each video." },
  about: { eyebrow: "About Takewon", title: "Built for everyone who hit the same wall.", line: "A free engine, creators tired of paying for every step, and two talks." },
  pricing: { eyebrow: "Takewon pricing", title: "Pay once. Own your version.", line: "One purchase, a 4-week cohort with Chowderr, no fee for each video." },
} satisfies Record<string, ShareCard>;

export function shareImage(card: ShareCard) {
  const clips = CLIPS.map((c) => dataUrl(`media/split/${c}.jpg`, "image/jpeg"));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#ffffff", color: "#0b0b12", fontFamily: "Geist" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 0 64px 72px", width: 640 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30, fontWeight: 600 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={MARK} width={48} height={48} alt="" />
            {card.eyebrow}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ fontFamily: "Archivo", fontSize: 64, fontWeight: 700, lineHeight: 1.04, letterSpacing: -2 }}>{card.title}</div>
            <div style={{ fontSize: 27, lineHeight: 1.35, color: "#5c5f6a" }}>{card.line}</div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {FEEDS.map((f) => (
              <div key={f.name} style={{ width: 60, height: 60, borderRadius: 16, background: "#ffffff", boxShadow: "0 8px 22px -8px rgba(41,22,140,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.src()} width={30} height={30} alt="" />
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#efebfe", margin: 24, borderRadius: 32, position: "relative" }}>
          {/* the middle (4:5) clip last, so it sits on top of the two tall ones */}
          {[0, 2, 1].map((i) => ({ i, src: clips[i]! })).map(({ i, src }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt=""
              width={i === 1 ? 200 : 168}
              height={i === 1 ? 250 : 299}
              style={{
                position: "absolute",
                left: [40, 168, 300][i],
                top: [128, 110, 140][i],
                borderRadius: 18,
                objectFit: "cover",
                transform: `rotate(${[-6, 0, 6][i]}deg)`,
                boxShadow: "0 18px 40px -14px rgba(20,10,80,0.45)",
              }}
            />
          ))}
        </div>
      </div>
    ),
    { ...shareSize, fonts: fonts() },
  );
}
