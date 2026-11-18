/** Helpers for the "try it with your own video" walk-through. Everything runs in the visitor's browser. */

/** "48 MB", "1.2 GB", "820 KB". */
export function formatBytes(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  if (bytes >= 1e6) return `${Math.round(bytes / 1e6)} MB`;
  return `${Math.max(1, Math.round(bytes / 1e3))} KB`;
}

/** "35 s", "12 min 4 s", "1 h 3 min". */
export function formatDuration(seconds: number): string {
  const s = Math.round(seconds);
  if (s < 60) return `${s} s`;
  if (s < 3600) {
    const m = Math.floor(s / 60);
    return s % 60 ? `${m} min ${s % 60} s` : `${m} min`;
  }
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return m ? `${h} h ${m} min` : `${h} h`;
}

/**
 * Where the preview cuts: even parts, about five of them, never longer than a minute (the
 * shortest limit among the main platforms) and never shorter than five seconds, and no more than
 * 100 clips (the dashboard's own cap). The real step cuts at pauses in speech instead.
 */
export function planCuts(duration: number): { start: number; seconds: number }[] {
  if (!(duration > 0)) return [];
  const length = Math.min(60, Math.max(5, duration / 5));
  const count = Math.max(1, Math.min(100, Math.round(duration / length)));
  const seconds = duration / count;
  return Array.from({ length: count }, (_, i) => ({ start: i * seconds, seconds }));
}
