/**
 * Draftpace's own Pinterest pins, waves 2 to 5 (350 pins), redrawn in the
 * illustrated finds style and rescheduled around the five daily prayers.
 * Wave 1 is already on Pinterest and stays as it is.
 *
 * The words are the ones already written for each pin, in
 * pinterest/draftpace/source/wave*.csv: the title is the headline, the
 * description's first sentence (or its first clause, when the sentence is
 * long) the line beneath. Nothing on the pin is reworded. In the upload
 * file a title with no search words gets its board's search phrase in
 * front, the description gains one sentence of what a searcher is looking
 * for, and the Keywords are the board's search phrases (draftpace-seo.ts).
 *
 * Each pin's illustrations are chosen from its own words, the same way the
 * carousels choose theirs (director/illustration.ts), and a product pin
 * shows the product's real screen that matches its words best.
 */
import { rankMotifs, MIN_SCORE } from "../director/illustration";
import { relevance, screenAbout } from "../director/direct";
import { dossierFor } from "../director/run";
import { prayerSlots, csvTime, PER_DAY, type Slot } from "./prayer-schedule";
import { BOARD_SEARCH, TITLE_LIMIT, DESCRIPTION_LIMIT, KEYWORD_LIMIT } from "./draftpace-seo";

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

/**
 * Where the redrawn pins are hosted: a new path, never the old file names.
 * A URL that has already served the old picture keeps serving it from a
 * cache (Pinterest's or the CDN's), which is how the first redrawn upload
 * still showed the old pins. A URL that never held an old picture cannot.
 */
export const HOSTED = "store/pinterest-pins/illustrated";
export const mediaUrlOf = (file: string) => `https://draftpace.com/${HOSTED}/${file}.jpg`;

export const WAVES = ["wave2", "wave3", "wave4", "wave5"] as const;
export type Wave = (typeof WAVES)[number];

/**
 * The first day (New York) each wave is posted. Wave 2 went up from 18
 * October. Wave 3 starts on 8 November, the day it was re-planned: waves 1
 * and 2 are posted, so everything after them restarts from there. A wave
 * with no day of its own continues at the next slot after the wave before
 * it, so nothing overlaps and nothing is left in the past.
 */
export const WAVE_STARTS: Partial<Record<Wave, string>> = { wave2: "2026-10-18", wave3: "2026-11-08" };
export const START = WAVE_STARTS.wave2!;

/** Every wave's posting slots: its own start day, or straight after the last slot of the wave before. */
export function waveSlots(counts: Record<Wave, number>): Record<Wave, Slot[]> {
  const out = {} as Record<Wave, Slot[]>;
  let before: Slot | undefined;
  for (const wave of WAVES) {
    const own = WAVE_STARTS[wave];
    if (own) out[wave] = prayerSlots(own, counts[wave]);
    else {
      if (!before) throw new Error(`${wave} has no start day and no wave before it`);
      // The rest of the previous wave's last day, then the days after it.
      out[wave] = prayerSlots(before.date, PER_DAY + counts[wave]).filter((slot) => slot.at.getTime() > before!.at.getTime()).slice(0, counts[wave]);
    }
    before = out[wave].at(-1);
  }
  return out;
}

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

const GENERIC = new Set("a an the to for of and in on at your you how what why when where who which with by before after it is are be do can not if from into up out so my one this that there they them their tips ideas checklist list help".split(" "));
/** The words a search would match on: lowercased, without filler, plurals and possessives folded ("Renter's", "renters" and "renter" are one word). */
const stems = (t: string) => new Set(t.toLowerCase().replace(/'s\b/g, "").split(/[^a-z0-9]+/).filter((w) => w && !GENERIC.has(w)).map((w) => (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w)));

/** A row as Pinterest search will find it: the original words kept, the board's search phrase put first where the title has none of its own. */
export function searchable(row: SourceRow, leadsUsed: Map<string, Map<string, number>>): Pick<SourceRow, "Title" | "Description" | "Keywords"> {
  const board = row["Pinterest board"];
  const seo = BOARD_SEARCH[board];
  if (!seo) throw new Error(`no search phrases for the board "${board}" (pinterest/draftpace-seo.ts)`);
  const vocab = stems([...seo.leads, ...(seo.fits ?? []), ...seo.terms].join(" "));
  const own = [...stems(row.Title)].filter((w) => vocab.has(w));
  const flat = (t: string) => ` ${t.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `;
  const named = [...seo.leads, ...(seo.fits ?? []), ...seo.terms].some((t) => flat(row.Title).includes(flat(t)));
  let Title = row.Title;
  // A search phrase already in the title ("Medication List: What to Write Down"), or two of the board's search words ("Budget Tool for Irregular Income"), is a searchable title; leave it alone.
  if (!named && own.length < 2) {
    const words = stems(`${row.Title} ${row.Description}`);
    const used = leadsUsed.get(board) ?? new Map<string, number>();
    // A narrower lead that fits says more than a general one that fits as well.
    const narrow = new Set(seo.fits ?? []);
    const fit = (l: string) => [...stems(l)].filter((w) => words.has(w)).length + (narrow.has(l) ? 0.5 : 0);
    // The lead that shares most words with the pin; among equals the least used, so a board's pins do not all open alike.
    const lead = [...seo.leads, ...(seo.fits ?? []).filter((l) => fit(l) > 0.5)]
      .filter((l) => `${l}: ${row.Title}`.length <= TITLE_LIMIT)
      .sort((a, b) => fit(b) - fit(a) || (used.get(a) ?? 0) - (used.get(b) ?? 0))[0];
    if (lead) {
      Title = `${lead}: ${row.Title}`;
      used.set(lead, (used.get(lead) ?? 0) + 1);
      leadsUsed.set(board, used);
    }
  }
  const more = `${row.Description} ${seo.line}`;
  return { Title, Description: more.length <= DESCRIPTION_LIMIT ? more : row.Description, Keywords: seo.terms.slice(0, KEYWORD_LIMIT).join(", ") };
}

/** The four waves' CSVs: the Media URL at the redrawn pin, each wave's Publish dates on the prayer schedule from the wave's own start (WAVE_STARTS) in the order its pins were already queued, and the words made searchable. */
export function rescheduledCsvs(sources: Record<Wave, string>): Record<Wave, string> {
  const planned = planDraftpacePins(sources);
  const order = [...planned].sort((a, b) => a.row["Publish date"].localeCompare(b.row["Publish date"]));
  const inWave = (wave: Wave) => order.filter((p) => p.pin.wave === wave);
  const slots = waveSlots(Object.fromEntries(WAVES.map((w) => [w, inWave(w).length])) as Record<Wave, number>);
  const when = new Map(WAVES.flatMap((w) => inWave(w).map((p, i) => [p.pin.file, csvTime(slots[w][i].at)] as const)));
  const leadsUsed = new Map<string, Map<string, number>>();
  const found = new Map(order.map((p) => [p.pin.file, searchable(p.row, leadsUsed)]));
  const field = (v: string) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const header = ["Title", "Media URL", "Pinterest board", "Description", "Link", "Publish date", "Keywords"] as const;
  return Object.fromEntries(WAVES.map((wave) => {
    const rows = inWave(wave);
    const lines = [header.join(","), ...rows.map(({ row, pin }) => {
      const out: SourceRow = { ...row, ...found.get(pin.file)!, "Media URL": mediaUrlOf(pin.file), "Publish date": when.get(pin.file)! };
      return header.map((h) => field(out[h])).join(",");
    })];
    return [wave, lines.join("\r\n") + "\r\n"];
  })) as Record<Wave, string>;
}
