#!/usr/bin/env node
/**
 * Personal Finance Companion pin screens: the REAL product components, mounted
 * with fixture stubs (see harness/ and lib/screen-harness.mjs), screenshotted
 * at 390 css px wide, device scale 2 (780 px), light theme, no dev badge, no
 * header or tab bar (the screen only, as in the homeschool captures).
 *
 *   WorkspaceModule     (components/WorkspaceModule.tsx -> TodayView.tsx):
 *       available-money.png            the Hero banner (#pfc-tour-available-money)
 *       available-money-working.png    "How these figures are worked out" opened, Available Money's
 *                                      "How Draftpace got this" expanded (ExplainBreakdown.tsx)
 *       coming-up.png                  the "Coming up / Next 14 days" list
 *       available-money-alt.png / available-money-working-alt.png   same, with the Everyday balance after pay day
 *   AttentionModule     attention.png          (fixture variant "gaps")
 *   SubscriptionsModule subscriptions.png
 *   SavingsModule       emergency-fund.png
 *
 * The figures on every screen are computed by the real code (capability.ts,
 * comingUp.ts, attention.ts, subscriptionLogic.ts, savingsLogic.ts) from
 * harness/fixtures.ts; nothing on a screen is typed here. The clock is fixed
 * at lib/screen-harness.mjs NOW (Monday 26 Oct 2026).
 *
 *   node creative/pinterest/pfc/capture/screens.mjs [only...]
 */
import fs from "node:fs";
import path from "node:path";
import { bundleEntry, openPage, fontsReady, shootBand, OUT } from "./lib/screen-harness.mjs";

fs.mkdirSync(OUT, { recursive: true });
const only = process.argv.slice(2);
const want = (name) => only.length === 0 || only.some((o) => name.includes(o));
const log = [];

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

// ---- Today (WorkspaceModule): available money, how it is worked out, coming up --------------------------------
for (const balance of ["household", "alt"]) {
  const suffix = balance === "alt" ? "-alt" : "";
  if (!(want("available-money") || want("coming-up")) || (balance === "alt" && !want("available-money"))) continue;
  await run("today-entry", { variant: "base", balance }, async (page) => {
    const hero = page.locator("#pfc-tour-available-money");
    await hero.waitFor();
    await page.getByRole("heading", { name: "Coming up" }).waitFor();
    console.log(`--- Today (${balance}) ---\n` + (await page.locator("main").innerText()));
    if (want("available-money")) await save(page, `available-money${suffix}.png`, hero, { pad: 16 });
    if (balance === "household" && want("coming-up")) {
      await save(page, "coming-up.png", page.locator("section", { has: page.getByRole("heading", { name: "Coming up" }) }), { pad: 16 });
    }
    if (want("available-money")) {
      const details = page.locator("details");
      await details.locator("summary").click();
      const row = details.locator(":scope > div > div").first();
      await row.getByRole("button", { name: "How Draftpace got this" }).click();
      console.log("--- working ---\n" + (await details.innerText()).split("\n").slice(0, 16).join("\n"));
      await save(page, `available-money-working${suffix}.png`, details, { to: row, pad: 16, bottom: Math.round((await row.boundingBox()).y + (await row.boundingBox()).height) });
    }
  });
}

// ---- Attention (variant "gaps": a bill with no due date, a stale balance) ----------------------------------------
if (want("attention")) {
  await run("attention-entry", { variant: "gaps" }, async (page) => {
    await page.getByRole("heading", { name: "Attention" }).waitFor();
    await page.waitForTimeout(200);
    console.log("--- Attention ---\n" + (await page.locator("main").innerText()));
    await save(page, "attention.png", page.locator("main > div").first(), { pad: 24 });
  });
}

// ---- Subscriptions ----------------------------------------------------------------------------------------------------
if (want("subscriptions")) {
  await run("subscriptions-entry", { variant: "base" }, async (page) => {
    await page.getByRole("heading", { name: "Subscriptions" }).waitFor();
    await page.waitForTimeout(200);
    console.log("--- Subscriptions ---\n" + (await page.locator("main").innerText()));
    await save(page, "subscriptions.png", page.locator("main li").last(), { pad: 24, top: 0 });
  });
}

// ---- Savings: the Emergency fund goal -------------------------------------------------------------------------------
if (want("emergency-fund")) {
  await run("savings-entry", { variant: "base" }, async (page) => {
    await page.getByRole("heading", { name: "Savings" }).waitFor();
    await page.waitForTimeout(200);
    console.log("--- Savings ---\n" + (await page.locator("main").innerText()));
    await save(page, "emergency-fund.png", page.locator("main li").last(), { pad: 24, top: 0 });
  });
}
