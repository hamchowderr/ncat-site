import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { del, get, issueSignedToken, list, presignUrl, put } from "@vercel/blob";
import type { Demo } from "./run";

/**
 * Where demo runs are kept: the site's private Vercel Blob store, next to the sign-ups.
 * demos/<id>/run.json holds the run, demos/<id>/source.* the visitor's video, and
 * demos/emails/<hash>.json marks an email as having had its one run.
 */
export interface DemoStore {
  load(id: string): Promise<{ demo: Demo; version: string } | null>;
  /** Writes the run; false when someone else changed it first (`version` is from load). */
  save(demo: Demo, version: string | null): Promise<boolean>;
  /** Marks an email as used. False when it already had its run. */
  claimEmail(email: string, id: string): Promise<boolean>;
  /** Counts a run against today's limit. False when today is full. */
  countToday(limit: number, now: Date): Promise<boolean>;
  /** A link the toolkit can download the upload from, for a day. */
  readLink(pathname: string, now: number): Promise<string>;
  exists(pathname: string): Promise<boolean>;
  /** Removes uploads older than `before`. Answers how many were removed. */
  removeUploadsBefore(before: number): Promise<number>;
}

export function demoSecret(): string | null {
  const secret = process.env.DEMO_SECRET || process.env.BLOB_READ_WRITE_TOKEN;
  return secret ? createHash("sha256").update(`ncat-site demo:${secret}`).digest("hex") : null;
}

/** The key that lets one visitor see their own run, and the toolkit post back to it. */
export function keyFor(id: string, secret: string): string {
  return createHmac("sha256", secret).update(id).digest("base64url").slice(0, 32);
}

export function keyMatches(id: string, key: unknown, secret: string): boolean {
  if (typeof key !== "string" || !/^[\w-]{1,64}$/.test(id)) return false;
  const want = Buffer.from(keyFor(id, secret)), got = Buffer.from(key);
  return want.length === got.length && timingSafeEqual(want, got);
}

export const emailHash = (email: string) => createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
export const sourcePath = (id: string, fileName: string) => {
  const ext = /\.([a-z0-9]{1,5})$/i.exec(fileName)?.[1]?.toLowerCase() ?? "mp4";
  return `demos/${id}/source.${ext}`;
};

async function readJson<T>(pathname: string): Promise<{ value: T; etag: string } | null> {
  // Asked for uncompressed: a compressed answer carries a weak ETag (W/"…"), which a
  // conditional write never matches, so every save after the first would be refused.
  const found = await get(pathname, { access: "private", useCache: false, headers: { "accept-encoding": "identity" } }).catch(() => null);
  if (!found || found.statusCode !== 200 || !found.stream) return null;
  const text = await new Response(found.stream).text();
  return { value: JSON.parse(text) as T, etag: found.blob.etag.replace(/^W\//, "") };
}

async function writeJson(pathname: string, value: unknown, etag: string | null): Promise<boolean> {
  try {
    await put(pathname, JSON.stringify(value), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      ...(etag ? { allowOverwrite: true, ifMatch: etag } : { allowOverwrite: false }),
    });
    return true;
  } catch (e) {
    console.warn(`blob write ${pathname} refused: ${e instanceof Error ? e.message : String(e)}`);
    return false;
  }
}

export const blobStore: DemoStore = {
  async load(id) {
    const found = await readJson<Demo>(`demos/${id}/run.json`);
    return found ? { demo: found.value, version: found.etag } : null;
  },
  save: (demo, version) => writeJson(`demos/${demo.id}/run.json`, demo, version),
  claimEmail: (email, id) => writeJson(`demos/emails/${emailHash(email)}.json`, { id }, null),
  async countToday(limit, now) {
    const path = `demos/days/${now.toISOString().slice(0, 10)}.json`;
    for (let tries = 0; tries < 4; tries++) {
      const found = await readJson<{ count: number }>(path);
      const count = found?.value.count ?? 0;
      if (count >= limit) return false;
      if (await writeJson(path, { count: count + 1 }, found?.etag ?? null)) return true;
    }
    return false;
  },
  async readLink(pathname, now) {
    const validUntil = now + 24 * 60 * 60_000;
    const token = await issueSignedToken({ pathname, operations: ["get"], validUntil });
    return (await presignUrl(token, { operation: "get", pathname, validUntil, access: "private" })).presignedUrl;
  },
  async exists(pathname) {
    const found = await list({ prefix: pathname, limit: 1 }).catch(() => null);
    return !!found?.blobs.some((b) => b.pathname === pathname);
  },
  async removeUploadsBefore(before) {
    let removed = 0;
    let cursor: string | undefined;
    do {
      const page = await list({ prefix: "demos/", cursor, limit: 1000 });
      const old = page.blobs.filter((b) => /\/source\.[a-z0-9]+$/.test(b.pathname) && b.uploadedAt.getTime() < before);
      if (old.length) await del(old.map((b) => b.url));
      removed += old.length;
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    return removed;
  },
};

/** Kept in memory, for tests. */
export function memoryStore(): DemoStore & { runs: Map<string, Demo>; files: Map<string, number> } {
  const runs = new Map<string, Demo>();
  const versions = new Map<string, number>();
  const emails = new Set<string>();
  const days = new Map<string, number>();
  const files = new Map<string, number>();
  return {
    runs,
    files,
    async load(id) {
      const demo = runs.get(id);
      return demo ? { demo: structuredClone(demo), version: String(versions.get(id)) } : null;
    },
    async save(demo, version) {
      const current = versions.get(demo.id);
      if ((version === null) !== (current === undefined) || (version !== null && String(current) !== version)) return false;
      runs.set(demo.id, structuredClone(demo));
      versions.set(demo.id, (current ?? 0) + 1);
      return true;
    },
    async claimEmail(email) {
      const h = emailHash(email);
      if (emails.has(h)) return false;
      emails.add(h);
      return true;
    },
    async countToday(limit, now) {
      const day = now.toISOString().slice(0, 10);
      const count = days.get(day) ?? 0;
      if (count >= limit) return false;
      days.set(day, count + 1);
      return true;
    },
    readLink: async (pathname) => `https://blob.example/${pathname}?signed=1`,
    exists: async (pathname) => files.has(pathname),
    async removeUploadsBefore(before) {
      let removed = 0;
      for (const [path, at] of files) if (at < before && /\/source\./.test(path)) (files.delete(path), removed++);
      return removed;
    },
  };
}
