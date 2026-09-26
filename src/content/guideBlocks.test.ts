import { describe, expect, it } from "vitest";
import { GUIDES, relatedPicks, topicOverlap, type Guide, type GuideBlock } from "./guides";
import { FAQ_HEADING, blockHeading, guideHeadings } from "./guideHeadings";
import { blockBodyStrings, blockStrings } from "./guideText";

/**
 * The new content kinds (FAQ, figure, sources) and the curated links
 * (related, next). No guide uses them yet, so most of what follows is a
 * standing rule waiting for content: it costs nothing today and is the
 * thing that stops the first hundred figures and FAQs arriving wrong.
 */

const words = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
const today = new Date().toISOString().slice(0, 10);

describe("faq blocks", () => {
  const faq: GuideBlock = {
    kind: "faq",
    items: [
      { q: "Can a shop charge more than the estimate?", a: "It depends on your state. Ask for the estimate in writing first, see [the guide](/guides/x) too." },
    ],
  };

  it("counts every question and answer as text the voice rules must read", () => {
    const text = blockStrings(faq).join(" ");
    expect(text).toContain("Can a shop charge more than the estimate?");
    expect(text).toContain("Ask for the estimate in writing first");
  });

  it("lets an answer carry a link, but not a question", () => {
    expect(blockBodyStrings(faq).join(" ")).toContain("[the guide]");
    expect(blockBodyStrings(faq).join(" ")).not.toContain("Can a shop");
  });

  it("gives the section a heading even when the author set none, so the contents can link to it", () => {
    expect(blockHeading(faq)).toBe(FAQ_HEADING);
    expect(guideHeadings([faq]).map((h) => h.text)).toEqual([FAQ_HEADING]);
  });

  it("holds every real FAQ to three to six questions, with answers of 25 to 110 words", () => {
    const bad: string[] = [];
    for (const g of GUIDES) {
      for (const block of g.body) {
        if (block.kind !== "faq") continue;
        if (block.items.length < 3 || block.items.length > 6) bad.push(`${g.slug}: ${block.items.length} questions`);
        for (const item of block.items) {
          const n = words(item.a);
          if (n < 25 || n > 110) bad.push(`${g.slug}: "${item.q}" answers in ${n} words`);
          if (!item.q.trim().endsWith("?")) bad.push(`${g.slug}: "${item.q}" is not a question`);
        }
      }
    }
    expect(bad).toEqual([]);
  });
});

describe("figure blocks", () => {
  const figure: GuideBlock = { kind: "figure", src: "/guides/img/a.webp", alt: "A checklist", caption: "Sample screen.", width: 960, height: 640, source: "card" };

  it("counts the alt text and caption as text the voice rules must read, and hides nothing behind a heading", () => {
    expect(blockStrings(figure)).toEqual(["A checklist", "Sample screen."]);
    expect(blockHeading(figure)).toBeUndefined();
  });

  it("holds every real figure to the rules that keep them honest and fast", () => {
    const bad: string[] = [];
    for (const g of GUIDES) {
      const figures = g.body.filter((b): b is Extract<GuideBlock, { kind: "figure" }> => b.kind === "figure");
      if (figures.length > 4) bad.push(`${g.slug}: ${figures.length} figures, at most 4`);
      const firstQuarter = Math.ceil(g.body.length / 4);
      figures.forEach((f) => {
        const at = g.body.indexOf(f);
        if (!f.src.startsWith("/guides/img/")) bad.push(`${g.slug}: ${f.src} is outside /guides/img/`);
        if (f.width < 300 || f.height < 200) bad.push(`${g.slug}: ${f.src} has no real size`);
        if (f.alt.length < 20 || f.alt.length > 160 || /^(image|picture|screenshot) of/i.test(f.alt)) bad.push(`${g.slug}: alt text "${f.alt}"`);
        if (f.source === "product-screen") {
          if (!/sample/i.test(`${f.caption ?? ""} ${f.alt}`)) bad.push(`${g.slug}: a product screen that does not say it is a sample`);
          if (at < firstQuarter) bad.push(`${g.slug}: a product screen in the first quarter, before the help`);
        }
      });
    }
    expect(bad).toEqual([]);
  });
});

describe("sources", () => {
  it("names a real https source with the day somebody checked it", () => {
    const bad: string[] = [];
    for (const g of GUIDES) {
      for (const s of g.sources ?? []) {
        if (!s.url.startsWith("https://")) bad.push(`${g.slug}: ${s.url} is not https`);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(s.retrieved) || s.retrieved > today) bad.push(`${g.slug}: retrieved "${s.retrieved}"`);
        if (s.name.trim().length < 3) bad.push(`${g.slug}: a source with no name`);
      }
      if ((g.sources ?? []).length > 8) bad.push(`${g.slug}: more than 8 sources`);
      const urls = (g.sources ?? []).map((s) => s.url);
      if (new Set(urls).size !== urls.length) bad.push(`${g.slug}: repeats a source`);
    }
    expect(bad).toEqual([]);
  });
});

