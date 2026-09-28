import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Every place a guide is listed off its own page used to be bare text:
 * no thumbnail, no visual identity, a guide reading as a line borrowed
 * from a category rather than a thing on its own. GuideCard fixed that
 * everywhere at once. This guards against a future edit quietly
 * reverting one of those call sites back to a hand-rolled text row.
 */
const read = (path: string) => readFileSync(join(process.cwd(), path), "utf-8");

describe("guide listings render a real thumbnail, not bare text", () => {
  it("GuideCard exists and never reaches into the content layer itself", () => {
    const source = read("src/components/public/guides/GuideCard.tsx");
    expect(source).not.toMatch(/from "@\/content\/guideArt"/);
    expect(source).toMatch(/next\/image/);
  });

  it.each([
    ["src/app/(marketing)/guides/page.tsx", /guideArt/],
    ["src/components/public/guides/GuidesExplorer.tsx", /GuideCard/],
    ["src/components/public/guides/GuideLinks.tsx", /from "@\/content\/guideArt"/],
    ["src/components/public/guides/GuideLinks.tsx", /GuideCard/],
  ])("%s references %s", (file, pattern) => {
    expect(read(file)).toMatch(pattern);
  });

  it("GuideCard keeps its title-only homepage variant", () => {
    expect(read("src/components/public/guides/GuideCard.tsx")).toMatch(/"minimal"/);
  });
});

describe("the FAQ block stays a native accordion", () => {
  it("Faq.tsx ships no client JavaScript and opens its first question by default", () => {
    const source = read("src/components/public/guides/blocks/Faq.tsx");
    expect(source).not.toMatch(/^"use client"/m);
    expect(source).toMatch(/<details/);
    expect(source).toMatch(/open=\{i === 0\}/);
  });
});
