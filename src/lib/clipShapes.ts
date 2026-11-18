/**
 * The clip shapes and longest lengths the dashboard's Clips step makes for each social platform.
 * Copied from the dashboard's own table (ncat-dash packages/automation-core/src/clips.ts, PLATFORMS),
 * so the site never promises a shape the product does not make. Keep the two in step.
 */
export type Frame = "9:16" | "4:5" | "1:1" | "16:9" | "original";

/**
 * `maxSeconds` is where the Clips step cuts. `takes` is what the platform itself accepts, from its
 * own help or developer page (`source`), last checked on CHECKED. The two differ on purpose: the
 * step cuts short clips even where a platform takes longer videos.
 */
export type Place = { place: string; frame: Frame; maxSeconds: number; takes: string; source: string };

export const CHECKED = "18 Nov 2026";

const SRC = {
  tiktok: "https://developers.tiktok.com/doc/content-posting-api-media-transfer-guide",
  shorts: "https://support.google.com/youtube/answer/15424877",
  youtube: "https://support.google.com/youtube/answer/71673",
  x: "https://docs.x.com/x-api/media/quickstart/best-practices",
  instagram: "https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media",
  fbReels: "https://developers.facebook.com/docs/video-api/guides/reels-publishing",
  fbAds: "https://www.facebook.com/business/ads-guide/update/video",
  linkedin: "https://www.linkedin.com/help/linkedin/answer/a548372",
};

export const CLIP_SHAPES: Record<"TikTok" | "YouTube" | "X" | "Instagram" | "LinkedIn" | "Facebook", Place[]> = {
  TikTok: [{ place: "TikTok", frame: "9:16", maxSeconds: 180, takes: "Every account can post 3 min; some can post 5 or 10 min.", source: SRC.tiktok }],
  YouTube: [
    { place: "Shorts", frame: "9:16", maxSeconds: 180, takes: "A vertical or square video of 3 min or less becomes a Short.", source: SRC.shorts },
    { place: "YouTube", frame: "16:9", maxSeconds: 900, takes: "Up to 15 min, or up to 12 hours once the account is verified.", source: SRC.youtube },
  ],
  X: [{ place: "X", frame: "original", maxSeconds: 140, takes: "2 min 20 s works on every account and in messages; posts can run up to 20 min.", source: SRC.x }],
  Instagram: [
    { place: "Reels", frame: "9:16", maxSeconds: 180, takes: "3 s to 15 min.", source: SRC.instagram },
    { place: "Feed", frame: "4:5", maxSeconds: 180, takes: "Feed videos post as Reels, so 3 s to 15 min. 4:5 is the tallest shape the feed shows uncropped.", source: SRC.instagram },
    { place: "Stories", frame: "9:16", maxSeconds: 60, takes: "3 s to 60 s.", source: SRC.instagram },
  ],
  LinkedIn: [{ place: "LinkedIn", frame: "original", maxSeconds: 900, takes: "3 s to 15 min, in any shape from 1:2.4 to 2.4:1.", source: SRC.linkedin }],
  Facebook: [
    { place: "Reels", frame: "9:16", maxSeconds: 90, takes: "3 s to 90 s when posted by an app.", source: SRC.fbReels },
    { place: "Feed", frame: "4:5", maxSeconds: 180, takes: "Meta gives no separate limit for feed videos; the 4:5 shape is from its ad guide.", source: SRC.fbAds },
    { place: "Stories", frame: "9:16", maxSeconds: 60, takes: "Up to 60 s.", source: SRC.fbReels },
  ],
};

export type SocialPlatform = keyof typeof CLIP_SHAPES;

/** "Vertical 9:16", "Portrait 4:5", "Square 1:1", "Wide 16:9", "Its own shape" (the dashboard's own words). */
export function frameName(frame: Frame): string {
  switch (frame) {
    case "9:16":
      return "Vertical 9:16";
    case "4:5":
      return "Portrait 4:5";
    case "1:1":
      return "Square 1:1";
    case "16:9":
      return "Wide 16:9";
    default:
      return "Its own shape";
  }
}

/** Width over height. "Its own shape" is drawn as the usual wide recording. */
export function frameRatio(frame: Frame): number {
  switch (frame) {
    case "9:16":
      return 9 / 16;
    case "4:5":
      return 4 / 5;
    case "1:1":
      return 1;
    default:
      return 16 / 9;
  }
}

/** "60 s", "3 min", "2 min 20 s" (the dashboard's own format). */
export function formatLimit(seconds: number): string {
  if (seconds < 120) return `${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest ? `${minutes} min ${rest} s` : `${minutes} min`;
}

/** The biggest box of the given shape that fits inside width x height. */
export function fitFrame(frame: Frame, width: number, height: number) {
  const r = frameRatio(frame);
  return width / height > r ? { width: height * r, height } : { width, height: width / r };
}
