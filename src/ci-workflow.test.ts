// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const dir = join(process.cwd(), ".github/workflows");
const workflows = readdirSync(dir).filter((f) => /\.ya?ml$/.test(f));

describe("CI workflows", () => {
  it.each(workflows)("%s only reads the repository", (file) => {
    const text = readFileSync(join(dir, file), "utf8");
    expect(text).toMatch(/^permissions:\n {2}contents: read$/m);
  });

  it.each(workflows)("%s pins every action to a commit", (file) => {
    const uses = [...readFileSync(join(dir, file), "utf8").matchAll(/uses:\s*(\S+)/g)].map((m) => m[1]);
    expect(uses.length).toBeGreaterThan(0);
    for (const ref of uses) expect(ref).toMatch(/@[0-9a-f]{40}$/);
  });
});
