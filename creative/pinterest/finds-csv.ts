/**
 * The Maple & Main Finds pins as a Pinterest bulk-upload CSV, in the
 * columns Pinterest's Bulk create takes: Title, Media URL, Pinterest
 * board, Description, Link, Publish date, Keywords. Names and prices come
 * from the Shop listings; every link is tagged so a visit says which pin
 * sent it.
 */
import { FINDS_PINS, type FindsPin } from "./maple-main-finds";
import { findsPinId } from "./finds-ids";
import { productLine } from "../src/shop-listings";

export const SITE = "https://draftpace.com";
/** Where the rendered pins are served once the site is deployed. */
export const MEDIA_DIR = "store/pinterest-maple-main/finds";

/** The first day of the schedule and the times pins go out each day (UTC): six a day, spread across US mornings and evenings. */
export const SCHEDULE_START = "2026-10-12";
export const DAILY_SLOTS = ["13:00", "15:30", "18:00", "20:30", "23:00", "01:30"];

export const fill = (text: string, product: string) => {
  const { name, price } = productLine(product);
  return text.replace(/\{name\}/g, name).replace(/\{price\}/g, price);
};

export const fileName = (pins: FindsPin[], i: number) => `${findsPinId(pins, i).replace(/^Pin-mm-/, "")}.jpg`;

export function linkFor(pin: FindsPin, content: string): string {
  const path = pin.product === "monthly-money-reset" ? "/free" : `/shop/${pin.product}`;
  const u = new URL(path, SITE);
  u.searchParams.set("utm_source", "pinterest");
  u.searchParams.set("utm_medium", "organic_social");
  u.searchParams.set("utm_campaign", "maple_main");
  u.searchParams.set("utm_content", content);
  return u.toString();
}

/** Pins interleaved across products (every product's first pin, then every product's second...), so no product runs twice in a row. */
export function postingOrder(pins: FindsPin[] = FINDS_PINS): number[] {
  const products = [...new Set(pins.map((p) => p.product))];
  const queues = products.map((pr) => pins.map((p, i) => (p.product === pr ? i : -1)).filter((i) => i >= 0));
  const order: number[] = [];
  for (let round = 0; order.length < pins.length; round++) for (const q of queues) if (q[round] !== undefined) order.push(q[round]);
  return order;
}

/** The publish time of the n-th pin to go out: six a day from SCHEDULE_START; the last slot falls after midnight UTC. */
export function publishAt(n: number): string {
  const day = Math.floor(n / DAILY_SLOTS.length), slot = DAILY_SLOTS[n % DAILY_SLOTS.length];
  const d = new Date(`${SCHEDULE_START}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + day + (slot < "12:00" ? 1 : 0));
  return `${d.toISOString().slice(0, 10)}T${slot}:00`;
}

const field = (v: string) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

export type CsvRow = { title: string; media: string; board: string; description: string; link: string; publish: string; keywords: string };

export function findsRows(pins: FindsPin[] = FINDS_PINS): CsvRow[] {
  return postingOrder(pins).map((i, n) => {
    const pin = pins[i];
    const file = fileName(pins, i);
    return {
      title: pin.title,
      media: `${SITE}/${MEDIA_DIR}/${file}`,
      board: pin.board,
      description: fill(pin.description, pin.product),
      link: linkFor(pin, file.replace(/\.jpg$/, "")),
      publish: publishAt(n),
      keywords: pin.keywords.join(", "),
    };
  });
}

export function findsCsv(pins: FindsPin[] = FINDS_PINS): string {
  const header = "Title,Media URL,Pinterest board,Description,Link,Publish date,Keywords";
  return [header, ...findsRows(pins).map((r) => [r.title, r.media, r.board, r.description, r.link, r.publish, r.keywords].map(field).join(","))].join("\n") + "\n";
}
