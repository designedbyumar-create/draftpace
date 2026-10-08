#!/usr/bin/env node
/**
 * Which captured screens may no longer match the product: a screen is
 * stale when its product's UI (src/products/<slug>/, or the shared product
 * shell and design system every product renders through) has changed in
 * git since the commit it was captured from (src/screens-provenance.json,
 * written by capture-screens.mjs). A screen with no provenance is reported
 * as unknown, since nothing says when it was taken.
 *
 *   node scripts/stale-screens.mjs            prints a report, exits 0
 *   node scripts/stale-screens.mjs --strict   exits 1 if anything is stale
 *
 * A report, not a gate, by default: a product change that doesn't touch
 * what a screen shows shouldn't block anything. It tells you what to
 * look at, and what capture-screens.mjs would refresh.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, appendFileSync } from "node:fs";
import path from "node:path";

const strict = process.argv.includes("--strict");
const provenance = JSON.parse((() => { try { return readFileSync("src/screens-provenance.json", "utf8"); } catch { return "{}"; } })());
const products = readdirSync("shots").sort((a, b) => b.length - a.length);
const SHARED = ["src/components/product-shell", "src/design-system", "src/app/globals.css"];

const rows = [];
for (const file of readdirSync("public/screens").filter((f) => f.endsWith(".png")).sort()) {
  const key = `screens/${file}`;
  const slug = products.find((p) => file.startsWith(`${p}-`));
  const p = provenance[key];
  if (!p) {
    rows.push({ file, state: "unknown", detail: "no provenance (captured before capture-screens.mjs)" });
    continue;
  }
  const paths = [`src/products/${slug}`, ...SHARED].map((x) => path.join("..", x));
  let changed = "";
  try {
    changed = execFileSync("git", ["log", "--format=%h %s", `${p.commit}..HEAD`, "--", ...paths], { encoding: "utf8" }).trim();
  } catch {
    rows.push({ file, state: "unknown", detail: `capture commit ${p.commit.slice(0, 7)} is not in this history` });
    continue;
  }
  rows.push(changed
    ? { file, state: "stale", detail: `${changed.split("\n").length} UI commit(s) since capture, latest: ${changed.split("\n")[0]}` }
    : { file, state: "fresh", detail: `captured ${p.capturedAt.slice(0, 10)} at ${p.commit.slice(0, 7)}` });
}

const counts = Object.fromEntries(["fresh", "stale", "unknown"].map((s) => [s, rows.filter((r) => r.state === s).length]));
const lines = [
  `Screens: ${counts.fresh} fresh, ${counts.stale} stale, ${counts.unknown} unknown`,
  ...rows.filter((r) => r.state !== "fresh").map((r) => `  ${r.state.padEnd(7)} ${r.file}  ${r.detail}`),
];
console.log(lines.join("\n"));
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Creative screens\n\n\`\`\`\n${lines.join("\n")}\n\`\`\`\n`);
}
process.exit(strict && counts.stale > 0 ? 1 : 0);
