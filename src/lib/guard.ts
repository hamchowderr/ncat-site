import { head, put } from "@vercel/blob";
import { checkBotId } from "botid/server";

/**
 * Keeps the early-access form for people. Three layers, each cheap:
 *
 * 1. Vercel BotID: an invisible check the browser passes on the way in (see
 *    instrumentation-client.ts). Only on Vercel; anywhere else it is skipped.
 * 2. A per-address allowance: five sign-ups in ten minutes from one address, and a
 *    ceiling for everyone together, so a script can't flood the list or the inbox.
 * 3. One set of emails per address a day: the same email typed again is still kept, but
 *    nobody is emailed twice, so the form can't be used to fill a stranger's inbox.
 */

const WINDOW = 10 * 60 * 1000;
const PER_ADDRESS = 5;
const EVERYONE = 100;
const MAIL_GAP = 24 * 60 * 60 * 1000;

/** True when Vercel BotID says the request came from a bot. Fails open, so a hiccup never loses a lead. */
export async function looksLikeBot(): Promise<boolean> {
  if (process.env.VERCEL !== "1") return false;
  try {
    return (await checkBotId()).isBot;
  } catch (error) {
    console.error("guard: BotID could not check", error instanceof Error ? error.message : error);
    return false;
  }
}

/** The visitor's address, as Vercel saw it. */
export function addressOf(request: Request): string {
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

const seen = new Map<string, number[]>();

function recent(key: string, now: number): number[] {
  const kept = (seen.get(key) ?? []).filter((at) => now - at < WINDOW);
  seen.set(key, kept);
  return kept;
}

/**
 * Takes one sign-up from the address's allowance and everyone's. Counted per server
 * instance, which Vercel reuses for many requests; a determined attacker on many
 * instances still meets BotID and the one-email-a-day rule.
 */
export function takeSignUp(address: string, now = Date.now()): boolean {
  const mine = recent(`a:${address}`, now);
  const all = recent("all", now);
  if (mine.length >= PER_ADDRESS || all.length >= EVERYONE) return false;
  mine.push(now);
  all.push(now);
  return true;
}

/** Only for tests: forgets every sign-up counted so far. */
export function forgetSignUps(): void {
  seen.clear();
}

async function mailboxKey(email: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email.trim().toLowerCase()));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Whether this address may be emailed now, and if so, notes that it was. Kept in the
 * site's private Blob store as a hash of the address, never the address itself. Without
 * the Blob store every address may be emailed.
 */
export async function mayEmail(email: string, now = Date.now()): Promise<boolean> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return true;
  const path = `mailed/${await mailboxKey(email)}.json`;
  try {
    const found = await head(path);
    if (now - new Date(found.uploadedAt).getTime() < MAIL_GAP) return false;
  } catch {
    // Not emailed before (or the store did not answer): carry on.
  }
  try {
    await put(path, JSON.stringify({ at: new Date(now).toISOString() }), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  } catch (error) {
    console.error("guard: could not note the email", error instanceof Error ? error.message : error);
  }
  return true;
}
