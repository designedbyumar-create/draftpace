/**
 * Shared by screen-check-result.mjs and screen-print-section.mjs.
 *
 * Bundles one of the harness entries (the REAL product component from
 * src/, with only its Supabase data layer swapped for fixture stubs by a
 * resolve plugin, nothing in src/ edited) with the real src/app/globals.css
 * through Tailwind, then opens it in headless Chromium via Playwright.
 *
 * The three data modules the product screens import are replaced by
 * harness/stubs/*; `@/lib/supabase/client` is made a hard error, so the
 * build itself proves nothing else reaches Supabase.
 */
import { build } from "vite";
import { chromium } from "playwright";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { browserExecutable as engineBrowser } from "../../../../scripts/browser.mjs";

const require = createRequire(import.meta.url);
export const CREATIVE = path.resolve(import.meta.dirname, "../../../..");
export const REPO = path.resolve(CREATIVE, "..");
export const OUT = path.join(CREATIVE, "out/homeschool/assets");
const HARNESS = path.resolve(import.meta.dirname, "../harness");
const HSC = path.join(REPO, "src/products/homeschooling-companion");

const STUBS = new Map([
  [path.join(HSC, "instanceData.ts"), path.join(HARNESS, "stubs/instanceData.ts")],
  [path.join(HSC, "domain/learningData.ts"), path.join(HARNESS, "stubs/learningData.ts")],
  [path.join(HSC, "domain/checkData.ts"), path.join(HARNESS, "stubs/checkData.ts")],
]);

const dataLayerStubs = {
  name: "hsc-data-layer-stubs",
  enforce: "pre",
  async resolveId(source, importer, opts) {
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
      path.join(REPO, "src/products/homeschooling-companion/**/*.{ts,tsx}"),
      path.join(REPO, "src/design-system/**/*.{ts,tsx}"),
      path.join(HARNESS, "**/*.{ts,tsx}"),
    ],
  };
}

export async function bundleEntry(name) {
  const dir = path.join(CREATIVE, "out/homeschool/.harness", name);
  fs.rmSync(dir, { recursive: true, force: true });
  await build({
    configFile: false, logLevel: "warn", root: CREATIVE,
    // dedupe: harness files resolve react from creative/node_modules, src/ from the repo root; one copy only.
    resolve: { alias: { "@": path.join(REPO, "src") }, dedupe: ["react", "react-dom"] },
    plugins: [dataLayerStubs],
    define: { "process.env.NODE_ENV": JSON.stringify("production") },
    oxc: { jsx: { runtime: "automatic" } },
    css: { postcss: { plugins: [require(path.join(REPO, "node_modules/tailwindcss"))(tailwindConfig()), require(path.join(REPO, "node_modules/autoprefixer"))] } },
    build: {
      outDir: dir, emptyOutDir: true, minify: false, cssCodeSplit: false,
      lib: { entry: path.join(HARNESS, `${name}.tsx`), formats: ["iife"], name: "harness", fileName: () => "app.js", cssFileName: "app" },
    },
  });
  const file = (n) => pathToUrl(path.join(CREATIVE, "public/fonts", n));
  fs.writeFileSync(path.join(dir, "index.html"), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
@font-face { font-family: "Inter"; font-style: normal; font-weight: 400 800; src: url("${file("inter-latin.woff2")}") format("woff2"); }
@font-face { font-family: "Newsreader"; font-style: normal; font-weight: 200 800; src: url("${pathToUrl(path.join(REPO, "public/fonts/Newsreader.ttf"))}") format("truetype"); }
html { --font-inter: "Inter"; --font-newsreader: "Newsreader"; }
</style><link rel="stylesheet" href="app.css"></head><body><div id="root"></div><script>window.process={env:{NODE_ENV:"production"}}</script><script src="app.js"></script></body></html>`);
  return path.join(dir, "index.html");
}
const pathToUrl = (p) => `file://${p}`;

/** The engine's own pick, else whichever Playwright headless shell is installed (newer Playwright lays it out differently). */
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

/** Opens the bundle at 390 css px wide, light theme, device scale 3. */
export async function openPage(indexHtml) {
  const browser = await chromium.launch((() => { const b = findBrowser(); return b ? { executablePath: b } : {}; })());
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, colorScheme: "light", reducedMotion: "reduce" });
  const page = await context.newPage();
  const problems = [];
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error") problems.push(`console: ${m.text()}`); });
  await page.goto(pathToUrl(indexHtml));
  return { browser, page, problems };
}

/** Waits for the web fonts the page really uses, so a screenshot never catches the fallback. */
export async function fontsReady(page) {
  await page.evaluate(async () => {
    await Promise.all([document.fonts.load('400 16px "Inter"'), document.fonts.load('600 16px "Inter"'), document.fonts.load('400 26px "Newsreader"')]);
    await document.fonts.ready;
  });
}
