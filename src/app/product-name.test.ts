// @vitest-environment node
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// The product is called Takewon. Earlier working names must not show up anywhere on the site.
const ROOT = path.resolve(__dirname, "../..");
const OLD_NAMES = [
  /NCA Toolkit Dashboard/,
  /NCA Dashboard/,
  /\bKontifi\b/i,
  /\bKontentifi\b/i,
];

function filesUnder(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next") continue;
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) out.push(...filesUnder(full));
    else if (
      /\.(tsx?|css|json|md)$/.test(name) &&
      !full.endsWith("product-name.test.ts")
    )
      out.push(full);
  }
  return out;
}

describe("product name", () => {
  it("leaves no old product name on the site", () => {
    const found: string[] = [];
    for (const file of [
      ...filesUnder(path.join(ROOT, "src")),
      ...filesUnder(path.join(ROOT, "e2e")),
    ]) {
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
