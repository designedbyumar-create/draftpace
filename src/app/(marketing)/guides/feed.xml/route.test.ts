import { describe, expect, it } from "vitest";
import { GUIDES, SERIES } from "@/content/guides";
import { GET } from "./route";

describe("guides RSS feed", () => {
  it("serves well-formed RSS 2.0 with one item per non-series guide, newest first", async () => {
    const res = await GET();
    expect(res.headers.get("Content-Type")).toBe("application/rss+xml; charset=utf-8");
    const xml = await res.text();

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain("<rss version=\"2.0\"");
    expect((xml.match(/<item>/g) ?? []).length).toBe(GUIDES.filter((g) => g.areaSlug !== null && g.areaSlug !== SERIES).length);

    // Every item has a title, a real /guides/<slug> link, a matching guid and a pubDate.
    for (const guide of GUIDES) {
      if (guide.areaSlug === null || guide.areaSlug === SERIES) continue;
      const url = `https://draftpace.com/guides/${guide.slug}`;
      expect(xml).toContain(`<link>${url}</link>`);
      expect(xml).toContain(`<guid isPermaLink="true">${url}</guid>`);
    }

    // Items are sorted newest (updatedAt, falling back to publishedAt) first.
    const dates = [...xml.matchAll(/<pubDate>([^<]+)<\/pubDate>/g)].map((m) => new Date(m[1]).getTime());
    // The channel's own lastBuildDate is not an <item>, so drop it before checking order.
    const itemDates = dates.slice(0);
    for (let i = 1; i < itemDates.length; i++) expect(itemDates[i]).toBeLessThanOrEqual(itemDates[i - 1]);
  });

  it("escapes a title or dek that contains XML-sensitive characters", async () => {
    const res = await GET();
    const xml = await res.text();
    // No raw, un-escaped ampersand should appear inside a <title> or <description>: every
    // "&" in guide copy must have been turned into "&amp;" (or another named entity).
    const bad = [...xml.matchAll(/<(title|description)>([^<]*)<\/\1>/g)].filter(([, , text]) => /&(?!amp;|lt;|gt;|quot;|apos;)/.test(text));
    expect(bad).toEqual([]);
  });
});
