/** Validation and email body for the early-access form. Shared by the route and tests. */

export type EarlyAccessInput = {
  name: string;
  email: string;
  who: "solo" | "team";
  job: string;
  /** Hidden field. People leave it empty; bots fill it in. */
  website?: string;
};

export type Checked = { ok: true; value: EarlyAccessInput } | { ok: false; errors: Partial<Record<keyof EarlyAccessInput, string>> };

const EMAIL = /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/;

export function checkEarlyAccess(raw: unknown): Checked {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const str = (k: string, max: number) => (typeof r[k] === "string" ? (r[k] as string).trim().slice(0, max) : "");
  const value: EarlyAccessInput = {
    name: str("name", 120),
    email: str("email", 200),
    who: r.who === "team" ? "team" : "solo",
    job: str("job", 2000),
    website: str("website", 200),
  };
  const errors: Partial<Record<keyof EarlyAccessInput, string>> = {};
  if (!value.name) errors.name = "Add your name.";
  if (!EMAIL.test(value.email)) errors.email = "Add an email address I can reply to.";
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value };
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export function earlyAccessEmail(v: EarlyAccessInput) {
  const lines = [
    `Name: ${v.name}`,
    `Email: ${v.email}`,
    `For: ${v.who === "team" ? "a team" : "just me"}`,
    `First job to automate: ${v.job || "(not given)"}`,
  ];
  return {
    subject: `Dashboard early access: ${v.name}`,
    text: lines.join("\n"),
    html: `<p>${lines.map(esc).join("<br>")}</p>`,
  };
}
