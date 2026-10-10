#!/usr/bin/env node
/**
 * Renders the Maple & Main Finds pins (pinterest/maple-main-finds.ts) at
 * 2000 x 3000 into public/store/pinterest-maple-main/finds/, where the
 * site serves them once deployed, and writes the Pinterest bulk-upload CSV
 * to pinterest/maple-main-finds.csv.
 *
 *   npm run pins:maple                 (from the repo root) all 90
 *   node scripts/render-finds-pins.mjs travel     only pins whose file name contains "travel"
 *
 * The CSV's Media URLs are draftpace.com addresses, so they only work for
 * Pinterest after the site is deployed with these images in it.
 */
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { createServer } from "vite";
import fs from "node:fs";
import path from "node:path";
import { webpackOverride } from "../webpack-override.mjs";
import { browserExecutable } from "./browser.mjs";

const CREATIVE = path.resolve(import.meta.dirname, "..");
const filter = process.argv[2] ?? "";
const OUT = path.resolve(CREATIVE, "..", "public/store/pinterest-maple-main/finds");
const log = (m) => console.log(`[${new Date().toLocaleTimeString()}] ${m}`);

const vite = await createServer({
  configFile: false, logLevel: "error", appType: "custom", root: CREATIVE,
  server: { middlewareMode: true }, optimizeDeps: { noDiscovery: true },
  resolve: { alias: { "@": path.join(CREATIVE, "..", "src"), "@engine": CREATIVE } },
});
const { FINDS_PINS } = await vite.ssrLoadModule(path.join(CREATIVE, "pinterest/maple-main-finds.ts"));
const { findsCsv, fileName } = await vite.ssrLoadModule(path.join(CREATIVE, "pinterest/finds-csv.ts"));
const { findsPinId } = await vite.ssrLoadModule(path.join(CREATIVE, "pinterest/finds-ids.ts"));
const csv = findsCsv();
await vite.close();

fs.writeFileSync(path.join(CREATIVE, "pinterest/maple-main-finds.csv"), csv);
log(`wrote pinterest/maple-main-finds.csv (${FINDS_PINS.length} pins)`);

const jobs = FINDS_PINS.map((_, i) => ({ id: findsPinId(FINDS_PINS, i), file: fileName(FINDS_PINS, i) })).filter((j) => j.file.includes(filter));
fs.mkdirSync(OUT, { recursive: true });
log("preparing the engine...");
const serveUrl = await bundle({ entryPoint: path.join(CREATIVE, "src", "index.ts"), webpackOverride });
const browser = await openBrowser("chrome", { browserExecutable });
for (const [n, j] of jobs.entries()) {
  const composition = await selectComposition({ browserExecutable, serveUrl, id: j.id, puppeteerInstance: browser });
  await renderStill({ browserExecutable, composition, serveUrl, output: path.join(OUT, j.file), imageFormat: "jpeg", jpegQuality: 90, scale: 2, puppeteerInstance: browser });
  log(`${n + 1}/${jobs.length}  ${j.file}`);
}
await browser.close({ silent: true });
log(`Finished: ${jobs.length} pins in ${path.relative(path.resolve(CREATIVE, ".."), OUT)}`);
process.exit(0);
