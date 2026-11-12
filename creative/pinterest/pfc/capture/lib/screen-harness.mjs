/**
 * Shared by the capture scripts in this folder (adapted from
 * creative/pinterest/homeschool/capture/lib/screen-harness.mjs; the
 * homeschool files are untouched).
 *
 * Bundles one of the harness entries (the REAL Personal Finance Companion
 * component from src/, with only its Supabase data layer swapped for
 * fixture stubs by a resolve plugin, nothing in src/ edited) with the real
 * src/app/globals.css through Tailwind, then opens it in headless Chromium
 * via Playwright at 390 css px wide, device scale 2.
 *
 * What is swapped (see harness/stubs/):
 *   domain/repository.ts      -> the record store: list() returns the fixture rows, each one
 *                                parsed through the REAL zod schema of the entity (so a fixture
 *                                that does not fit the real schema fails the build of the page).
 *   domain/billPayments.ts    -> the "Rent paid 1 Oct" tick
 *   domain/extractionCandidates.ts -> no imports waiting
 *   setupStateData.ts         -> the product-instance lookup
 *   next/navigation           -> the router hooks (we are not inside Next's app router)
 * `@/lib/supabase/client` is made a hard error, so the build itself proves nothing else reaches Supabase.
 */
import { build } from "vite";
import { chromium } from "playwright";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { browserExecutable as engineBrowser } from "../../../../scripts/browser.mjs";

const require = createRequire(import.meta.url);
export const CREATIVE = path.resolve(import.meta.dirname, "../../../..");
export const REPO = path.resolve(CREATIVE, "..");
export const OUT = path.join(CREATIVE, "out/pfc/assets");
export const NOW = "2026-10-26T10:00:00"; // the demo household's "today": a Monday, two days before pay day
const HARNESS = path.resolve(import.meta.dirname, "../harness");
const PFC = path.join(REPO, "src/products/personal-finance-companion");
const FONTS = path.join(CREATIVE, "out/pfc/.fonts");

const STUBS = new Map([
  [path.join(PFC, "domain/repository.ts"), path.join(HARNESS, "stubs/repository.ts")],
  [path.join(PFC, "domain/billPayments.ts"), path.join(HARNESS, "stubs/billPayments.ts")],
  [path.join(PFC, "domain/extractionCandidates.ts"), path.join(HARNESS, "stubs/extractionCandidates.ts")],
  [path.join(PFC, "setupStateData.ts"), path.join(HARNESS, "stubs/setupStateData.ts")],
]);

const dataLayerStubs = {
  name: "pfc-data-layer-stubs",
  enforce: "pre",
  async resolveId(source, importer) {
    if (source === "next/navigation") return path.join(HARNESS, "stubs/nextNavigation.ts");
    if (source === "@/lib/supabase/client" || source.endsWith("/lib/supabase/client")) {
      throw new Error(`The real Supabase client was imported by ${importer}: add a stub for whatever pulls it in.`);
    }
    if (!importer || !(source.startsWith(".") || source.startsWith("@/"))) return null;
    const base = source.startsWith("@/") ? path.join(REPO, "src", source.slice(2)) : path.resolve(path.dirname(importer), source);
    for (const [real, stub] of STUBS) if (base === real.replace(/\.tsx?$/, "")) return stub;
    return null;
  },
};

/** Tailwind exactly as the app configures it, with content globs pointed at the files this bundle uses. */
function tailwindConfig() {
  const root = require(path.join(REPO, "tailwind.config.js"));
  return {
    ...root,
    content: [
      path.join(REPO, "src/products/personal-finance-companion/**/*.{ts,tsx}"),
      path.join(REPO, "src/components/platform/**/*.{ts,tsx}"),
      path.join(REPO, "src/design-system/**/*.{ts,tsx}"),
      path.join(HARNESS, "**/*.{ts,tsx}"),
    ],
  };
}

/** The real product uses Fraunces (next/font/google, fetched at build time) for figures; fetch the same family once from Google Fonts. */
function ensureFraunces() {
  fs.mkdirSync(FONTS, { recursive: true });
  for (const w of [400, 500, 600]) {
    const file = path.join(FONTS, `fraunces-${w}.ttf`);
    if (fs.existsSync(file)) continue;
    const css = execFileSync("curl", ["-sS", "-m", "30", "-A", "Mozilla/5.0 (X11; Linux x86_64) Chrome/120", `https://fonts.googleapis.com/css2?family=Fraunces:wght@${w}&display=swap`]).toString();
    const url = /https:\/\/[^)]*\.ttf/.exec(css)?.[0];
    if (!url) throw new Error("could not resolve the Fraunces font url");
    execFileSync("curl", ["-sS", "-m", "60", "-o", file, url]);
  }
}

