/**
 * Guards for the director's films: they hold every film to the real
 * product, to its placement, and to being its own film rather than a
 * template with the product swapped in.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { runSlate, runVoiceovers } from "../director/run";
import { resolveSource, MICROCOPY } from "../director/dossier";
import { resolveGuideSource, productForGuide, guideBySlug } from "../director/guide";
import { resolveVoSource, scriptLines, chunk, parseSrt, splitScript, type VoiceoverInput } from "../director/voiceover";
import { PLATFORMS } from "../director/platforms";
import { SHOP_LISTINGS } from "../src/shop-listings";
import { SFX_CUES } from "../src/motion/sound-cues";
import CATALOG from "../director/screens.catalog.json";
import MANIFEST from "../src/screens-manifest.json";
import { shape, similarity, MAX_SIMILARITY, filmPath, type Film, type Copy } from "../director/film";

const ROOT = path.resolve(import.meta.dirname, "..");
const planned = runSlate();
const voiced = runVoiceovers();
/** Every film the director planned: product films and guide-driven films. */
const directed = planned.map((x) => x.film);
const productFilms = directed.filter((f) => !f.guide);
const guideFilms = directed.filter((f) => f.guide);
const voiceFilms = voiced.map((x) => x.film);
const inputOf = (f: Film) => voiced.find((x) => x.film === f)?.input as VoiceoverInput;
const films = [...directed, ...voiceFilms];
const catalog = CATALOG as Record<string, { heading: string; regions: { id: string; label: string; y: number; h: number }[] }>;
const manifest = MANIFEST as Record<string, { width: number; height: number }>;

function wordsOf(f: Film): { where: string; copy: Copy }[] {
  return [
    { where: "angle", copy: f.angle },
    ...f.scenes.flatMap((s) => [
      ...s.copy.map((copy) => ({ where: s.id, copy })),
      ...(s.caption ? [{ where: `${s.id} caption`, copy: s.caption }] : []),
      ...(s.eyebrow ? [{ where: `${s.id} eyebrow`, copy: s.eyebrow }] : []),
      ...(s.captions ?? []).map((copy) => ({ where: `${s.id} voice caption`, copy })),
    ]),
  ];
}

/** What the source says, or undefined if it says nothing. */
function sourceText(f: Film, source: string): string | undefined {
  if (source === "micro") return undefined;
  if (source === "title") return SHOP_LISTINGS[f.product].title;
  if (source.startsWith("guide:")) return resolveGuideSource(source);
  if (source.startsWith("vo:")) return f.voiceover ? resolveVoSource(inputOf(f), source) : undefined;
  const screen = source.match(/^screen:(.+)#(.+)$/);
  if (screen) {
    const entry = catalog[screen[1]];
    return screen[2] === "heading" ? entry?.heading : entry?.regions.find((r) => r.id === screen[2])?.label;
  }
  return resolveSource(SHOP_LISTINGS[f.product], source);
}

describe("Director films", () => {
  it("plans the whole slate", () => {
    expect(productFilms.length).toBeGreaterThanOrEqual(36);
    expect(guideFilms.length).toBeGreaterThanOrEqual(24);
  });

  it("are the films committed in shots/: re-run `node scripts/direct.mjs` (or `node scripts/voiceover.mjs`) after changing a listing, a guide, a screen, a script or the director", () => {
    for (const f of films) {
      const file = path.join(ROOT, "shots", `${filmPath(f)}.film.json`);
      expect(fs.existsSync(file), `${file} is missing`).toBe(true);
      expect(JSON.parse(fs.readFileSync(file, "utf8")), `${file} is stale`).toEqual(JSON.parse(JSON.stringify(f)));
    }
    // And nothing committed that no longer plans: a deleted voice-over or brief leaves no orphan behind.
    const generated = [fs.readFileSync(path.join(ROOT, "src/films.generated.ts"), "utf8"), fs.readFileSync(path.join(ROOT, "src/voiceover-films.generated.ts"), "utf8")].join("\n");
    const registered = [...generated.matchAll(/from "\.\.\/shots\/(.+)\.film\.json"/g)].map((m) => m[1]).sort();
    expect(registered, "src/*.generated.ts lists different films from what plans").toEqual(films.map((f) => filmPath(f)).sort());
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
        // A voice-over's own words are spoken as well as shown, so they are held as long as they are said, not as long as they take to read.
        const texts = [...s.copy, s.caption, s.eyebrow].filter((c) => c && !c.source.startsWith("vo:")).map((c) => c!.text);
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
      const limits = f.runtime ?? p.duration;
      expect(f.durationInFrames / f.fps, `${f.id} runs too long for ${p.label}`).toBeLessThanOrEqual(limits.max);
      expect(f.durationInFrames / f.fps, `${f.id} runs too short for ${p.label}`).toBeGreaterThanOrEqual(limits.min - 0.05);
      const firstWords = f.scenes.find((s) => s.copy.length || s.caption || s.eyebrow || s.captions?.length)!;
      expect(firstWords.from / f.fps, `${f.id}: nothing to read until ${(firstWords.from / f.fps).toFixed(1)}s, ${p.label} needs a hook by ${p.hookBy}s`).toBeLessThanOrEqual(p.hookBy);
      for (const s of f.scenes) for (const c of s.sfx) expect(SFX_CUES, `${f.id} ${s.id}: no sound file for "${c.cue}"`).toHaveProperty(c.cue);
    }
  });
});

