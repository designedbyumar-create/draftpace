import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { bodyWithFigure, guideArt, guideArtSlugs } from "./guideArt";
import { GUIDES } from "./guides";

const pub = (file: string) => join(process.cwd(), "public", file);
const specs = readdirSync(join(process.cwd(), "scripts/art/specs"))
  .filter((f) => f.endsWith(".json"))
  .flatMap((f) => JSON.parse(readFileSync(join(process.cwd(), "scripts/art/specs", f), "utf8")) as Record<string, unknown>[]);

describe("guide art", () => {
  it("exists for every guide, once", () => {
    const missing = GUIDES.filter((g) => !guideArt(g.slug)).map((g) => g.slug);
    const extra = guideArtSlugs().filter((s) => !GUIDES.some((g) => g.slug === s));
    expect({ missing, extra }).toEqual({ missing: [], extra: [] });
  });

  it("points at real files with the dimensions it declares", async () => {
    const bad: string[] = [];
    for (const slug of guideArtSlugs()) {
      const art = guideArt(slug)!;
      const want: [string, number, number][] = [
        [art.hero, 1200, 630],
        [art.thumb, 800, 600],
        [art.figure, art.figureWidth, art.figureHeight],
      ];
      for (const [file, w, h] of want) {
        if (!existsSync(pub(file))) {
          bad.push(`${slug}: ${file} is missing`);
          continue;
        }
        const m = await sharp(pub(file)).metadata();
        // Rendered at 2x and stored at the declared size, so anything else means a stale file.
        if (m.width !== w || m.height !== h) bad.push(`${slug}: ${file} is ${m.width}x${m.height}, expected ${w}x${h}`);
      }
      if (art.alt.trim().length < 40) bad.push(`${slug}: alt text is too short`);
    }
    expect(bad).toEqual([]);
  });

  it("leaves no rendered file that no guide uses", () => {
    const known = new Set(guideArtSlugs().flatMap((s) => ["hero", "thumb", "figure"].map((m) => `${s}-${m}.webp`)));
    expect(readdirSync(pub("guides/art")).filter((f) => !known.has(f))).toEqual([]);
  });

  it("has a spec for every guide, and no spec text the voice rules forbid", () => {
    const banned = /\b(nobody|honest\w*|genuine\w*|quietly|calm|unlock\w*|seamless\w*|frictionless|robust|empower\w*|supercharge|optimi[sz]e\w*|streak\w*|HIPAA)\b|[—–!]/i;
    const bad = specs.filter((s) => banned.test(JSON.stringify({ ...s, slug: "" }))).map((s) => String(s.slug));
    expect(new Set(specs.map((s) => s.slug))).toEqual(new Set(GUIDES.map((g) => g.slug)));
    expect(bad).toEqual([]);
  });

  it("places the figure after the opening paragraphs", () => {
    const g = GUIDES[0];
    const body = bodyWithFigure(g);
    const at = body.findIndex((b) => b.kind === "figure");
    expect(at).toBeGreaterThan(0);
    expect(body[at - 1].kind).toBe("paragraphs");
  });
});