/** `variant`: which fixture the stubs serve ("base" household, or "gaps" = the same household with a bill that has no due date and a stale balance). `balance`: "household" (real figures of the existing screens) or "alt". */
export async function bundleEntry(name, { variant = "base", balance = "household" } = {}) {
  ensureFraunces();
  const dir = path.join(CREATIVE, "out/pfc/.harness", `${name}-${variant}-${balance}`);
  fs.rmSync(dir, { recursive: true, force: true });
  await build({
    configFile: false, logLevel: "warn", root: CREATIVE,
    // dedupe: harness files resolve react from creative/node_modules, src/ from the repo root; one copy only.
    resolve: { alias: { "@": path.join(REPO, "src") }, dedupe: ["react", "react-dom"] },
    plugins: [dataLayerStubs],
    define: { "process.env.NODE_ENV": JSON.stringify("production"), __PFC_VARIANT__: JSON.stringify(variant), __PFC_BALANCE__: JSON.stringify(balance) },
    oxc: { jsx: { runtime: "automatic" } },
    css: { postcss: { plugins: [require(path.join(REPO, "node_modules/tailwindcss"))(tailwindConfig()), require(path.join(REPO, "node_modules/autoprefixer"))] } },
    build: {
      outDir: dir, emptyOutDir: true, minify: false, cssCodeSplit: false,
      lib: { entry: path.join(HARNESS, `${name}.tsx`), formats: ["iife"], name: "harness", fileName: () => "app.js", cssFileName: "app" },
    },
  });
  const u = (p) => `file://${p}`;
  const frau = (w) => `@font-face { font-family: "Fraunces"; font-style: normal; font-weight: ${w}; src: url("${u(path.join(FONTS, `fraunces-${w}.ttf`))}") format("truetype"); }`;
  fs.writeFileSync(path.join(dir, "index.html"), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
@font-face { font-family: "Inter"; font-style: normal; font-weight: 400 800; src: url("${u(path.join(CREATIVE, "public/fonts/inter-latin.woff2"))}") format("woff2"); }
${frau(400)}
${frau(500)}
${frau(600)}
html { --font-inter: "Inter"; --font-fraunces: "Fraunces"; }
</style><link rel="stylesheet" href="app.css"></head><body><div id="root"></div><script>window.process={env:{NODE_ENV:"production"}}</script><script src="app.js"></script></body></html>`);
  return path.join(dir, "index.html");
}

/** The engine's own pick, else whichever Playwright headless shell is installed. */
function findBrowser() {
  if (engineBrowser) return engineBrowser;
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!root || !fs.existsSync(root)) return null;
  for (const d of fs.readdirSync(root).filter((d) => d.startsWith("chromium_headless_shell-")).sort().reverse()) {
    for (const rel of ["chrome-headless-shell-linux64/chrome-headless-shell", "chrome-linux/headless_shell"]) {
      const bin = path.join(root, d, rel);
      if (fs.existsSync(bin)) return bin;
    }
  }
  return null;
}

/** Opens the bundle at 390 css px wide, light theme, device scale 2, with the clock fixed at NOW and the product's first-run tour marked as seen (as capture-screens.mjs does). */
export async function openPage(indexHtml) {
  const browser = await chromium.launch((() => { const b = findBrowser(); return b ? { executablePath: b } : {}; })());
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: "light", reducedMotion: "reduce" });
  await context.addInitScript(() => { try { window.localStorage.setItem("draftpace-tour-personal-finance-companion", "1"); } catch {} });
  const page = await context.newPage();
  await page.clock.setFixedTime(new Date(NOW));
  const problems = [];
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error") problems.push(`console: ${m.text()}`); });
  await page.goto(`file://${indexHtml}`);
  return { browser, page, problems };
}

/** Waits for the web fonts the page really uses, so a screenshot never catches the fallback. */
export async function fontsReady(page) {
  await page.evaluate(async () => {
    await Promise.all([document.fonts.load('400 16px "Inter"'), document.fonts.load('600 16px "Inter"'), document.fonts.load('400 60px "Fraunces"')]);
    await document.fonts.ready;
  });
}

/**
 * Screenshot a full-width band (x 0..390) as 390 px wide at 2x.
 * The viewport is first fitted to the page's own height (so the screen's fixed bottom "Add" bar sits at the foot of the page,
 * where the app puts it when scrolled to the end, rather than floating over the middle of a tall shot).
 * `from`/`to` are locators (band = top of `from` .. bottom of `to`, default `to` = `from`), `pad` css px above and below.
 */
export async function shootBand(page, from, file, { to = from, pad = 0, top = null, bottom = null } = {}) {
  await page.setViewportSize({ width: 390, height: 300 });
  await page.waitForTimeout(60);
  await page.setViewportSize({ width: 390, height: Math.ceil(await page.evaluate(() => document.documentElement.scrollHeight)) });
  await page.waitForTimeout(80);
  const a = await from.boundingBox();
  const b = to === from ? a : await to.boundingBox();
  const y0 = top ?? Math.max(0, a.y - pad);
  const y1 = bottom ?? b.y + b.height + pad;
  await page.screenshot({ path: file, fullPage: true, clip: { x: 0, y: y0, width: 390, height: y1 - y0 } });
}
