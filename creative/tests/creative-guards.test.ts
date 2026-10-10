/**
 * The Creative Engine's one hard rule, real UI and real claims only,
 * checked rather than trusted. Each test here guards something a render
 * would happily get wrong without an error: a screen that isn't there, a
 * price the Shop doesn't charge, a headline nobody can trace to the
 * product, another product's screen, a colour the product no longer uses.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { THEMES, PLATFORM_GROUND, PRODUCT_DEFINITIONS } from "../src/theme-registry";
import { SHOP_LISTINGS, productLine } from "../src/shop-listings";
import { SFX_CUES } from "../src/motion/sound-cues";

const ROOT = path.resolve(import.meta.dirname, "..");
const SHOTS = path.join(ROOT, "shots");

type ShotFile = { file: string; slug: string; json: Record<string, unknown> };

function shotFiles(): ShotFile[] {
  return fs.readdirSync(SHOTS).flatMap((slug) =>
    fs
      .readdirSync(path.join(SHOTS, slug))
      .filter((f) => f.endsWith(".json"))
      .map((f) => ({ file: `shots/${slug}/${f}`, slug, json: JSON.parse(fs.readFileSync(path.join(SHOTS, slug, f), "utf8")) })),
  );
}

/** Every value under any key named `key`, anywhere in a JSON tree. */
function collect(node: unknown, key: string, out: unknown[] = []): unknown[] {
  if (Array.isArray(node)) node.forEach((n) => collect(n, key, out));
  else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (k === key) out.push(v);
      collect(v, key, out);
    }
  }
  return out;
}

function allStrings(node: unknown, out: string[] = []): string[] {
  if (typeof node === "string") out.push(node);
  else if (Array.isArray(node)) node.forEach((n) => allStrings(n, out));
  else if (node && typeof node === "object") Object.values(node).forEach((n) => allStrings(n, out));
  return out;
}

const STOP = new Set(["that", "this", "with", "what", "your", "you're", "just", "have", "from", "they", "their", "it's", "still", "into", "then", "than", "there", "every"]);
function contentWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[’']s\b/g, "")
    .split(/[^a-z']+/)
    .filter((w) => w.length >= 4 && !STOP.has(w));
}
/** Share of a creative's content words that appear (by 5-letter stem) in the real problem it claims to sell. */
function grounding(creative: string, problem: string): number {
  const words = contentWords(creative);
  if (words.length === 0) return 0;
  const stems = new Set(contentWords(problem).map((w) => w.slice(0, 5)));
  return words.filter((w) => stems.has(w.slice(0, 5))).length / words.length;
}
const MIN_GROUNDING = 0.4;

describe("Creative Engine data", () => {
  const files = shotFiles();

  it("finds the shot files at all", () => {
    expect(files.length).toBeGreaterThanOrEqual(18);
  });

  it("only renders products that exist, with a theme and a Shop listing", () => {
    for (const { file, json } of files) {
      for (const slug of collect(json, "themeSlug").concat(collect(json, "product").filter((p) => typeof p === "string"))) {
        expect(THEMES, `${file} names "${slug}", which has no product theme`).toHaveProperty(slug as string);
        expect(SHOP_LISTINGS, `${file} names "${slug}", which has no Shop listing`).toHaveProperty(slug as string);
      }
    }
  });

  /** Every screen a file shows: each `src`, plus the extra screens of a fan layout (`also`). */
  const screensOf = (json: unknown) => [...collect(json, "src"), ...collect(json, "also").flat()] as string[];

  it("shows only real captured screens that exist on disk", () => {
    for (const { file, json } of files) {
      for (const src of screensOf(json)) {
        expect(fs.existsSync(path.join(ROOT, "public", src as string)), `${file} shows ${src}, which is not in creative/public/`).toBe(true);
      }
    }
  });

  it("never shows another product's screen", () => {
    for (const { file, slug, json } of files) {
      for (const src of screensOf(json)) {
        expect(path.basename(src as string).startsWith(`${slug}-`), `${file} shows ${src}, a screen from a different product`).toBe(true);
      }
    }
  });

  it("states no price of its own: prices come from the Shop listing via {price}", () => {
    for (const { file, json } of files) {
      for (const s of allStrings(json)) {
        expect(s, `${file} hardcodes a price in "${s}"; use {price}`).not.toMatch(/[$£€]\s?\d/);
      }
    }
  });

  it("prints the Shop's real name and price", () => {
    for (const [slug, listing] of Object.entries(SHOP_LISTINGS)) {
      const { name, price } = productLine(slug);
      expect(name).toBe(listing.title);
      if (listing.access === "free") expect(price).toBe("Free");
      else expect(price, `${slug} footer price`).toBe(`$${listing.price!.amount}`);
    }
  });

  it("only emphasises words the text actually says", () => {
    for (const { file, json } of files) {
      const texts = [...collect(json, "headline"), ...collect(json, "lines")].flat().join(" ").toLowerCase();
      for (const word of (collect(json, "emphasis").flat() as string[]).flatMap((e) => e.split(/\s+/))) {
        expect(texts, `${file} emphasises "${word}", which none of its text says`).toContain(word.toLowerCase());
      }
    }
  });

  it("has an up-to-date size for every captured screen", () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "src/screens-manifest.json"), "utf8"));
    const dir = path.join(ROOT, "public/screens");
    const pngs = fs.readdirSync(dir).filter((f) => f.endsWith(".png"));
    expect(Object.keys(manifest).sort(), "src/screens-manifest.json is stale; run node scripts/screens-manifest.mjs").toEqual(pngs.map((f) => `screens/${f}`).sort());
    for (const f of pngs) {
      const head = fs.readFileSync(path.join(dir, f)).subarray(16, 24); // PNG IHDR: width, height
      expect(manifest[`screens/${f}`], `${f} changed size; run node scripts/screens-manifest.mjs`).toEqual({ width: head.readUInt32BE(0), height: head.readUInt32BE(4) });
    }
  });

  it("only uses sound cues that have a licensed file", () => {
    for (const { file, json } of files) {
      for (const cue of collect(json, "sfx").filter(Boolean)) {
        expect(SFX_CUES, `${file} cues "${cue}", which has no audio file`).toHaveProperty(cue as string);
      }
    }
    for (const f of Object.values(SFX_CUES)) {
      expect(fs.existsSync(path.join(ROOT, "public", f)), `sound cue file ${f} is missing`).toBe(true);
    }
  });
});

