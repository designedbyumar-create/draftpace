/**
 * Draftpace's own Pinterest pins, waves 2 to 5 (350 pins), redrawn in the
 * illustrated finds style and rescheduled around the five daily prayers.
 * Wave 1 is already on Pinterest and stays as it is.
 *
 * The words are the ones already written for each pin, in
 * pinterest/draftpace/source/wave*.csv: the title is the headline, the
 * description's first sentence (or its first clause, when the sentence is
 * long) the line beneath. Nothing is reworded. The image keeps its file
 * name, so each CSV row's Media URL still points at its pin; only the
 * picture and the Publish date change.
 *
 * Each pin's illustrations are chosen from its own words, the same way the
 * carousels choose theirs (director/illustration.ts), and a product pin
 * shows the product's real screen that matches its words best.
 */
import { rankMotifs, MIN_SCORE } from "../director/illustration";
import { relevance, screenAbout } from "../director/direct";
import { dossierFor } from "../director/run";
import { prayerSlots, csvTime } from "./prayer-schedule";

/** The CSV folder names the earlier pin builder used, and the product each one is. */
export const FOLDER_PRODUCT: Record<string, string> = {
  adhd: "alongside",
  health: "family-health-binder",
  homebase: "home-management-companion",
  homeschool: "homeschooling-companion",
  mmr: "monthly-money-reset",
  pfc: "personal-finance-companion",
  ple: "personal-life-affairs-companion",
  travel: "travel-companion",
  vehicle: "vehicle-maintenance-companion",
};

export const WAVES = ["wave2", "wave3", "wave4", "wave5"] as const;
/** The first day (New York) of the new schedule: the day after wave 1's last pin. */
export const START = "2026-10-17";

export type SourceRow = { Title: string; "Media URL": string; "Pinterest board": string; Description: string; Link: string; "Publish date": string; Keywords: string };

export type DraftpacePin = {
  wave: (typeof WAVES)[number];
  /** "adhd/pin-2.3": the hosted file, without .jpg. */
  file: string;
  product: string;
  layout: "scene" | "hero" | "split";
  tag: string;
  head: string;
  sub?: string;
  scene: string[];
  screen?: string;
  /** A guide pin says the guide is free; a product pin shows the real price. */
  cta: "guide" | "price";
  /** Why the illustrations and screen were chosen. */
  why: string;
};

/** A CSV parser for the quoted, comma-separated files Pinterest's bulk upload takes. */
export function parseCsv(text: string): SourceRow[] {
  const rows: string[][] = [];
  let row: string[] = [], field = "", quoted = false;
  const t = text.replace(/^﻿/, "");
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (quoted) {
      if (c === '"' && t[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [header, ...body] = rows.filter((r) => r.some((f) => f !== ""));
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])) as SourceRow);
}

const SUB_MAX = 110;

/** The line under the headline: the description's first sentence, or its first clause when the sentence is too long to read on a pin. */
export function subFrom(description: string): string | undefined {
  const first = description.trim().split(/(?<=[.!?])\s+/)[0];
  if (first.length <= SUB_MAX) return first;
  const clause = first.slice(0, SUB_MAX).match(/^(.*[,;:])\s/);
  return clause && clause[1].length >= 40 ? clause[1].replace(/[,;:]$/, ".") : undefined;
}

const PRODUCT_ART: Record<string, string[]> = {
  alongside: ["mind", "steps", "notebook"],
  "family-health-binder": ["health", "pills", "doctor"],
  "home-management-companion": ["house", "toolbox", "calendar"],
  "homeschooling-companion": ["books", "notebook", "calendar"],
  "monthly-money-reset": ["wallet", "calendar", "shield"],
  "personal-finance-companion": ["chart", "receipt", "wallet"],
  "personal-life-affairs-companion": ["binder", "document", "people"],
  "travel-companion": ["plane", "suitcase", "route"],
  "vehicle-maintenance-companion": ["car", "wrench", "calendar"],
};

