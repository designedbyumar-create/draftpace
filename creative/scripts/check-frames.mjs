#!/usr/bin/env node
/**
 * Frame gate. Adapted from agentic-product-demo's check-frames.mjs concept
 * (measure a couple of numbers per frame, refuse to pass what can't be
 * verified), rewritten against this project's own stack: it renders a
 * sample of frames directly via @remotion/renderer's renderStill() (no
 * system ffmpeg needed, this machine doesn't have one on PATH) and checks
 * each with sharp.
 *
 * Detects:
 *   - a frame that fails to render at all ("corrupted/missing")
 *   - a frame sharp can't decode ("corrupted")
 *   - an extreme luminance jump between consecutive sampled frames
 *     ("obviously broken render" — a flash frame, a dropped composite, etc)
 *
 * This is a coarse, mechanical check. It cannot judge whether the picture
 * is actually correct — a human still has to look at the preview. See
 * creative/README.md.
 *
 *   node scripts/check-frames.mjs [composition-id] [--every N]
 *   node scripts/check-frames.mjs                         # defaults to MonthlyMoneyReset-FeatureSpotlight
 */
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import sharp from "sharp";
import path from "node:path";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { webpackOverride } from "../webpack-override.mjs";
import { browserExecutable } from "./browser.mjs";

const EVERY = Number(process.argv.includes("--every") ? process.argv[process.argv.indexOf("--every") + 1] : 10);
const COMPOSITION_ID = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : "MonthlyMoneyReset-FeatureSpotlight";
const LUMINANCE_JUMP_THRESHOLD = 60; // out of 255; a jump bigger than this between adjacent sampled frames is flagged

async function main() {
  console.log(`Bundling for frame gate on ${COMPOSITION_ID} (sampling every ${EVERY} frames)...`);
  const entry = path.resolve(process.cwd(), "src/index.ts");
  const bundled = await bundle({ entryPoint: entry, webpackOverride });
  const composition = await selectComposition({ browserExecutable, serveUrl: bundled, id: COMPOSITION_ID });

  const tmp = await mkdtemp(path.join(tmpdir(), "mmr-frame-gate-"));
  const frames = [];
  for (let f = 0; f < composition.durationInFrames; f += EVERY) frames.push(f);
  // Always check the very last frame too, even if it doesn't land on the stride.
  if (frames[frames.length - 1] !== composition.durationInFrames - 1) {
    frames.push(composition.durationInFrames - 1);
  }

  const findings = [];
  let lastMeanLuma = null;
  let lastFrame = null;

  for (const frame of frames) {
    const outPath = path.join(tmp, `frame-${frame}.png`);
    try {
      await renderStill({ browserExecutable, composition, serveUrl: bundled, output: outPath, frame });
    } catch (err) {
      findings.push({ frame, issue: "render-failed", detail: String(err.message ?? err).slice(0, 200) });
      continue;
    }
    try {
      const stats = await sharp(outPath).stats();
      // Mean of the three channel means as a rough luminance proxy — good enough for jump detection, not color-accurate.
      const meanLuma = stats.channels.slice(0, 3).reduce((sum, c) => sum + c.mean, 0) / 3;
      if (lastMeanLuma !== null) {
        const delta = Math.abs(meanLuma - lastMeanLuma);
        if (delta > LUMINANCE_JUMP_THRESHOLD) {
          findings.push({
            frame,
            issue: "luminance-jump",
            detail: `${lastMeanLuma.toFixed(1)} -> ${meanLuma.toFixed(1)} (frame ${lastFrame} -> ${frame})`,
          });
        }
      }
      lastMeanLuma = meanLuma;
      lastFrame = frame;
    } catch (err) {
      findings.push({ frame, issue: "corrupted-frame", detail: String(err.message ?? err).slice(0, 200) });
    }
  }

  await rm(tmp, { recursive: true, force: true });

  console.log(`Checked ${frames.length} sampled frames of ${composition.durationInFrames}.`);
  if (findings.length === 0) {
    console.log("PASS: no corrupted frames, no missing frames, no extreme luminance jumps found in the sample.");
    process.exit(0);
  }
  console.log(`FAIL: ${findings.length} finding(s):`);
  for (const f of findings) console.log(`  frame ${f.frame}: ${f.issue} (${f.detail})`);
  process.exit(1);
}

// Exit explicitly: a pending per-phase timeout timer would otherwise keep
// the process alive for its full length after the work is done.
main().then(() => process.exit(0)).catch((err) => {
  console.error("Frame gate crashed:", err);
  process.exit(1);
});
