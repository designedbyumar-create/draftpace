#!/usr/bin/env node
/**
 * Prints and saves the Draftpace pin posting slots around the five daily
 * prayers (pinterest/prayer-schedule.ts): 17 a day, in New York time and
 * in the UTC the Pinterest CSV takes.
 *
 *   node scripts/prayer-schedule.mjs 2026-11-24 350    start date (New York), number of pins
 *
 * Writes pinterest/draftpace-prayer-slots.csv.
 */
import { createServer } from "vite";
import fs from "node:fs";
import path from "node:path";

const [start = "2026-11-24", count = "350"] = process.argv.slice(2);
const CREATIVE = path.resolve(import.meta.dirname, "..");
const vite = await createServer({ configFile: false, logLevel: "error", appType: "custom", root: CREATIVE, server: { middlewareMode: true }, optimizeDeps: { noDiscovery: true } });
const S = await vite.ssrLoadModule(path.join(CREATIVE, "pinterest/prayer-schedule.ts"));
await vite.close();

const slots = S.prayerSlots(start, Number(count));
const names = { fajr: "Fajr", dhuhr: "Zuhr", asr: "Asr", maghrib: "Maghrib", isha: "Isha" };
const rows = ["Pin,Day,Prayer,Prayer time (New York),Pin time (New York),Publish date (UTC, for the CSV)"];
slots.forEach((s, i) => {
  const prayerAt = S.prayerTimes(s.date)[s.prayer];
  rows.push([i + 1, s.date, names[s.prayer], S.local(prayerAt).slice(11), S.local(s.at), S.csvTime(s.at)].join(","));
});
fs.writeFileSync(path.join(CREATIVE, "pinterest/draftpace-prayer-slots.csv"), rows.join("\n") + "\n");
const days = [...new Set(slots.map((s) => s.date))];
console.log(`${slots.length} pins, ${S.PER_DAY} a day, ${days[0]} to ${days.at(-1)} (${days.length} days), ${S.LOCATION.name}, ${S.METHOD.name}`);
process.exit(0);
