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

// Several ids may be given comma-separated (one bundle for all); `--even N` samples N evenly spaced frames of each.
const [ids, ...rest] = process.argv.slice(2);
if (!ids) throw new Error("usage: frames.mjs <id[,id...]> <frame...> | --every N | --even N");
const bundled = await bundle({ entryPoint: path.resolve("src/index.ts"), webpackOverride });
for (const id of ids.split(",")) {
  const composition = await selectComposition({ browserExecutable, serveUrl: bundled, id });
  const every = rest[0] === "--every" ? Number(rest[1]) : 0;
  const even = rest[0] === "--even" ? Number(rest[1]) : 0;
  const D = composition.durationInFrames;
  const frames = every
    ? Array.from({ length: Math.ceil(D / every) }, (_, i) => i * every)
    : even
      ? Array.from({ length: even }, (_, i) => Math.min(D - 1, Math.round(((i + 0.5) / even) * D)))
      : rest.map(Number);
  const dir = path.resolve("out/frames", id);
  await mkdir(dir, { recursive: true });
  const files = [];
  for (const frame of frames) {
    const output = path.join(dir, `${String(frame).padStart(4, "0")}.png`);
    await renderStill({ browserExecutable, composition, serveUrl: bundled, output, frame, scale: 0.5 });
    files.push(output);
  }
  execFileSync("node", ["scripts/contact-sheet.mjs", path.resolve("out/frames", `${id}.png`), String(Math.min(8, files.length)), ...files], { stdio: "inherit" });
}
process.exit(0);
