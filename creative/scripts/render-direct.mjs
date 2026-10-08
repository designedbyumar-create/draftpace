#!/usr/bin/env node
/**
 * Renders one or every registered video <Composition> by driving
 * @remotion/renderer directly instead of the `remotion render` CLI, which
 * hung repeatedly in this environment at the "Getting composition" step
 * for reasons not fully diagnosed (see README.md, "Known gaps"). Logs a
 * timestamp at every phase so a hang is visible and localized, and fails
 * loudly after a generous timeout instead of hanging silently.
 *
 *   node scripts/render-direct.mjs                        # every registered composition
 *   node scripts/render-direct.mjs MonthlyMoneyReset-FeatureSpotlight   # just one
 */
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, getCompositions } from "@remotion/renderer";
import path from "node:path";
import { mkdir } from "node:fs/promises";
import { webpackOverride } from "../webpack-override.mjs";
import { browserExecutable } from "./browser.mjs";
import { masterVideo } from "./master-audio.mjs";

const OUT_DIR = path.resolve(process.cwd(), "out");
const only = process.argv[2];

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`Timed out after ${ms}ms: ${label}`)), ms)),
  ]);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  log("bundling...");
  const bundled = await withTimeout(
    bundle({ entryPoint: path.resolve(process.cwd(), "src/index.ts"), webpackOverride }),
    120_000,
    "bundle()"
  );
  log(`bundled: ${bundled}`);

  const all = await getCompositions(bundled, { browserExecutable });
  const targets = only ? all.filter((c) => c.id === only) : all.filter((c) => c.id.endsWith("-FeatureSpotlight"));
  if (targets.length === 0) {
    throw new Error(only ? `No composition found with id "${only}"` : "No -FeatureSpotlight compositions found");
  }
  log(`rendering ${targets.length} composition(s): ${targets.map((c) => c.id).join(", ")}`);

  for (const compositionMeta of targets) {
    log(`selecting composition ${compositionMeta.id}...`);
    const composition = await withTimeout(
      selectComposition({ browserExecutable, serveUrl: bundled, id: compositionMeta.id }),
      90_000,
      `selectComposition(${compositionMeta.id})`
    );
    const slug = compositionMeta.id.replace(/-FeatureSpotlight$/, "");
    const outPath = path.join(OUT_DIR, `${slug}-feature-spotlight.mp4`);
    log(`rendering media for ${compositionMeta.id} -> ${outPath}...`);
    await withTimeout(
      renderMedia({
        browserExecutable,
        composition,
        serveUrl: bundled,
        codec: "h264",
        outputLocation: outPath,
        onProgress: ({ renderedFrames, encodedFrames }) => {
          if (renderedFrames % 100 === 0) log(`  rendered ${renderedFrames}/${composition.durationInFrames}, encoded ${encodedFrames}`);
        },
      }),
      15 * 60_000,
      `renderMedia(${compositionMeta.id})`
    );
    const lufs = masterVideo(outPath);
    log(`mastered audio: ${lufs.before.toFixed(1)} dB -> ${lufs.after.toFixed(1)} dB`);
    log(`done: ${outPath}`);
  }
}

// Exit explicitly: a pending per-phase timeout timer would otherwise keep
// the process alive for its full length after the work is done.
main().then(() => process.exit(0)).catch((err) => {
  console.error(`[${new Date().toISOString()}] FAILED:`, err);
  process.exit(1);
});
