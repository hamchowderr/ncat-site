/** The "save these previews" request from the try-it demo: who asked, and what they tried. No video is ever sent. */
export type PreviewLead = { email: string; name: string; seconds: number; clips: number; website: string };

const EMAIL = /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/;

export function checkPreviewLead(raw: unknown): { ok: true; value: PreviewLead } | { ok: false; error: string } {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const str = (k: string, max: number) => (typeof r[k] === "string" ? (r[k] as string).trim().slice(0, max) : "");
  const num = (k: string, max: number) => {
    const n = Number(r[k]);
    return Number.isFinite(n) && n >= 0 ? Math.min(max, Math.round(n)) : 0;
  };
  const value: PreviewLead = {
    email: str("email", 200),
    name: str("name", 120),
    seconds: num("seconds", 60 * 60 * 24),
    clips: num("clips", 100),
    website: str("website", 200),
  };
  if (!EMAIL.test(value.email)) return { ok: false, error: "That email address doesn’t look right." };
  return { ok: true, value };
}

/** "a 14 min video, cut into 14 clips" */
export function describeTry(seconds: number, clips: number): string {
  const m = Math.round(seconds / 60);
  const length = seconds < 60 ? `${seconds} s` : m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`;
  return `a ${length} video, cut into ${clips} ${clips === 1 ? "clip" : "clips"}`;
}
