/**
 * Guards for Draftpace's own pins, waves 2 to 5: the words on every pin are
 * the ones already written for it, the rescheduled CSVs change nothing but
 * the Publish date, every date sits on the prayer schedule in the order the
 * pins were queued, wave 1 (already on Pinterest) is never redrawn, and
 * every redrawn image exists under its original name.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { planDraftpacePins, rescheduledCsvs, parseCsv, WAVES, START, FOLDER_PRODUCT } from "../pinterest/draftpace-pins";
import { prayerSlots, csvTime } from "../pinterest/prayer-schedule";
import { MOTIFS } from "../src/visual/illustrations";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIR = path.join(ROOT, "pinterest/draftpace");
const read = (f: string) => fs.readFileSync(path.join(DIR, f), "utf8");
const sources = Object.fromEntries(WAVES.map((w) => [w, read(`source/${w}.csv`)])) as Record<(typeof WAVES)[number], string>;
const planned = planDraftpacePins(sources);

describe("Draftpace pins, waves 2 to 5", () => {
  it("are the 350 not yet on Pinterest, each once, and never one of wave 1's", () => {
    expect(planned.length).toBe(350);
    const files = planned.map((p) => p.pin.file);
    expect(new Set(files).size, "a pin is planned twice").toBe(350);
    const wave1 = new Set(parseCsv(read("source/wave1.csv")).map((r) => r["Media URL"]));
    for (const { row } of planned) expect(wave1.has(row["Media URL"]), `${row.Title} is a wave 1 pin, already on Pinterest`).toBe(false);
  });

  it("carry the words already written for them: the title as the headline, the description's own opening as the line beneath", () => {
    for (const { pin, row } of planned) {
      expect(pin.head).toBe(row.Title);
      if (pin.sub) {
        const opening = pin.sub.replace(/\.$/, "");
        expect(row.Description.startsWith(opening), `${row.Title}: "${pin.sub}" is not how its description opens`).toBe(true);
        expect(pin.sub.length).toBeLessThanOrEqual(110);
      }
      expect(pin.product).toBe(FOLDER_PRODUCT[pin.file.split("/")[0]]);
      expect(pin.cta, `${row.Title}: guide pins say the guide is free, product pins show the price`).toBe(row.Link.includes("/guides/") ? "guide" : "price");
    }
  });

  it("draw illustrations that exist and only the product's own screen", () => {
    for (const { pin } of planned) {
      for (const m of pin.scene) expect(MOTIFS, `${pin.file}: no drawing "${m}"`).toContain(m);
      if (pin.screen) expect(pin.screen.startsWith(`screens/${pin.product}-`), `${pin.file} shows ${pin.screen}`).toBe(true);
    }
  });

  it("change nothing in the upload files but the Publish date, which follows the prayer schedule in the order the pins were queued", () => {
    const csvs = rescheduledCsvs(sources);
    for (const w of WAVES) expect(read(`${w}.csv`), `pinterest/draftpace/${w}.csv is stale: run node scripts/draftpace-pins.mjs`).toBe(csvs[w]);
    const before = new Map(planned.map(({ row }) => [row["Media URL"], row]));
    const after = WAVES.flatMap((w) => parseCsv(csvs[w]));
    expect(after.length).toBe(350);
    for (const r of after) {
      const was = before.get(r["Media URL"])!;
      for (const col of ["Title", "Pinterest board", "Description", "Link", "Keywords"] as const) expect(r[col], `${r.Title}: ${col} changed`).toBe(was[col]);
    }
    const queued = [...planned].sort((a, b) => a.row["Publish date"].localeCompare(b.row["Publish date"])).map((p) => p.row["Media URL"]);
    const slots = prayerSlots(START, 350).map((s) => csvTime(s.at));
    const at = new Map(after.map((r) => [r["Media URL"], r["Publish date"]]));
    queued.forEach((url, i) => expect(at.get(url), `${url} is not at its place in the schedule`).toBe(slots[i]));
  });

  it("are redrawn and on disk under their original names", () => {
    for (const { pin } of planned) {
      const file = path.join(ROOT, "..", "public/store/pinterest-pins", `${pin.file}.jpg`);
      expect(fs.existsSync(file), `${file} is missing`).toBe(true);
    }
    const committed = JSON.parse(read("pins.generated.json"));
    expect(committed, "pins.generated.json is stale: run node scripts/draftpace-pins.mjs").toEqual(planned.map((p) => p.pin));
  });
});