describe("curated related and next links", () => {
  it("points only at real guides in the same area, never at itself, with a reason", () => {
    const bad: string[] = [];
    for (const g of GUIDES) {
      const links = [...(g.related ?? []), ...(g.next ? [g.next] : [])];
      const slugs = links.map((l) => l.slug);
      if (new Set(slugs).size !== slugs.length) bad.push(`${g.slug}: links to the same guide twice`);
      for (const link of links) {
        const target = GUIDES.find((other) => other.slug === link.slug);
        if (!target) bad.push(`${g.slug}: ${link.slug} does not exist`);
        else if (target.slug === g.slug) bad.push(`${g.slug}: links to itself`);
        else if (target.areaSlug !== g.areaSlug) bad.push(`${g.slug}: ${link.slug} is in another area`);
        if (words(link.reason) < 5 || words(link.reason) > 30) bad.push(`${g.slug}: reason for ${link.slug} is ${words(link.reason)} words`);
      }
      if ((g.related ?? []).length > 4) bad.push(`${g.slug}: more than 4 related links`);
    }
    expect(bad).toEqual([]);
  });

  it("gives every guide a next step, and no two guides the same reason line", () => {
    const missing = GUIDES.filter((g) => !g.next || (g.related ?? []).length < 3).map((g) => g.slug);
    const reasons = GUIDES.flatMap((g) => [...(g.related ?? []), ...(g.next ? [g.next] : [])].map((l) => l.reason));
    const dupes = reasons.filter((r, i) => reasons.indexOf(r) !== i);
    // The two Series guides have nothing else in their area to point at.
    expect(missing.filter((s) => GUIDES.find((g) => g.slug === s)?.areaSlug !== "series")).toEqual([]);
    expect(dupes).toEqual([]);
  });

  it("leaves no guide with fewer than two hand-picked links pointing at it", () => {
    const inbound = new Map<string, number>(GUIDES.map((g) => [g.slug, 0]));
    for (const g of GUIDES) {
      for (const l of [...(g.related ?? []), ...(g.next ? [g.next] : [])]) inbound.set(l.slug, (inbound.get(l.slug) ?? 0) + 1);
    }
    const thin = [...inbound].filter(([slug, n]) => n < 2 && GUIDES.find((g) => g.slug === slug)?.areaSlug !== "series").map(([slug, n]) => `${slug}: ${n}`);
    expect(thin).toEqual([]);
  });
});

describe("relatedPicks", () => {
  const make = (slug: string, title: string, dek: string, extra: Partial<Guide> = {}): Guide => ({
    slug,
    title,
    dek,
    publishedAt: "2026-01-01",
    areaSlug: "money",
    body: [],
    ...extra,
  });

  it("puts curated picks first, with the reason a person wrote", () => {
    const money = GUIDES.filter((g) => g.areaSlug === "money");
    const [a, b, c] = money;
    const guide = { ...a, related: [{ slug: c.slug, reason: "Read this once the bill is paid, to stop it coming back." }] };
    const picks = relatedPicks(guide);
    expect(picks[0].guide.slug).toBe(c.slug);
    expect(picks[0].reason).toBe("Read this once the bill is paid, to stop it coming back.");
    expect(picks.map((p) => p.guide.slug)).not.toContain(a.slug);
    expect(b).toBeDefined();
  });

  it("never returns an unrelated guide just to fill the list", () => {
    for (const g of GUIDES) {
      const picks = relatedPicks(g);
      for (const p of picks) {
        const curated = (g.related ?? []).some((r) => r.slug === p.guide.slug);
        expect(curated || topicOverlap(g, p.guide) >= 0.09, `${g.slug} -> ${p.guide.slug}`).toBe(true);
        expect(p.guide.areaSlug).toBe(g.areaSlug);
      }
      expect(picks.length).toBeLessThanOrEqual(3);
    }
  });

  it("measures overlap on topic words, not filler", () => {
    const a = make("a", "How to cancel a subscription", "Stop a recurring charge before it renews.");
    const b = make("b", "How to cancel subscriptions you forgot", "Find the recurring charge and stop it.");
    const c = make("c", "How to plan a trip", "Where to stay and what to pack.");
    expect(topicOverlap(a, b)).toBeGreaterThan(topicOverlap(a, c));
    expect(topicOverlap(a, c)).toBeLessThan(0.09);
  });
});