const GUIDE_TAGS = ["Free guide", "Save this", "Bookmark this", "Worth knowing"];
const PRODUCT_TAGS = ["Found it", "This is your sign", "Small fix, big relief", "Worth it"];

/** Every pin of waves 2 to 5, planned from its own row. */
export function planDraftpacePins(sources: Record<(typeof WAVES)[number], string>): { pin: DraftpacePin; row: SourceRow }[] {
  const out: { pin: DraftpacePin; row: SourceRow }[] = [];
  const seen = new Map<string, number>();
  for (const wave of WAVES) {
    for (const row of parseCsv(sources[wave])) {
      const m = row["Media URL"].match(/pinterest-pins\/([a-z]+)\/(pin-[\d.]+)\.jpg$/);
      if (!m) throw new Error(`${wave}: no pin file in ${row["Media URL"]}`);
      const product = FOLDER_PRODUCT[m[1]];
      const n = (seen.get(product) ?? 0) + 1;
      seen.set(product, n);
      const isGuide = row.Link.includes("/guides/");
      const text = `${row.Title} ${row.Title} ${row.Description}`;
      const named = rankMotifs(text).filter((r) => r.score >= MIN_SCORE).map((r) => r.motif);
      const scene = [...new Set([...named, ...PRODUCT_ART[product]])].slice(0, 3);
      // A product pin alternates its real screen (split) with an illustrated scene; guide pins alternate two illustrated layouts.
      const layout: DraftpacePin["layout"] = isGuide ? (n % 2 ? "scene" : "hero") : n % 2 ? "split" : "scene";
      let screen: string | undefined, screenWhy = "";
      if (layout === "split") {
        const d = dossierFor(product);
        const rel = relevance(d);
        const best = [...d.screens].sort((a, b) => rel(text, screenAbout(b)) - rel(text, screenAbout(a)))[0];
        screen = best.src;
        screenWhy = `; screen ${best.src} ("${best.heading}") matches its words best`;
      }
      const tags = isGuide ? GUIDE_TAGS : PRODUCT_TAGS;
      out.push({
        row,
        pin: {
          wave, file: `${m[1]}/${m[2]}`, product, layout, tag: tags[n % tags.length], head: row.Title, sub: subFrom(row.Description), scene, ...(screen ? { screen } : {}),
          cta: isGuide ? "guide" : "price",
          why: `${named.length ? `illustrations named by its words: ${named.slice(0, 3).join(", ")}` : "its words name nothing drawable; the product's own pictures"}${screenWhy}`,
        },
      });
    }
  }
  return out;
}

/** The four waves' CSVs, word for word, with only the Publish date moved to the prayer schedule, in the order the pins were already queued. */
export function rescheduledCsvs(sources: Record<(typeof WAVES)[number], string>, start = START): Record<(typeof WAVES)[number], string> {
  const planned = planDraftpacePins(sources);
  const order = [...planned].sort((a, b) => a.row["Publish date"].localeCompare(b.row["Publish date"]));
  const slots = prayerSlots(start, order.length);
  const when = new Map(order.map((p, i) => [p.pin.file, csvTime(slots[i].at)]));
  const field = (v: string) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const header = ["Title", "Media URL", "Pinterest board", "Description", "Link", "Publish date", "Keywords"] as const;
  return Object.fromEntries(WAVES.map((wave) => {
    const rows = planned.filter((p) => p.pin.wave === wave).sort((a, b) => when.get(a.pin.file)!.localeCompare(when.get(b.pin.file)!));
    const lines = [header.join(","), ...rows.map(({ row, pin }) => header.map((h) => field(h === "Publish date" ? when.get(pin.file)! : row[h])).join(","))];
    return [wave, lines.join("\r\n") + "\r\n"];
  })) as Record<(typeof WAVES)[number], string>;
}
