/**
 * Guards for the Maple & Main Finds pins: ten per product, in the house
 * voice, with no price typed by hand, real screens, drawings that exist,
 * a schedule that never posts one product twice in a row, and a committed
 * CSV and image set that match what the pins say now.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { FINDS_PINS } from "../pinterest/maple-main-finds";
import { findsCsv, findsRows, fileName, MEDIA_DIR, SITE, SCHEDULE_START } from "../pinterest/finds-csv";
import { SHOP_LISTINGS } from "../src/shop-listings";
import { MOTIFS } from "../src/visual/illustrations";

const ROOT = path.resolve(import.meta.dirname, "..");
/** The voice rules the site's own copy follows (src/content/guideArt.test.ts), plus no em or en dashes and no exclamation marks. */
const BANNED = /\b(nobody|honest\w*|genuine\w*|quietly|calm|unlock\w*|seamless\w*|frictionless|robust|empower\w*|supercharge|optimi[sz]e\w*|streak\w*|HIPAA)\b|[—–!]/i;
const copyOf = (p: (typeof FINDS_PINS)[number]) => [p.tag, p.head, p.sub, p.title, p.description, p.board, ...p.keywords, ...(p.points ?? []).map((x) => x.text)];

describe("Maple & Main Finds pins", () => {
  it("are ten for every product, two in each layout", () => {
    for (const product of Object.keys(SHOP_LISTINGS)) {
      const mine = FINDS_PINS.filter((p) => p.product === product);
      expect(mine.length, product).toBe(10);
      for (const layout of ["scene", "split", "list", "pov", "board"]) expect(mine.filter((p) => p.layout === layout).length, `${product} ${layout}`).toBe(2);
    }
  });

  it("follow the house voice, and never type a price: it comes from the listing", () => {
    for (const p of FINDS_PINS) {
      for (const text of copyOf(p)) {
        expect(BANNED.test(text), `${p.product}: "${text}"`).toBe(false);
        expect(/\$\d/.test(text), `${p.product}: a price typed by hand in "${text}"`).toBe(false);
      }
      expect(p.description, `${p.title}: no price`).toContain("{price}");
      expect(p.description, `${p.title}: does not say who makes it`).toContain("Made by Draftpace");
    }
  });

  it("read on a phone and fit Pinterest's limits", () => {
    for (const p of FINDS_PINS) {
      expect(p.title.length, p.title).toBeGreaterThanOrEqual(40);
      expect(p.title.length, p.title).toBeLessThanOrEqual(100);
      expect(p.head.length, p.head).toBeLessThanOrEqual(90);
      expect(p.sub.length, p.sub).toBeLessThanOrEqual(110);
      if (p.layout === "list") expect(p.points?.length, p.head).toBeGreaterThanOrEqual(3);
      if (p.layout === "list") expect(p.points!.length, p.head).toBeLessThanOrEqual(4);
      if (p.layout === "board") expect(p.points?.length, p.head).toBeGreaterThanOrEqual(3);
      if (p.layout === "board") expect(p.points!.length, p.head).toBeLessThanOrEqual(6);
      expect(p.keywords.length, p.title).toBeGreaterThanOrEqual(3);
    }
    for (const r of findsRows()) expect(r.description.length, r.title).toBeLessThanOrEqual(500);
  });

  it("never repeat a title or a headline", () => {
    const titles = FINDS_PINS.map((p) => p.title.toLowerCase()), heads = FINDS_PINS.map((p) => p.head.toLowerCase());
    expect(titles.filter((t, i) => titles.indexOf(t) !== i)).toEqual([]);
    expect(heads.filter((t, i) => heads.indexOf(t) !== i)).toEqual([]);
  });

  it("draw only illustrations that exist, and show only the product's own real screen", () => {
    for (const p of FINDS_PINS) {
      for (const m of [...p.scene, ...(p.points ?? []).map((x) => x.motif)]) expect(MOTIFS, `${p.head}: no drawing "${m}"`).toContain(m);
      if (p.layout === "split") {
        expect(p.screen, `${p.head}: a split pin shows the product`).toBeDefined();
        expect(p.screen!.startsWith(`screens/${p.product}-`), `${p.head} shows ${p.screen}`).toBe(true);
        expect(fs.existsSync(path.join(ROOT, "public", p.screen!)), `${p.screen} is not on disk`).toBe(true);
      }
    }
  });

  it("link each pin to its own product page, tagged with the pin, and post one product at a time from the schedule's start", () => {
    const rows = findsRows();
    let last = "";
    rows.forEach((r, n) => {
      const u = new URL(r.link);
      const product = u.pathname === "/free" ? "monthly-money-reset" : u.pathname.replace("/shop/", "");
      expect(SHOP_LISTINGS, `${r.title} links to ${u.pathname}`).toHaveProperty(product);
      expect(u.searchParams.get("utm_campaign")).toBe("maple_main");
      expect(r.media.endsWith(`/${u.searchParams.get("utm_content")}.jpg`), `${r.title}: link and image are different pins`).toBe(true);
      expect(product, `${r.title} posts right after another ${product} pin`).not.toBe(last);
      last = product;
      expect(r.publish >= `${SCHEDULE_START}T00:00:00`).toBe(true);
      if (n) expect(r.publish > rows[n - 1].publish, `${r.title} is not after the pin before it`).toBe(true);
    });
  });

  it("are the CSV and images committed: re-run `npm run pins:maple` after changing a pin, a price or the design", () => {
    expect(fs.readFileSync(path.join(ROOT, "pinterest/maple-main-finds.csv"), "utf8"), "pinterest/maple-main-finds.csv is stale").toBe(findsCsv());
    FINDS_PINS.forEach((_, i) => {
      const file = path.join(ROOT, "..", "public", MEDIA_DIR, fileName(FINDS_PINS, i));
      expect(fs.existsSync(file), `${file} is missing`).toBe(true);
    });
    for (const r of findsRows()) expect(r.media.startsWith(`${SITE}/${MEDIA_DIR}/`)).toBe(true);
  });
});
