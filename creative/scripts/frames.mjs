#!/usr/bin/env node
/**
 * Renders chosen frames of one composition and tiles them into a contact
 * sheet: the fast way to look at a change without rendering a whole video.
 *
 *   node scripts/frames.mjs TravelCompanion-FeatureSpotlight 10 60 120 300
 *   node scripts/frames.mjs TravelCompanion-FeatureSpotlight --every 30
 *
 * Writes out/frames/<id>/<frame>.png and out/frames/<id>.png (the sheet).
 */
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { webpackOverride } from "../webpack-override.mjs";
import { browserExecutable } from "./browser.mjs";

const [id, ...rest] = process.argv.slice(2);
if (!id) throw new Error("usage: frames.mjs <composition-id> <frame...> | --every N");
const bundled = await bundle({ entryPoint: path.resolve("src/index.ts"), webpackOverride });
const composition = await selectComposition({ browserExecutable, serveUrl: bundled, id });
const every = rest[0] === "--every" ? Number(rest[1]) : 0;
const frames = every
  ? Array.from({ length: Math.ceil(composition.durationInFrames / every) }, (_, i) => i * every)
  : rest.map(Number);
const dir = path.resolve("out/frames", id);
await mkdir(dir, { recursive: true });
const files = [];
for (const frame of frames) {
  const output = path.join(dir, `${String(frame).padStart(4, "0")}.png`);
  await renderStill({ browserExecutable, composition, serveUrl: bundled, output, frame, scale: 0.5 });
  files.push(output);
}
execFileSync("node", ["scripts/contact-sheet.mjs", path.resolve("out/frames", `${id}.png`), "6", ...files], { stdio: "inherit" });
process.exit(0);
