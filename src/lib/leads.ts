import { put } from "@vercel/blob";

/**
 * Keeps every sign-up as its own private file in the site's Vercel Blob store
 * (leads/YYYY-MM-DD/<kind>-<id>.json), so none is lost when email is not set up yet or a
 * send fails, and they can be followed up in bulk later. Needs BLOB_READ_WRITE_TOKEN,
 * which Vercel sets once a Blob store is connected to the project. Without it, nothing is
 * kept and this answers false.
 */
export type LeadKind = "early-access" | "preview";

export async function saveLead(kind: LeadKind, data: Record<string, unknown>, now = new Date()): Promise<boolean> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return false;
  const day = now.toISOString().slice(0, 10);
  const id = crypto.randomUUID();
  try {
    await put(`leads/${day}/${kind}-${id}.json`, JSON.stringify({ kind, at: now.toISOString(), ...data }, null, 2), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
    });
    return true;
  } catch (error) {
    console.error("leads: could not keep the sign-up", error instanceof Error ? error.message : error);
    return false;
  }
}
