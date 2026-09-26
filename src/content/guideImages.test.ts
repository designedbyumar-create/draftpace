import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { bodyWithImage, guideImage, guideImageSlugs } from "./guideImages";
import { GUIDES } from "./guides";

const dir = join(process.cwd(), "public/guides/img");

describe("guide images", () => {
  it("point at real guides and real files, with the dimensions they declare", async () => {
    const bad: string[] = [];
    for (const slug of guideImageSlugs()) {
      const image = guideImage(slug)!;
      if (!GUIDES.some((g) => g.slug === slug)) bad.push(`${slug}: no such guide`);
      for (const file of [image.src, image.cover]) if (!existsSync(join(process.cwd(), "public", file))) bad.push(`${slug}: ${file} is missing`);
      if (existsSync(join(process.cwd(), "public", image.src))) {
        const m = await sharp(join(process.cwd(), "public", image.src)).metadata();
        if (m.width !== image.width || m.height !== image.height) bad.push(`${slug}: declares ${image.width}x${image.height}, file is ${m.width}x${m.height}`);
      }
      if (image.alt.trim().length < 15) bad.push(`${slug}: alt text is too short`);
    }
    expect(bad).toEqual([]);
  });

  it("leave no file in public/guides/img that the manifest does not know", () => {
    const known = new Set(guideImageSlugs().flatMap((s) => [`${s}.webp`, `${s}-cover.webp`]));
    expect(readdirSync(dir).filter((f) => !known.has(f))).toEqual([]);
  });

  it("place the card after the opening paragraphs, and never on a guide without one", () => {
    const withImage = GUIDES.find((g) => guideImage(g.slug))!;
    const body = bodyWithImage(withImage);
    const at = body.findIndex((b) => b.kind === "figure");
    expect(at).toBeGreaterThan(0);
    expect(body[at - 1].kind).toBe("paragraphs");
    const without = GUIDES.find((g) => !guideImage(g.slug))!;
    expect(bodyWithImage(without)).toBe(without.body);
  });
});