describe("Every promotional post sells one real problem the product solves", () => {
  for (const { file, slug, json } of shotFiles().filter((f) => f.file.endsWith("feature-posts.json"))) {
    const posts = json.posts as { id: string; problem: number; headline: string[] }[];
    for (const post of posts) {
      it(`${post.id}`, () => {
        const problems = SHOP_LISTINGS[slug].problemsSolved;
        expect(Number.isInteger(post.problem) && problems[post.problem], `${file} ${post.id} names problem ${post.problem}; ${slug} has ${problems.length}`).toBeTruthy();
        const real = problems[post.problem].problem;
        const said = post.headline.join(" ");
        expect(grounding(said, real), `${file} ${post.id}: "${said}" does not read as the real problem "${real}"`).toBeGreaterThanOrEqual(MIN_GROUNDING);
      });
    }
  }
});

describe("Every video's problem half says the real problem", () => {
  for (const { file, slug, json } of shotFiles().filter((f) => f.file.endsWith("feature-spotlight.shot.json"))) {
    it(slug, () => {
      const problems = SHOP_LISTINGS[slug].problemsSolved;
      const idx = json.problem as number;
      expect(problems[idx], `${file} names problem ${idx}`).toBeTruthy();
      const beats = json.beats as { kind: string; typography?: { lines?: string[] } }[];
      // The opening line or the noise beat's questions: either may carry the
      // problem (a video can open on a framing line, as Monthly Money
      // Reset's does), but at least one must say it.
      const said = beats
        .filter((b) => b.kind === "typography" || b.kind === "noise")
        .map((b) => (b.typography?.lines ?? []).join(" "));
      const best = Math.max(0, ...said.map((s) => grounding(s, problems[idx].problem)));
      expect(best, `${file}: neither ${JSON.stringify(said)} reads as "${problems[idx].problem}"`).toBeGreaterThanOrEqual(MIN_GROUNDING);
    });
  }
});

describe("Themes are the products' own", () => {
  it("has a complete palette for every product", () => {
    for (const [slug, t] of Object.entries(THEMES)) {
      for (const [k, v] of Object.entries(t)) {
        if (k === "title") continue;
        expect(v, `${slug}.${k}`).toMatch(/^(#[0-9a-fA-F]{6}|rgba?\(.+\))$/);
      }
    }
  });

  it("uses each product's declared accent", () => {
    for (const [slug, def] of Object.entries(PRODUCT_DEFINITIONS)) {
      const base = def.theme?.accentScale?.base;
      if (base) expect(THEMES[slug].accent, `${slug}: creative accent is not the product's own accentScale.base`).toBe(base);
    }
  });

  it("keeps PLATFORM_GROUND equal to the platform's light tokens in globals.css", () => {
    const css = fs.readFileSync(path.join(ROOT, "../src/app/globals.css"), "utf8");
    const html = css.slice(css.indexOf("html {"), css.indexOf("}", css.indexOf("html {")));
    const token = (name: string) => html.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].trim();
    expect({
      appBg: token("app-bg"),
      surface: token("surface"),
      surfaceMuted: token("surface-muted"),
      text: token("text"),
      muted: token("muted"),
      border: token("border"),
    }, "PLATFORM_GROUND in theme-registry.ts no longer matches src/app/globals.css's html { } tokens").toEqual(PLATFORM_GROUND);
  });
});
