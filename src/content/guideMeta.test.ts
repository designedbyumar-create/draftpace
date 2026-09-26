import { describe, expect, it } from "vitest";
import { GUIDES } from "./guides";
import {
  META_DESCRIPTION_MAX,
  META_DESCRIPTION_MIN,
  META_TITLE_MAX,
  META_TITLE_MIN,
  TITLE_SUFFIX,
  guideMetaDescription,
  guideMetaTitle,
  guideOgLocale,
  guideSeoTitle,
} from "./guideMeta";

/**
 * These exist because the search result is the first thing a guide is
 * judged on, and it was wrong in ordinary, invisible ways: 89 of 137
 * titles were cut off once the site suffix was added, 24 descriptions
 * ran past what a result shows, and two locale twins shared one
 * description. None of that fails a build or a type check.
 */

type WithSeo = { seoTitle?: string; metaDescription?: string; primaryQuery?: string };
const seo = (g: (typeof GUIDES)[number]) => g as (typeof GUIDES)[number] & WithSeo;

describe("guide search titles", () => {
  it("keeps every search title between 30 and 60 characters", () => {
    const bad = GUIDES.map((g) => ({ slug: g.slug, title: guideSeoTitle(seo(g)) })).filter(
      ({ title }) => title.length < META_TITLE_MIN || title.length > META_TITLE_MAX,
    );
    expect(bad, `titles outside 30 to 60 characters: ${JSON.stringify(bad.map((b) => `${b.slug} (${b.title.length})`))}`).toEqual([]);
  });

  it("gives every guide a different title", () => {
    const seen = new Map<string, string>();
    const dupes: string[] = [];
    for (const g of GUIDES) {
      const key = guideSeoTitle(seo(g)).toLowerCase();
      const other = seen.get(key);
      if (other) dupes.push(`${g.slug} = ${other}`);
      else seen.set(key, g.slug);
    }
    expect(dupes).toEqual([]);
  });

  it("puts the country in the title of every guide that has a locale", () => {
    const missing = GUIDES.filter((g) => g.locale && !guideSeoTitle(seo(g)).endsWith(`(${g.locale.toUpperCase()})`)).map((g) => g.slug);
    expect(missing).toEqual([]);
  });
});

describe("guide search descriptions", () => {
  it("keeps every description between 110 and 155 characters", () => {
    const bad = GUIDES.map((g) => ({ slug: g.slug, text: seo(g).metaDescription ?? g.dek })).filter(
      ({ text }) => text.length < META_DESCRIPTION_MIN || text.length > META_DESCRIPTION_MAX,
    );
    expect(bad, JSON.stringify(bad.map((b) => `${b.slug} (${b.text.length})`))).toEqual([]);
  });

  it("gives every guide a different description", () => {
    const seen = new Map<string, string>();
    const dupes: string[] = [];
    for (const g of GUIDES) {
      const key = (seo(g).metaDescription ?? g.dek).toLowerCase();
      const other = seen.get(key);
      if (other) dupes.push(`${g.slug} = ${other}`);
      else seen.set(key, g.slug);
    }
    expect(dupes).toEqual([]);
  });
});

describe("guide primary queries", () => {
  it("gives every guide its own lowercase query of two to twelve words", () => {
    const seen = new Map<string, string>();
    const problems: string[] = [];
    for (const g of GUIDES) {
      const q = seo(g).primaryQuery;
      if (!q) {
        problems.push(`${g.slug}: missing`);
        continue;
      }
      const words = q.trim().split(/\s+/).length;
      if (q !== q.toLowerCase() || words < 2 || words > 12) problems.push(`${g.slug}: "${q}" is not 2 to 12 lowercase words`);
      const other = seen.get(q);
      if (other) problems.push(`${g.slug}: same query as ${other}`);
      else seen.set(q, g.slug);
    }
    expect(problems).toEqual([]);
  });
});

describe("meta helpers", () => {
  const base = { title: "How to make a phone call you have been avoiding", dek: "x".repeat(130) };

  it("adds the site suffix only when the whole title still fits", () => {
    expect(guideMetaTitle({ ...base, title: "Short title for a guide about bills" })).toBe(`Short title for a guide about bills${TITLE_SUFFIX}`);
    const long = "A title that is exactly fifty seven characters long ok";
    expect(long.length + TITLE_SUFFIX.length).toBeGreaterThan(META_TITLE_MAX - 1);
    expect(guideMetaTitle({ ...base, title: "y".repeat(55) })).toBe("y".repeat(55));
  });

  it("prefers seoTitle and metaDescription when a guide sets them", () => {
    const g = { ...base, seoTitle: "A shorter search title for this guide", metaDescription: "z".repeat(120) };
    expect(guideSeoTitle(g)).toBe("A shorter search title for this guide");
    expect(guideMetaDescription(g)).toBe("z".repeat(120));
  });

  it("cuts a long description at a word, never mid-word", () => {
    const words = Array.from({ length: 60 }, (_, i) => `word${i}`).join(" ");
    const out = guideMetaDescription({ title: "t", dek: words });
    expect(out.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX + 1);
    expect(out.endsWith(".")).toBe(true);
    expect(words.startsWith(out.slice(0, -1))).toBe(true);
    expect(/word\d+$/.test(out.slice(0, -1))).toBe(true);
  });

  it("marks the UK twins en_GB and everything else en_US", () => {
    expect(guideOgLocale("uk")).toBe("en_GB");
    expect(guideOgLocale("us")).toBe("en_US");
    expect(guideOgLocale(undefined)).toBe("en_US");
  });
});
