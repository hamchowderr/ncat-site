// @vitest-environment node
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// The product is called Takewon. Earlier working names must not show up anywhere on the site.
const ROOT = path.resolve(__dirname, "../..");
const OLD_NAMES = [
  /NCA Toolkit Dashboard/i,
  /\bNCAT?[-_ ]?Dashboard\b/i,
  /\bKontifi\b/i,
  /\bKontentifi\b/i,
];

const SKIP = new Set([
  "node_modules",
  ".next",
  ".git",
  ".vercel",
  "test-results",
  "playwright-report",
]);

function filesUnder(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) out.push(...filesUnder(full));
    else if (
      /\.(tsx?|mjs|css|json|md|ya?ml|example)$/.test(name) &&
      !full.endsWith("product-name.test.ts")
    )
      out.push(full);
  }
  return out;
}

describe("product name", () => {
  it("leaves no old product name on the site", () => {
    const found: string[] = [];
    // The whole repo: pages, tests, and the design and product notes agents read.
    for (const file of filesUnder(ROOT)) {
      const text = readFileSync(file, "utf8");
      for (const old of OLD_NAMES)
        if (old.test(text))
          found.push(`${path.relative(ROOT, file)}: ${old.source}`);
    }
    expect(found).toEqual([]);
  });

  it("names Takewon in the site title", () => {
    const layout = readFileSync(path.join(ROOT, "src/app/layout.tsx"), "utf8");
    expect(layout).toContain("Takewon");
  });
});
