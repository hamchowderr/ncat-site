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

/** An event's own mark, read from the same drawing the About page uses (brand/Venues.tsx), as an image. */
function mark(name: "ClaudeMark" | "A16zMark" | "KinnMark", fill: string) {
  const src = readFileSync(join(process.cwd(), "src/components/brand/Venues.tsx"), "utf8");
  const fn = src.slice(src.indexOf(`function ${name}`));
  const body = fn.slice(fn.indexOf("<svg"), fn.indexOf("</svg>") + 6);
  const viewBox = /viewBox="([^"]+)"/.exec(body)![1];
  const paths = [...body.matchAll(/<path d="([^"]+)"/g)].map((m) => `<path d="${m[1]}"/>`).join("");
  const m = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="${fill}">${paths}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(m).toString("base64")}`;
}

export type ShareArt = "clips" | "talks" | "plan";
export type ShareCard = { eyebrow: string; title: string; line: string; art: ShareArt };

export const SHARE_CARDS = {
  home: { eyebrow: "Takewon", title: "Your content, social media ready.", line: "One recording in, a clip for every feed out. No fee for each video.", art: "clips" },
  about: { eyebrow: "About Takewon", title: "Built for everyone who hit the same wall.", line: "A free engine, creators tired of paying for every step, and two talks.", art: "talks" },
  beta: { eyebrow: "The Takewon beta", title: "Help build Takewon.", line: "Free while it’s in beta. Testers invited a few at a time.", art: "clips" },
  pricing: { eyebrow: "Takewon pricing", title: "Pay once. Own your version.", line: "One purchase, a 4-week cohort with Chowderr, no fee for each video.", art: "plan" },
} satisfies Record<string, ShareCard>;

export function shareImage(card: ShareCard) {
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
          {card.art === "clips" ? <Clips /> : card.art === "talks" ? <Talks /> : <Plan />}
        </div>
      </div>
    ),
    { ...shareSize, fonts: fonts() },
  );
}

/** Home: three of the clips one interview became, fanned out. */
function Clips() {
  const clips = CLIPS.map((c) => dataUrl(`media/split/${c}.jpg`, "image/jpeg"));
  return (
    <div style={{ position: "relative", display: "flex", width: 512, height: 582 }}>
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
                top: [196, 176, 206][i],
                borderRadius: 18,
                objectFit: "cover",
                transform: `rotate(${[-6, 0, 6][i]}deg)`,
                boxShadow: "0 18px 40px -14px rgba(20,10,80,0.45)",
              }}
            />
          ))}
    </div>
  );
}

const white = { background: "#ffffff", borderRadius: 22, boxShadow: "0 18px 40px -16px rgba(41,22,140,0.35)" };

/** About: the two talks it grew out of, as the About page shows them. */
function Talks() {
  const rooms = [
    { day: "Oct 15", marks: [{ src: mark("ClaudeMark", "#D97757"), w: 46, h: 46 }, { src: mark("A16zMark", "#0b0b12"), w: 110, h: 35 }], where: "Verizon Innovation Center, Los Angeles" },
    { day: "Nov 5", marks: [{ src: mark("KinnMark", "#0b0b12"), w: 120, h: 39 }], where: "The KINN AI Cafe, Venice" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, width: 440 }}>
      {rooms.map((r, i) => (
        <div key={r.day} style={{ ...white, display: "flex", flexDirection: "column", gap: 14, padding: "24px 28px", transform: `rotate(${i ? 2 : -2}deg)` }}>
          <div style={{ display: "flex", gap: 8, fontSize: 22, color: "#5c5f6a" }}>
            <span style={{ fontWeight: 600, color: "#0b0b12" }}>{r.day}</span> 2026
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {r.marks.map((m, k) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={k} src={m.src} width={m.w} height={m.h} alt="" />
            ))}
          </div>
          <div style={{ fontSize: 21, color: "#5c5f6a" }}>{r.where}</div>
        </div>
      ))}
    </div>
  );
}

const TICK = svg("M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z", "#5b3df5");

/** Pricing: the self-hosted plan as the Pricing page lists it. */
function Plan() {
  const ticks = ["Your own version of the platform", "Unlimited runs, no meter", "One price for your whole team", "A 4-week group cohort with Chowderr"];
  return (
    <div style={{ ...white, display: "flex", flexDirection: "column", width: 400, padding: "30px 32px", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 24, fontWeight: 600 }}>
        Self-hosted
        <span style={{ fontSize: 16, color: "#3d24c4", background: "#efebfe", borderRadius: 999, padding: "4px 12px" }}>Beta</span>
      </div>
      <div style={{ fontFamily: "Archivo", fontSize: 38, fontWeight: 700, letterSpacing: -1 }}>One-time purchase</div>
      <div style={{ fontSize: 19, color: "#5c5f6a", marginBottom: 12 }}>Price announced at launch</div>
      {ticks.map((t) => (
        <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={TICK} width={22} height={22} alt="" />
          {t}
        </div>
      ))}
    </div>
  );
}