describe("Guide-driven films", () => {
  it("hand over to the product their guide links, and only then", () => {
    for (const f of guideFilms) {
      expect(f.product, `${f.id} hands over to ${f.product}, but its guide hands over to ${productForGuide(f.guide!).product}`).toBe(productForGuide(f.guide!).product);
      const body = JSON.stringify(guideBySlug(f.guide!).body);
      const linked = body.includes(`/shop/${f.product}`) || (f.product === "monthly-money-reset" && body.includes("](/free)"));
      expect(linked, `${f.id}: the guide never links ${f.product}, so the film recommends something the guide does not`).toBe(true);
    }
  });

  it("teach before they sell: the guide's own words come before any of the product's", () => {
    for (const f of guideFilms) {
      const fromGuide = (s: Film["scenes"][number]) => [...s.copy, s.eyebrow].some((c) => c?.source.startsWith("guide:"));
      const firstProduct = f.scenes.findIndex((s) => [...s.copy, s.caption, s.eyebrow].some((c) => c && c.source !== "micro" && !c.source.startsWith("guide:")));
      const taught = f.scenes.slice(0, firstProduct).filter(fromGuide).length;
      expect(taught, `${f.id}: only ${taught} scene(s) of the guide before the product appears`).toBeGreaterThanOrEqual(2);
    }
  });

  it("end on the guide's real address, and number steps as the guide numbers them", () => {
    for (const f of guideFilms) {
      const end = f.scenes.at(-1)!;
      expect(end.copy.map((c) => c.source), `${f.id} does not end on its guide's address`).toContain(`guide:${f.guide}/url`);
      for (const s of f.scenes) {
        if (!s.eyebrow || !/^\d+$/.test(s.eyebrow.text)) continue;
        const item = s.copy[0].source.match(/\.items\[(\d+)\]/);
        expect(item && Number(item[1]) + 1, `${f.id} ${s.id}: shows "${s.eyebrow.text}" on the guide's step ${item ? Number(item[1]) + 1 : "?"}`).toBe(Number(s.eyebrow.text));
      }
    }
  });
});

