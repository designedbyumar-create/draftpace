#!/usr/bin/env node
/**
 * Renders the Home Base explainer.
 *
 *   node explainers/home-base/render.mjs                 the film, out/explainers/home-base.mp4
 *   node explainers/home-base/render.mjs --stills 7,19   PNGs at those seconds, to review
 *
 * Loads truth.ts (Home Base's own code, through vite), refuses a timeline
 * where two tokens on the rack would run into each other, captures every
 * frame from the page in Chromium, and encodes it with the licensed Mixkit
 * bed and a soft click wherever a token lands (public/audio/ATTRIBUTION.md).
 */
import { createServer } from "vite";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { makeFilm, FPS, DURATION } from "./film.mjs";
import { pageHtml } from "./page.mjs";

const CREATIVE = path.resolve(import.meta.dirname, "../..");
const OUT = path.join(CREATIVE, "out/explainers");
const AUDIO = path.join(CREATIVE, "public/audio");
const args = process.argv.slice(2);
const stills = args.includes("--stills") ? args[args.indexOf("--stills") + 1].split(",").map(Number) : null;
const log = (m) => console.log(`[${new Date().toLocaleTimeString()}] ${m}`);
const browserPath = process.env.CHROMIUM ?? "/opt/pw-browsers/chromium";

const vite = await createServer({
  configFile: false, logLevel: "error", appType: "custom", root: CREATIVE,
  server: { middlewareMode: true }, optimizeDeps: { noDiscovery: true },
  resolve: { alias: { "@": path.join(CREATIVE, "..", "src") } },
});
const T = (await vite.ssrLoadModule(path.join(CREATIVE, "explainers/home-base/truth.ts"))).homeBaseTruth();
await vite.close();

const film = makeFilm(T);
const near = film.closest();
log(`closest two tokens on the rack: ${near.d.toFixed(1)} at ${near.t.toFixed(2)}s (${near.pair})`);
if (near.d < 14) throw new Error(`tokens collide on the rack: ${near.pair} at ${near.t.toFixed(2)}s, ${near.d.toFixed(1)} apart (need 14)`);

fs.mkdirSync(OUT, { recursive: true });
const html = path.join(OUT, "home-base.html");
fs.writeFileSync(html, pageHtml());
const browser = await chromium.launch({ executablePath: browserPath });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(`file://${html}`);
await page.evaluate(() => document.fonts.ready);
const show = (t) => page.evaluate((s) => window.__show(s), film.stateAt(t));

if (stills) {
  for (const t of stills) {
    await show(t);
    const file = path.join(OUT, `home-base-${String(t).replace(".", "_")}s.png`);
    await page.screenshot({ path: file });
    log(`wrote ${path.relative(CREATIVE, file)}`);
  }
  await browser.close();
  process.exit(0);
}

const silent = path.join(OUT, "home-base-silent.mp4");
const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-movflags", "+faststart", silent], { stdio: ["pipe", "inherit", "inherit"] });
const frames = Math.round(DURATION * FPS);
for (let f = 0; f < frames; f++) {
  await show(f / FPS);
  const jpg = await page.screenshot({ type: "jpeg", quality: 94 });
  if (!ff.stdin.write(jpg)) await new Promise((r) => ff.stdin.once("drain", r));
  if ((f + 1) % 150 === 0 || f + 1 === frames) log(`${f + 1}/${frames} frames`);
}
ff.stdin.end();
await new Promise((r, x) => ff.on("close", (code) => (code === 0 ? r() : x(new Error(`ffmpeg exited ${code}`)))));
await browser.close();

// Sound: the bed, faded in and out, a quiet click per landing, the chime when the flag goes up.
const clicks = film.landings;
const inputs = ["-i", silent, "-i", path.join(AUDIO, "bed-relaxation-05.mp3"), "-i", path.join(AUDIO, "click-settle.wav"), "-i", path.join(AUDIO, "chime-reveal.wav")];
const parts = [`[1:a]atrim=0:${DURATION},afade=t=in:d=1.2,afade=t=out:st=${DURATION - 3.5}:d=3.5,volume=0.55[bed]`];
parts.push(`[2:a]volume=0.22,asplit=${clicks.length}${clicks.map((_, i) => `[c${i}]`).join("")}`);
clicks.forEach((t, i) => parts.push(`[c${i}]adelay=${Math.round(t * 1000)}|${Math.round(t * 1000)}[d${i}]`));
parts.push(`[3:a]volume=0.35,adelay=${Math.round(film.flagAt * 1000)}|${Math.round(film.flagAt * 1000)}[chime]`);
parts.push(`[bed]${clicks.map((_, i) => `[d${i}]`).join("")}[chime]amix=inputs=${clicks.length + 2}:normalize=0:duration=first,loudnorm=I=-16:TP=-1.5:LRA=11[a]`);
const final = path.join(OUT, "home-base.mp4");
await new Promise((r, x) => spawn("ffmpeg", ["-y", "-loglevel", "error", ...inputs, "-filter_complex", parts.join(";"), "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-shortest", final], { stdio: "inherit" }).on("close", (code) => (code === 0 ? r() : x(new Error(`ffmpeg mix exited ${code}`)))));
fs.rmSync(silent);
log(`wrote ${path.relative(CREATIVE, final)}`);
