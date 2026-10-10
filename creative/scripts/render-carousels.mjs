#!/usr/bin/env node
/**
 * Make every situation carousel as images, one folder per carousel, ready
 * to post on Instagram and Facebook.
 *
 *   npm run carousels                  from the draftpace folder: all 45 (about 15 minutes)
 *   npm run carousels -- travel        only the carousels whose name contains "travel"
 *
 * Output goes next to the videos, in "Draftpace Videos" on the Desktop (or DRAFTPACE_VIDEOS):
 *
 *   Draftpace Videos/
 *     8 Carousels - Instagram and Facebook/
 *       Travel Companion - My flight is delayed and I have a connection/
 *         01.jpg ... 10.jpg     the slides, in order (4:5, the size both apps show in full)
 *         Caption.txt           the Instagram caption, the Facebook caption with its link, and alt text per slide
 *
 * A carousel whose folder is already complete is skipped, so this can be
 * stopped and started again. Slides are written to a temporary folder and
 * moved in only when the whole carousel is done.
 */
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { webpackOverride } from "../webpack-override.mjs";
import { browserExecutable } from "./browser.mjs";

const CREATIVE = path.resolve(import.meta.dirname, "..");
const filter = (process.argv.slice(2).find((a) => !a.startsWith("--")) ?? "").toLowerCase();
const desktop = path.join(os.homedir(), "Desktop");
const ROOT = process.env.DRAFTPACE_VIDEOS ?? (fs.existsSync(desktop) ? path.join(desktop, "Draftpace Videos") : path.join(CREATIVE, "out", "by-platform"));
const FOLDER = path.join(ROOT, "8 Carousels - Instagram and Facebook");
const SITE = "https://draftpace.com";

const log = (m) => console.log(`[${new Date().toLocaleTimeString()}] ${m}`);
const clean = (t) => t.replace(/\//g, "-").replace(/[\\:*?"<>|]+/g, "").replace(/\s+/g, " ").trim();
const short = (t, n) => (t.length <= n ? t : t.slice(0, n).replace(/\s+\S*$/, ""));

function carouselFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? carouselFiles(path.join(dir, e.name)) : e.name.endsWith(".carousel.json") ? [path.join(dir, e.name)] : []));
}

const carousels = carouselFiles(path.join(CREATIVE, "shots", "carousels")).map((f) => JSON.parse(fs.readFileSync(f, "utf8")));
/** A fingerprint of a carousel's slides: a folder made from an older version of it is made again. */
const version = (car) => crypto.createHash("sha256").update(JSON.stringify(car.slides)).digest("hex").slice(0, 12);
const productName = (car) => car.slides.find((s) => s.kind === "help").name.text;
const jobs = carousels
  .map((car) => ({ car, name: clean(`${productName(car)} - ${short(car.slides[0].quote.text.replace(/\.$/, ""), 70)}`) }))
  .filter((j) => !filter || j.name.toLowerCase().includes(filter) || j.car.id.includes(filter))
  .sort((a, b) => a.name.localeCompare(b.name));

/** The words on a slide, in reading order: its alt text. */
function slideText(s) {
  switch (s.kind) {
    case "cover": return `"${s.quote.text}" ${s.promise.text}`;
    case "answer": return s.lines.map((l) => l.text).join(" ");
    case "step": return [s.eyebrow?.text, s.number?.text, s.head.text, ...s.body.map((b) => b.text)].filter(Boolean).join(". ").replace(/\.\./g, ".");
    case "checklist": return [s.eyebrow?.text, ...s.items.map((i) => i.text)].filter(Boolean).join(" ");
    case "help": return `${s.name.text}: ${s.line.text}`;
    case "close": return `${s.eyebrow.text}: ${s.title.text}. ${s.url.text}`;
  }
}

function link(car, source) {
  const u = new URL(`${SITE}/guides/${car.guide}`);
  u.searchParams.set("utm_source", source);
  u.searchParams.set("utm_medium", "carousel");
  u.searchParams.set("utm_campaign", car.id);
  return u.toString();
}