describe("Voice-over films", () => {
  it("caption every line in full, in order, in the script's own words", () => {
    for (const f of voiceFilms) {
      const lines = scriptLines(inputOf(f));
      const said = new Map<number, string[]>();
      for (const s of f.scenes) {
        const title = s.copy.find((c) => c.source.startsWith("vo:"));
        if (title) said.set(Number(title.source.split("#")[1]), [title.text]);
        for (const k of s.captions ?? []) {
          const i = Number(k.source.match(/#(\d+)@/)![1]);
          said.set(i, [...(said.get(i) ?? []), k.text]);
        }
      }
      lines.forEach((line, i) => expect((said.get(i) ?? []).join(" "), `${f.id}: line ${i + 1} is not shown in full`).toBe(line));
    }
  });

  it("show each caption once, in time, inside its shot", () => {
    for (const f of voiceFilms) {
      let last = -1;
      for (const s of f.scenes) {
        for (const k of s.captions ?? []) {
          const at = s.from + k.at;
          expect(at, `${f.id} ${s.id}: "${k.text}" comes before the caption it follows`).toBeGreaterThanOrEqual(last);
          expect(k.at + k.dur, `${f.id} ${s.id}: "${k.text}" runs past its shot`).toBeLessThanOrEqual(s.dur);
          last = at + k.dur;
        }
      }
    }
  });

  it("run as long as the recording, the caption file or the chosen length", () => {
    for (const f of voiceFilms) {
      const v = inputOf(f);
      const secs = f.durationInFrames / f.fps;
      if (v.audio) expect(secs, `${f.id} cuts off the recording`).toBeGreaterThanOrEqual(v.audio.seconds);
      else if (v.srt?.length) expect(secs, `${f.id} ends before its last caption`).toBeGreaterThanOrEqual(v.srt.at(-1)!.end);
      else expect(Math.abs(secs - (v.seconds ?? 0)), `${f.id} runs ${secs}s, not the chosen ${v.seconds}s`).toBeLessThan(0.05);
    }
  });

  it("cut captions where a person pauses, keeping every word", () => {
    const line = "Open the account you pay bills from and write down the available balance, not the current one.";
    const pieces = chunk(line);
    expect(pieces.map((p) => p.text).join(" ")).toBe(line);
    expect(pieces.map((p) => p.text)).toEqual(["Open the account you pay bills from", "and write down the available balance,", "not the current one."]);
    for (const l of ["It's only as current as your last update, and it doesn't connect to your bank.", "Subtract them.", "One"]) {
      const ps = chunk(l);
      expect(ps.map((p) => p.text).join(" ")).toBe(l);
      expect(ps.every((p) => p.words >= 2 || ps.length === 1), `"${l}" strands a word`).toBe(true);
      expect(ps.every((p) => !/\b(the|your|a|to)$/i.test(p.text)), `"${l}" ends a caption on a word that leans forward`).toBe(true);
    }
  });

  it("read a caption file and a script the way an editor writes them", () => {
    const srt = "1\r\n00:00:00,400 --> 00:00:02,100\r\nFirst line\r\n\r\n2\r\n00:00:02,300 --> 00:00:05,050\r\n<i>Second</i> line,\r\nwrapped\r\n";
    expect(parseSrt(srt)).toEqual([{ start: 0.4, end: 2.1, text: "First line" }, { start: 2.3, end: 5.05, text: "Second line, wrapped" }]);
    expect(splitScript("One sentence. Two sentences here!\n\nA third?")).toEqual(["One sentence.", "Two sentences here!", "A third?"]);
  });
});

describe("No two films are the same film", () => {
  it("never repeats a structure or a hook within one product", () => {
    const byProduct = new Map<string, Film[]>();
    productFilms.forEach((f) => byProduct.set(f.product, [...(byProduct.get(f.product) ?? []), f]));
    for (const [product, fs2] of byProduct) {
      const structures = fs2.map((f) => f.structure);
      expect(new Set(structures).size, `${product} repeats a structure: ${structures.join(", ")}`).toBe(structures.length);
      const hooks = fs2.map((f) => f.angle.source).filter((s) => s !== "micro");
      expect(new Set(hooks).size, `${product} repeats a hook: ${hooks.join(", ")}`).toBe(hooks.length);
    }
  });

  // A voice-over's shape is its script's, so only the films the director shaped are held to this.
  it(`keeps every pair of directed films structurally distinct (shape similarity under ${MAX_SIMILARITY})`, () => {
    for (let i = 0; i < directed.length; i++) {
      for (let j = i + 1; j < directed.length; j++) {
        const sim = similarity(shape(directed[i]), shape(directed[j]));
        expect(sim, `${directed[i].id} and ${directed[j].id} are the same shape (${sim.toFixed(2)}): one of them is a template`).toBeLessThan(MAX_SIMILARITY);
      }
    }
  });
});
