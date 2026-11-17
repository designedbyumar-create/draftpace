#!/usr/bin/env node
/**
 * Re-captures the real product screens the creatives show, from the running
 * app, at 3x, and records where each one came from.
 *
 *   CAPTURE_EMAIL=... CAPTURE_PASSWORD=... node scripts/capture-screens.mjs [filter...]
 *
 * Needs the app running (CAPTURE_BASE_URL, default http://localhost:3000)
 * against a Supabase project holding a seeded demo account. Use a
 * dedicated demo account only, never a real person's: whatever it shows
 * ends up in public marketing.
 *
 * Every screen already in public/screens/ is re-taken from its own route:
 * `<product>-<destination>.png` is /app/products/<product>/<destination>.
 * To add a screen, add an empty placeholder with the right name (or pass
 * it as a filter) and run this.
 *
 * Captured as the app really renders for a returning user: a 390x844
 * iPhone viewport, light theme, reduced motion, and each product's
 * first-run tour marked as seen (the app's own `draftpace-tour-<slug>`
 * key, the state anyone who has finished the tour is in). Full page, so a
 * long page can be scrolled through inside the creative's phone.
 *
 * Writes the PNGs, then src/screens-provenance.json (route, commit,
 * capture time, scale per screen) and regenerates src/screens-manifest.json.
 */
import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { browserExecutable } from "./browser.mjs";

const BASE = process.env.CAPTURE_BASE_URL ?? "http://localhost:3000";
const EMAIL = process.env.CAPTURE_EMAIL;
const PASSWORD = process.env.CAPTURE_PASSWORD;
const SCALE = 3;
const SCREENS = path.resolve("public/screens");
const PROVENANCE = path.resolve("src/screens-provenance.json");

if (!EMAIL || !PASSWORD) {
  throw new Error("Set CAPTURE_EMAIL and CAPTURE_PASSWORD to a seeded demo account (never a real person's).");
}

const PRODUCTS = (await readdir(path.resolve("shots"))).sort((a, b) => b.length - a.length); // longest first: prefix match
const filters = process.argv.slice(2);

/** "travel-companion-itinerary.png" -> { slug: "travel-companion", destination: "itinerary" } */
function routeOf(file) {
  const base = file.replace(/\.png$/, "");
  const slug = PRODUCTS.find((p) => base.startsWith(`${p}-`));
  if (!slug) throw new Error(`${file} doesn't start with a product slug (${PRODUCTS.join(", ")})`);
  return { slug, destination: base.slice(slug.length + 1) };
}

const files = [...new Set([...(await readdir(SCREENS)).filter((f) => f.endsWith(".png")), ...filters.filter((f) => f.endsWith(".png"))])]
  .filter((f) => filters.length === 0 || filters.some((x) => f.includes(x.replace(/\.png$/, ""))))
  .sort();
if (files.length === 0) throw new Error(`no screens match ${filters.join(", ")}`);

const commit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const provenance = JSON.parse(await readFile(PROVENANCE, "utf8").catch(() => "{}"));

// The locally installed Chromium when there is one (see browser.mjs), else Playwright's own.
const browser = await chromium.launch(browserExecutable ? { executablePath: browserExecutable } : {});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: SCALE,
  isMobile: true,
  hasTouch: true,
  colorScheme: "light",
  reducedMotion: "reduce",
});
await context.addInitScript((slugs) => {
  for (const s of slugs) window.localStorage.setItem(`draftpace-tour-${s}`, "1");
}, PRODUCTS);
const page = await context.newPage();

// Sign in the way a person does (see e2e/auth.setup.ts for why networkidle first).
await page.goto(`${BASE}/login`);
await page.waitForLoadState("networkidle");
await page.getByLabel("Email address").fill(EMAIL);
await page.getByLabel("Password").fill(PASSWORD);
await page.getByRole("button", { name: "Sign in" }).click();
await page.waitForURL(/\/app(\/|$)/, { timeout: 60_000 });

for (const file of files) {
  const { slug, destination } = routeOf(file);
  const route = `/app/products/${slug}/${destination}`;
  const res = await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 90_000 });
  if (!res || !res.ok()) throw new Error(`${route} answered ${res?.status()}; not capturing a broken page`);
  if (!page.url().includes(route)) throw new Error(`${route} redirected to ${page.url()}; does the demo account own ${slug}?`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(SCREENS, file), fullPage: true, animations: "disabled" });
  provenance[`screens/${file}`] = { route, commit, capturedAt: new Date().toISOString(), scale: SCALE };
  console.log(`captured ${file} <- ${route}`);
}
await browser.close();

await writeFile(PROVENANCE, JSON.stringify(Object.fromEntries(Object.entries(provenance).sort()), null, 2) + "\n");
execFileSync("node", ["scripts/screens-manifest.mjs"], { stdio: "inherit" });
console.log(`${files.length} screens captured at ${SCALE}x from ${commit.slice(0, 7)}`);
