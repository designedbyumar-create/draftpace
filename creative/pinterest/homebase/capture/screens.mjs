#!/usr/bin/env node
/**
 * Home Base pin screens: the REAL product components, mounted with fixture
 * stubs (see harness/ and lib/screen-harness.mjs), screenshotted at 390 css
 * px wide, device scale 2 (780 px), light theme, no dev badge, no header or
 * tab bar (the screen only, as in the pfc and homeschool captures).
 *
 *   SetupModule (components/SetupModule.tsx), the "Here's what those usually need." step,
 *   reached the way a person reaches it (tap the things, tap Continue):
 *       renting-care-list.png   a renter: Lease + Renters insurance (the whole "Renting" area setup offers)
 *       area-care-list.png      an owner: Furnace + Central air conditioning + Thermostat (Heating, cooling and air),
 *                               one row unticked, as a person would
 *   ImportModule (components/ImportModule.tsx -> import/PasteNotesStep.tsx -> import/CandidateReviewQueue.tsx):
 *       paste-in-import.png     paste notes, "Find records", the review step
 *   ReportProblemSheet (components/problems/ReportProblemSheet.tsx):
 *       problem-sentence.png    a sentence typed, and what Home Base works out from it
 *
 * Everything on a screen is computed by the real code (homeKnowledge.ts, homeVoice.ts, extractFromText.ts,
 * problemSentence.ts); the only typed things are what a person would type or tap. The clock is fixed
 * at lib/screen-harness.mjs NOW (Monday 26 Oct 2026).
 *
 *   node creative/pinterest/homebase/capture/screens.mjs [only...]
 */
import fs from "node:fs";
import path from "node:path";
import { bundleEntry, openPage, fontsReady, shootBand, OUT } from "./lib/screen-harness.mjs";

fs.mkdirSync(OUT, { recursive: true });
const only = process.argv.slice(2);
const want = (name) => only.length === 0 || only.some((o) => name.includes(o));

async function run(entry, opts, fn) {
  const html = await bundleEntry(entry, opts);
  const { browser, page, problems } = await openPage(html);
  try {
    await fn(page);
  } finally {
    await browser.close();
    if (problems.length) console.log(`browser problems (${entry}):`, problems);
  }
}
const sizeOf = (file) => { const b = fs.readFileSync(file); return `${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`; };
async function save(page, name, from, opts) {
  await fontsReady(page);
  const file = path.join(OUT, name);
  await shootBand(page, from, file, opts);
  console.log("wrote", file, sizeOf(file));
}

/** Setup: a tenure, the things tapped, then the consolidated care list. `unticks` are care row titles a person unticks. */
async function careList(file, tenure, things, unticks) {
  await run("setup-entry", { tenure }, async (page) => {
    await page.getByRole("heading", { name: "What's in your home?" }).waitFor();
    for (const label of things) await page.getByRole("button", { name: label, exact: true }).click();
    await page.getByRole("button", { name: `Continue with ${things.length}` }).click();
    await page.getByRole("heading", { name: "Here's what those usually need." }).waitFor();
    for (const title of unticks) await page.getByRole("checkbox", { name: new RegExp(`^${title}`) }).uncheck();
    await page.waitForTimeout(200);
    console.log(`--- ${file} ---\n` + (await page.locator("main").innerText()));
    const checks = await page.getByRole("checkbox").evaluateAll((els) => els.map((e) => e.checked));
    console.log("ticked:", JSON.stringify(checks));
    await save(page, file, page.locator("main h1"), { to: page.getByRole("button", { name: "Back" }), pad: 24 });
  });
}

if (want("renting-care-list")) await careList("renting-care-list.png", "rent", ["Lease", "Renters insurance"], []);
if (want("area-care-list")) await careList("area-care-list.png", "own", ["Furnace", "Central air conditioning", "Thermostat"], ["Clear the condensate drain line"]);

// ---- Import: paste notes -> review --------------------------------------------------------------------------------
const NOTES = `Fridge freezer purchased 2023-03-14, warranty until 2025-03-14
Test the smoke alarms every 6 months
Boiler service every 12 months
Priya's Plumbing - 555-0142
The tap in the kitchen is dripping`;
if (want("paste-in-import")) {
  await run("import-entry", {}, async (page) => {
    await page.getByRole("button", { name: /Paste notes/ }).click();
    await page.locator("textarea").fill(NOTES);
    await page.getByRole("button", { name: "Find records" }).click();
    await page.getByText(/review/i).first().waitFor();
    await page.waitForTimeout(300);
    console.log("--- Import review ---\n" + (await page.locator("main").innerText()));
    await save(page, "paste-in-import.png", page.locator("main > div").first(), { pad: 24 });
  });
}

// ---- Problem sentence sheet ------------------------------------------------------------------------------------------------
if (want("problem-sentence")) {
  await run("problem-entry", {}, async (page) => {
    const dialog = page.getByRole("dialog");
    await dialog.waitFor();
    await dialog.getByLabel("In your own words").fill("The fridge is making a grinding noise");
    await page.waitForTimeout(300);
    console.log("--- Problem sheet ---\n" + (await dialog.innerText()));
    await fontsReady(page);
    const file = path.join(OUT, "problem-sentence.png");
    const panel = dialog.locator(":scope > div");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(100);
    const box = await panel.boundingBox();
    await page.screenshot({ path: file, clip: { x: 0, y: box.y, width: 390, height: box.height } });
    console.log("wrote", file, sizeOf(file));
  });
}