/** Captions from the carousel's own words: the moment, the guide's summary, and where the full guide is. */
function caption(car) {
  const cover = car.slides[0];
  const answer = car.slides.find((s) => s.kind === "answer");
  const close = car.slides.find((s) => s.kind === "close");
  const body = [`"${cover.quote.text.replace(/\.$/, "")}"`, ...(answer ? [answer.lines.map((l) => l.text).join(" ")] : []), close.save.text];
  return [
    `${productName(car)}: ${cover.quote.text}`,
    "",
    "INSTAGRAM CAPTION (put the guide link in your bio)",
    [...body, `${close.eyebrow.text}: ${close.title.text}. ${close.link.text}`].join("\n\n"),
    "",
    "FACEBOOK CAPTION",
    [...body, `${close.eyebrow.text}: ${close.title.text}`, link(car, "facebook")].join("\n\n"),
    "",
    "LINK IN BIO (Instagram)",
    link(car, "instagram"),
    "",
    "ALT TEXT, PER SLIDE",
    ...car.slides.map((s, i) => `${String(i + 1).padStart(2, "0")}: ${slideText(s)}`),
    "",
    `Carousel id: ${car.id}`,
    `Version: ${version(car)}`,
  ].join("\n") + "\n";
}

const done = (j) => {
  const dir = path.join(FOLDER, j.name);
  const cap = path.join(dir, "Caption.txt");
  return fs.existsSync(cap) && fs.readFileSync(cap, "utf8").includes(`Version: ${version(j.car)}`) && j.car.slides.every((_, i) => fs.existsSync(path.join(dir, `${String(i + 1).padStart(2, "0")}.jpg`)));
};
const todo = jobs.filter((j) => !done(j));
log(`${jobs.length} carousels in "${FOLDER}"`);
log(`${jobs.length - todo.length} already made, ${todo.length} to make`);
if (!todo.length) process.exit(0);

log("preparing the engine (about a minute)...");
const bundled = await bundle({ entryPoint: path.join(CREATIVE, "src", "index.ts"), webpackOverride });
const tmpRoot = path.join(CREATIVE, "out", "render-carousels-tmp");
fs.mkdirSync(tmpRoot, { recursive: true });
let browser = await openBrowser("chrome", { browserExecutable });

async function still(id, output) {
  const composition = await selectComposition({ browserExecutable, serveUrl: bundled, id, puppeteerInstance: browser });
  await renderStill({ browserExecutable, composition, serveUrl: bundled, output, imageFormat: "jpeg", jpegQuality: 92, puppeteerInstance: browser, timeoutInMilliseconds: 60000 });
}

const skipped = [];
for (const [n, j] of todo.entries()) {
  log(`${n + 1}/${todo.length}  ${j.name} (${j.car.slides.length} slides)`);
  const tmp = path.join(tmpRoot, j.car.id);
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });
  try {
    for (let i = 0; i < j.car.slides.length; i++) {
      const nn = String(i + 1).padStart(2, "0");
      const id = `Carousel-${j.car.id}-${nn}`;
      const out = path.join(tmp, `${nn}.jpg`);
      try {
        await still(id, out);
      } catch (e) {
        // A browser that fell over is replaced, and the slide tried once more.
        log(`  slide ${nn}: the browser stumbled (${e.message.split("\n")[0]}); trying again...`);
        await browser.close({ silent: true }).catch(() => {});
        browser = await openBrowser("chrome", { browserExecutable });
        await still(id, out);
      }
    }
    fs.writeFileSync(path.join(tmp, "Caption.txt"), caption(j.car));
    const dir = path.join(FOLDER, j.name);
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(FOLDER, { recursive: true });
    // A rename cannot cross disks (an external drive as DRAFTPACE_VIDEOS); copy then.
    try { fs.renameSync(tmp, dir); } catch { fs.cpSync(tmp, dir, { recursive: true }); fs.rmSync(tmp, { recursive: true, force: true }); }
  } catch (e) {
    log(`  could not make this one, skipping it for now: ${e.message.split("\n")[0]}`);
    skipped.push(j.name);
  }
}
await browser.close({ silent: true }).catch(() => {});
fs.rmSync(tmpRoot, { recursive: true, force: true });
log(`Finished. Your carousels are in "${FOLDER}".`);
if (skipped.length) log(`${skipped.length} could not be made this time (${skipped.join("; ")}). Run the same command again to make just those.`);
process.exit(0);
