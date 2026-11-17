/**
 * Guards for Draftpace Studio's own logic: what it drafts for a platform,
 * who it lets in, what it calls connected, and what it emails. Each holds
 * Studio to the same rule as the engine: real words, real destinations.
 */
import { describe, expect, it } from "vitest";
import { runSlate, runVoiceovers } from "@engine/director/run";
import { plain, guideBySlug, productForGuide } from "@engine/director/guide";
import { SHOP_LISTINGS } from "@engine/src/shop-listings";
import { GUIDES } from "@/content/guides";
import { blockStrings } from "@/content/guideText";
import { publishCopy, trackedLink, destination, platformMeta, onScreenWords } from "~/lib/publish";
import { accessMode, keyHash, sameString } from "~/lib/access";
import { channelStatus } from "~/lib/channels";
import { guideEmail } from "~/lib/email";

const films = [...runSlate().map((x) => x.film), ...runVoiceovers().map((x) => x.film)];

describe("Publishing drafts", () => {
  it("send every film to a page that exists, tagged with its platform and the film", () => {
    for (const f of films) {
      const url = new URL(trackedLink(f, f.platform));
      expect(url.searchParams.get("utm_source"), `${f.id}: utm_source`).toBe(platformMeta(f.platform).source);
      expect(url.searchParams.get("utm_campaign"), `${f.id}: utm_campaign`).toBe(f.id);
      const path = url.pathname;
      if (f.guide) expect(path, `${f.id} links to ${path}, not its guide`).toBe(`/guides/${f.guide}`);
      else if (f.product === "monthly-money-reset") expect(path).toBe("/free");
      else expect(path, `${f.id} links to ${path}`).toBe(`/shop/${f.product}`);
      const slug = path.split("/").pop()!;
      if (path.startsWith("/guides/")) expect(GUIDES.some((g) => g.slug === slug), `${f.id}: no guide ${slug}`).toBe(true);
      if (path.startsWith("/shop/")) expect(SHOP_LISTINGS, `${f.id}: no product ${slug}`).toHaveProperty(slug);
    }
  });

  it("say only what the film says: every caption line is its hook, its words, the guide's summary or the link line", () => {
    for (const f of films) {
      const guideDek = f.guide ? guideBySlug(f.guide).dek : undefined;
      const productName = SHOP_LISTINGS[f.product].title;
      const copy = publishCopy(f, { productName, guideDek });
      const allowed = new Set([f.angle.text, ...onScreenWords(f), ...(guideDek ? [guideDek] : []), productName]);
      const [, ...rest] = copy.caption.split("\n\n").reverse();
      for (const line of rest) expect(allowed.has(line.replace(/…$/, "")) || [...allowed].some((a) => a.startsWith(line.replace(/…$/, ""))), `${f.id}: "${line}" is not the film's own words`).toBe(true);
      const linkLine = copy.caption.split("\n\n").at(-1)!;
      expect(linkLine.endsWith(platformMeta(f.platform).links ? copy.link : "link in bio"), `${f.id}: last line is not the link`).toBe(true);
      expect(copy.caption.length, `${f.id}: caption too long for ${copy.platform}`).toBeLessThanOrEqual(platformMeta(f.platform).captionMax);
      if (copy.title) expect(copy.title.length).toBeLessThanOrEqual(platformMeta(f.platform).titleMax!);
    }
  });

  it("send a guide film to its guide and a product film to its product", () => {
    expect(destination({ guide: "travel-document-checklist", product: "travel-companion" })).toBe("https://draftpace.com/guides/travel-document-checklist");
    expect(destination({ product: "travel-companion" })).toBe("https://draftpace.com/shop/travel-companion");
    expect(destination({ product: "monthly-money-reset" })).toBe("https://draftpace.com/free");
  });
});

describe("Access", () => {
  it("is open only in local development, locked by a key, and closed in production without one", () => {
    expect(accessMode({ NODE_ENV: "development" })).toBe("open");
    expect(accessMode({ NODE_ENV: "production" })).toBe("closed");
    expect(accessMode({ NODE_ENV: "production", STUDIO_ACCESS_KEY: "k" })).toBe("locked");
    expect(accessMode({ NODE_ENV: "development", STUDIO_ACCESS_KEY: "k" })).toBe("locked");
  });

  it("stores a hash of the key, never the key, and compares it whole", async () => {
    const a = await keyHash("correct horse"), b = await keyHash("correct horse"), c = await keyHash("correct hors");
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).not.toContain("correct");
    expect(sameString(a, b)).toBe(true);
    expect(sameString(a, c)).toBe(false);
    expect(sameString(a, a.slice(0, -1))).toBe(false);
  });
});

describe("Channels", () => {
  it("count as connected only when every credential they need is set, and never for the by-hand ones", () => {
    const none = channelStatus({});
    expect(none.filter((c) => c.connected)).toEqual([]);
    const pinterestOnly = channelStatus({ PINTEREST_ACCESS_TOKEN: "x" });
    expect(pinterestOnly.filter((c) => c.connected).map((c) => c.id)).toEqual(["pinterest"]);
    const halfYoutube = channelStatus({ YOUTUBE_CLIENT_ID: "x" });
    expect(halfYoutube.find((c) => c.id === "youtube")!.connected, "YouTube connected with one of three credentials").toBe(false);
    const all = channelStatus(Object.fromEntries(channelStatus({}).flatMap((c) => c.env).map((k) => [k, "x"])));
    for (const c of all) expect(c.connected, c.id).toBe(c.kind === "api");
  });
});

describe("Email drafts", () => {
  it("are the guide's own words, linking to the guide and its own product, tagged as email", () => {
    for (const g of GUIDES.filter((x) => x.areaSlug && x.areaSlug !== "series")) {
      const d = guideEmail(g.slug);
      expect(d.subject).toBe(plain(g.title));
      expect(d.preheader).toBe(plain(g.dek));
      const body = plainBody(g.slug);
      for (const s of d.steps) {
        expect(body.includes(s.text), `${g.slug}: "${s.text}" is not in the guide`).toBe(true);
        if (s.when) expect(body.includes(s.when), `${g.slug}: marker "${s.when}" is not in the guide`).toBe(true);
      }
      expect(new URL(d.cta.url).pathname).toBe(`/guides/${g.slug}`);
      expect(new URL(d.cta.url).searchParams.get("utm_source")).toBe("email");
      const product = productForGuide(g.slug).product;
      expect(new URL(d.product.url).pathname).toBe(product === "monthly-money-reset" ? "/free" : `/shop/${product}`);
      expect(d.html).toContain(d.cta.url.replace(/&/g, "&amp;"));
    }
  });
});

/** Every string in a guide's body, each stripped to its words as the engine strips it. */
function plainBody(slug: string): string {
  return guideBySlug(slug).body.flatMap(blockStrings).map(plain).join("\n");
}
