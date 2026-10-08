/**
 * Guards for the director's films: they hold every film to the real
 * product, to its placement, and to being its own film rather than a
 * template with the product swapped in.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { runSlate } from "../director/run";
import { resolveSource, MICROCOPY } from "../director/dossier";
import { PLATFORMS } from "../director/platforms";
import { SHOP_LISTINGS } from "../src/shop-listings";
import { SFX_CUES } from "../src/motion/sound-cues";
import CATALOG from "../director/screens.catalog.json";
import MANIFEST from "../src/screens-manifest.json";
import { shape, similarity, MAX_SIMILARITY, type Film, type Copy } from "../director/film";

const ROOT = path.resolve(import.meta.dirname, "..");
const planned = runSlate();
const films = planned.map((x) => x.film);
const catalog = CATALOG as Record<string, { heading: string; regions: { id: string; label: string; y: number; h: number }[] }>;
const manifest = MANIFEST as Record<string, { width: number; height: number }>;

function wordsOf(f: Film): { where: string; copy: Copy }[] {
  return [
    { where: "angle", copy: f.angle },
    ...f.scenes.flatMap((s) => [
      ...s.copy.map((copy) => ({ where: s.id, copy })),
      ...(s.caption ? [{ where: `${s.id} caption`, copy: s.caption }] : []),
      ...(s.eyebrow ? [{ where: `${s.id} eyebrow`, copy: s.eyebrow }] : []),
    ]),
  ];
}

/** What the source says, or undefined if it says nothing. */
function sourceText(f: Film, source: string): string | undefined {
  if (source === "micro") return undefined;
  if (source === "title") return SHOP_LISTINGS[f.product].title;
  const screen = source.match(/^screen:(.+)#(.+)$/);
  if (screen) {
    const entry = catalog[screen[1]];
    return screen[2] === "heading" ? entry?.heading : entry?.regions.find((r) => r.id === screen[2])?.label;
  }
  return resolveSource(SHOP_LISTINGS[f.product], source);
}

describe("Director films", () => {
  it("plans the whole slate", () => {
    expect(films.length).toBeGreaterThanOrEqual(36);
  });

  it("are the films committed in shots/: re-run `node scripts/direct.mjs` after changing a listing, a screen or the director", () => {
    for (const f of films) {
      const file = path.join(ROOT, "shots", f.product, "films", `${f.platform}--${f.goal}.film.json`);
      expect(fs.existsSync(file), `${file} is missing`).toBe(true);
      expect(JSON.parse(fs.readFileSync(file, "utf8")), `${file} is stale`).toEqual(JSON.parse(JSON.stringify(f)));
    }
  });

  it("put only real words on screen: each one is its source, word for word", () => {
    for (const f of films) {
      for (const { where, copy } of wordsOf(f)) {
        if (copy.source === "micro") {
          expect(MICROCOPY as readonly string[], `${f.id} ${where}: "${copy.text}" is not in the reviewed MICROCOPY`).toContain(copy.text);
        } else {
          expect(sourceText(f, copy.source), `${f.id} ${where}: "${copy.text}" is not what ${copy.source} says`).toBe(copy.text);
        }
      }
    }
  });

  it("show only the product's own real screens, focused inside the capture", () => {
    for (const f of films) {
      for (const s of f.scenes) {
        for (const src of [s.screen?.src, s.screen?.also].filter(Boolean) as string[]) {
          expect(fs.existsSync(path.join(ROOT, "public", src)), `${f.id} ${s.id}: ${src} is not on disk`).toBe(true);
          expect(path.basename(src).startsWith(`${f.product}-`), `${f.id} ${s.id}: ${src} is another product's screen`).toBe(true);
        }
        const focus = s.screen?.focus;
        if (focus) {
          const size = manifest[s.screen!.src];
          const pageH = size.height * (390 / size.width);
          expect(focus.y + focus.h, `${f.id} ${s.id}: focus "${focus.region}" runs off the bottom of the capture`).toBeLessThanOrEqual(pageH);
        }
      }
    }
  });

  it("hold every scene long enough to read on its platform", () => {
    for (const f of films) {
      const p = PLATFORMS[f.platform];
      for (const s of f.scenes) {
        const texts = [...s.copy.map((c) => c.text), s.caption?.text, s.eyebrow?.text].filter(Boolean) as string[];
        const words = texts.join(" ").split(/\s+/).filter(Boolean).length;
        if (!words || s.kind === "brand" || s.kind === "cta") continue;
        const need = Math.round((0.5 + words * p.secondsPerWord) * f.fps);
        expect(s.dur, `${f.id} ${s.id}: ${words} words held ${(s.dur / f.fps).toFixed(1)}s, ${p.label} readers need ${(need / f.fps).toFixed(1)}s`).toBeGreaterThanOrEqual(need);
      }
    }
  });

  it("fit their placement: canvas, length, hook, sound", () => {
    for (const f of films) {
      const p = PLATFORMS[f.platform];
      expect([f.width, f.height], `${f.id} canvas`).toEqual([p.width, p.height]);
      expect(f.durationInFrames / f.fps, `${f.id} runs too long for ${p.label}`).toBeLessThanOrEqual(p.duration.max);
      expect(f.durationInFrames / f.fps, `${f.id} runs too short for ${p.label}`).toBeGreaterThanOrEqual(p.duration.min - 0.05);
      const firstWords = f.scenes.find((s) => s.copy.length || s.caption || s.eyebrow)!;
      expect(firstWords.from / f.fps, `${f.id}: nothing to read until ${(firstWords.from / f.fps).toFixed(1)}s, ${p.label} needs a hook by ${p.hookBy}s`).toBeLessThanOrEqual(p.hookBy);
      for (const s of f.scenes) for (const c of s.sfx) expect(SFX_CUES, `${f.id} ${s.id}: no sound file for "${c.cue}"`).toHaveProperty(c.cue);
    }
  });
});

describe("No two films are the same film", () => {
  it("never repeats a structure or a hook within one product", () => {
    const byProduct = new Map<string, Film[]>();
    films.forEach((f) => byProduct.set(f.product, [...(byProduct.get(f.product) ?? []), f]));
    for (const [product, fs2] of byProduct) {
      const structures = fs2.map((f) => f.structure);
      expect(new Set(structures).size, `${product} repeats a structure: ${structures.join(", ")}`).toBe(structures.length);
      const hooks = fs2.map((f) => f.angle.source).filter((s) => s !== "micro");
      expect(new Set(hooks).size, `${product} repeats a hook: ${hooks.join(", ")}`).toBe(hooks.length);
    }
  });

  it(`keeps every pair of films structurally distinct (shape similarity under ${MAX_SIMILARITY})`, () => {
    for (let i = 0; i < films.length; i++) {
      for (let j = i + 1; j < films.length; j++) {
        const sim = similarity(shape(films[i]), shape(films[j]));
        expect(sim, `${films[i].id} and ${films[j].id} are the same shape (${sim.toFixed(2)}): one of them is a template`).toBeLessThan(MAX_SIMILARITY);
      }
    }
  });
});
