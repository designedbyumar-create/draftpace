#!/usr/bin/env node
/**
 * Draftpace's own pins, waves 2 to 5 (pinterest/draftpace-pins.ts):
 * plans each pin from its source row, rescheduleds the four waves around
 * the prayers, and with --render draws every pin into
 * public/store/pinterest-pins/<folder>/<pin>.jpg at 1000 x 1500, replacing
 * the old picture under the same name.
 *
 *   node scripts/draftpace-pins.mjs              plan + CSVs only
 *   node scripts/draftpace-pins.mjs --render     ...and draw all 350
 *   node scripts/draftpace-pins.mjs --render adhd     ...only files containing "adhd"
 *
 * Writes pinterest/draftpace/pins.generated.json (what Root.tsx draws) and
 * pinterest/draftpace/wave2.csv ... wave5.csv (the upload files).
 */
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { createServer } from "vite";
import fs from "node:fs";
import path from "node:path";
import { webpackOverride } from "../webpack-override.mjs";
import { browserExecutable } from "./browser.mjs";

const CREATIVE = path.resolve(import.meta.dirname, "..");
const DIR = path.join(CREATIVE, "pinterest/draftpace");
const args = process.argv.slice(2);
const render = args.includes("--render");
const filter = args.find((a) => !a.startsWith("--")) ?? "";
const log = (m) => console.log(`[${new Date().toLocaleTimeString()}] ${m}`);

const vite = await createServer({
  configFile: false, logLevel: "error", appType: "custom", root: CREATIVE,
  server: { middlewareMode: true }, optimizeDeps: { noDiscovery: true },
  resolve: { alias: { "@": path.join(CREATIVE, "..", "src"), "@engine": CREATIVE } },
});
const D = await vite.ssrLoadModule(path.join(CREATIVE, "pinterest/draftpace-pins.ts"));
const sources = Object.fromEntries(D.WAVES.map((w) => [w, fs.readFileSync(path.join(DIR, "source", `${w}.csv`), "utf8")]));
const planned = D.planDraftpacePins(sources);
const csvs = D.rescheduledCsvs(sources);
await vite.close();

fs.writeFileSync(path.join(DIR, "pins.generated.json"), JSON.stringify(planned.map((p) => p.pin), null, 2) + "\n");
for (const w of D.WAVES) fs.writeFileSync(path.join(DIR, `${w}.csv`), csvs[w]);
log(`${planned.length} pins planned; wrote pins.generated.json and ${D.WAVES.join(", ")} CSVs`);
if (!render) process.exit(0);

const idOf = (file) => `Pin-dp-${file.replace(/[/.]/g, "-")}`;
const jobs = planned.map((p) => p.pin.file).filter((f) => f.includes(filter));
log("preparing the engine...");
const serveUrl = await bundle({ entryPoint: path.join(CREATIVE, "src", "index.ts"), webpackOverride });
const browser = await openBrowser("chrome", { browserExecutable });
for (const [n, file] of jobs.entries()) {
  const out = path.resolve(CREATIVE, "..", "public/store/pinterest-pins", `${file}.jpg`);
  const composition = await selectComposition({ browserExecutable, serveUrl, id: idOf(file), puppeteerInstance: browser });
  await renderStill({ browserExecutable, composition, serveUrl, output: out, imageFormat: "jpeg", jpegQuality: 88, scale: 1, puppeteerInstance: browser });
  if ((n + 1) % 25 === 0 || n + 1 === jobs.length) log(`${n + 1}/${jobs.length}`);
}
await browser.close({ silent: true });
log(`Finished: ${jobs.length} pins redrawn`);
process.exit(0);
