#!/usr/bin/env node
/**
 * ADHD Life Companion (Alongside) pin screens: the REAL product components, mounted with fixture stubs
 * (see harness/ and lib/screen-harness.mjs), screenshotted at 390 css px wide, device scale 2 (780 px),
 * light theme, no dev badge, no header or tab bar (the screen only, as in the pfc and homebase captures).
 * The clock is fixed at lib/screen-harness.mjs NOW (Monday 26 Oct 2026, 10:00).
 *
 *   NowModule (components/NowModule.tsx -> NowView.tsx):
 *       now-first-run.png   a new account (nothing recorded)
 *       now-quiet.png       one undated reference kept, so attention has nothing to say
 *       now-one-card.png    one open "Ring the dentist", dated three days ahead
 *   CompanionRun (components/CompanionRun.tsx + the shared product-shell/companion/CompanionRun.tsx) with the real
 *   playbooks, reached the way a person reaches them (Help me with something -> the situation -> answer each step):
 *       opening-line.png, how-did-it-go.png          Make a phone call
 *       first-physical-step.png                      Break something down
 *       billing-worth-having.png                     Sort out a billing problem
 *       difficult-call-opening.png                   Make a difficult phone call
 *   SettingsModule (components/SettingsModule.tsx -> SettingsView.tsx):
 *       reminders.png       reminders on, "Say what it is about" off, default quiet hours
 *
 * Every word on a screen is computed by the real code; the only typed things are what a person would type or tap.
 *
 *   node creative/pinterest/adhd/capture/screens.mjs [only...]
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
  await page.waitForTimeout(150);
  const file = path.join(OUT, name);
  console.log(`--- ${name} ---\n` + (await page.locator("main").innerText()));
  await shootBand(page, from, file, opts);
  console.log("wrote", file, sizeOf(file));
}
const btn = (page, name) => page.getByRole("button", { name, exact: true });

// ---- Now -------------------------------------------------------------------------------------------------------------
async function now(file, scenario) {
  await run("now-entry", { scenario }, async (page) => {
    await page.locator("#alongside-tour-now").waitFor();
    await save(page, file, page.locator("#alongside-tour-now"), { pad: 8 });
  });
}
if (want("now-first-run")) await now("now-first-run.png", "empty");
if (want("now-quiet")) await now("now-quiet.png", "quiet");
if (want("now-one-card")) await now("now-one-card.png", "one-card");

// ---- Walkthroughs: Now (empty account) -> Help me with something -> the situation -> the steps -----------------------
async function startHelp(page, situation, title) {
  await page.locator("#alongside-tour-now").waitFor();
  await btn(page, "Help me with something").click();
  await page.getByRole("heading", { name: "What do you need to do?" }).waitFor();
  if (title) await page.getByPlaceholder("Call the landlord about the leak").fill(title);
  await page.getByRole("button", { name: situation }).click();
}
const answer = async (page, prompt, text) => {
  await page.getByRole("heading", { name: prompt }).waitFor();
  await page.getByLabel(prompt).fill(text);
  await btn(page, "Next").click();
};
const choose = async (page, prompt, label) => {
  await page.getByRole("heading", { name: prompt }).waitFor();
  await btn(page, label).click();
};
const step = (page, prompt) => page.getByRole("heading", { name: prompt }).waitFor();
/** The whole step screen: from the playbook eyebrow to the end of the step card. */
const shootRun = (page, file) => save(page, file, page.locator("main > div").first(), { pad: 24 });

async function phoneCallToOpening(page) {
  await startHelp(page, "There is a call to make and it has been sitting there", "Cancel the gym membership");
  await choose(page, "What is the call about?", "Cancelling something");
  await answer(page, "Who are you calling?", "The gym");
  await answer(page, "What would a good result look like?", "Membership ended from the end of the month");
  await step(page, "Worth having in front of you");
  await btn(page, "I have these").click();
  await step(page, "Is there anything you must not forget to say?");
  await page.getByLabel("Is there anything you must not forget to say?").fill("Ask for it in writing");
  await btn(page, "Next").click();
  await step(page, "Your opening");
}

if (want("opening-line")) {
  await run("now-entry", { scenario: "empty" }, async (page) => {
    await phoneCallToOpening(page);
    await page.getByText("Hi, I would like to cancel.").waitFor();
    await page.getByText("Change any of this, or write your own.").waitFor();
    await shootRun(page, "opening-line.png");
  });
}

if (want("how-did-it-go")) {
  await run("now-entry", { scenario: "empty" }, async (page) => {
    await phoneCallToOpening(page);
    await btn(page, "Next").click();
    await step(page, "Ready to call?");
    await btn(page, "Call now").click(); // the real five-second countdown, then "Go"
    await step(page, "While you are on the call");
    await btn(page, "Ready").click();
    await step(page, "How did it go?");
    for (const label of ["It is sorted", "Made progress", "Waiting on someone now", "There is something I need to do", "Did not get to it", "Something else"]) {
      await btn(page, label).waitFor();
    }
    await shootRun(page, "how-did-it-go.png");
  });
}

if (want("first-physical-step")) {
  await run("now-entry", { scenario: "empty" }, async (page) => {
    await startHelp(page, "The whole thing is too big to start", null);
    await answer(page, "What is the thing?", "Clear out the spare room");
    await answer(page, "What would be true when it is finished?", "The bed is usable and the boxes are gone");
    await step(page, "What is the first physical step?");
    await page.getByPlaceholder("Ring the charity shop about collection").waitFor(); // the real, empty placeholder
    await shootRun(page, "first-physical-step.png");
  });
}

if (want("billing-worth-having")) {
  await run("now-entry", { scenario: "empty" }, async (page) => {
    await startHelp(page, "Something has been charged wrongly and it needs sorting", "Broadband charged twice");
    await choose(page, "What has happened?", "Charged twice for the same thing");
    await answer(page, "Who is the charge from?", "The broadband company");
    await choose(page, "Have you contacted them about it already?", "Not yet");
    await answer(page, "What would sort it?", "The second charge refunded");
    await step(page, "Worth having in front of you");
    await shootRun(page, "billing-worth-having.png");
  });
}

if (want("difficult-call-opening")) {
  await run("now-entry", { scenario: "empty" }, async (page) => {
    await startHelp(page, "There is a call to make and it is not a straightforward one", "Tell Sam I cannot do the weekend");
    await choose(page, "What makes this one hard?", "Saying no to something");
    await answer(page, "Who are you calling?", "Sam");
    await answer(page, "What do you want to be true when you put the phone down?", "Sam knows I cannot come this weekend");
    await step(page, "Is there anything you are not willing to agree to?");
    await btn(page, "Nothing to add").click();
    await step(page, "Worth having ready");
    await btn(page, "I have these").click();
    await step(page, "Your opening");
    await shootRun(page, "difficult-call-opening.png");
  });
}

// ---- Settings > Reminders -----------------------------------------------------------------------------------------------
if (want("reminders")) {
  await run("settings-entry", {}, async (page) => {
    await page.getByRole("heading", { name: "Reminders" }).waitFor();
    await page.getByText("Quiet hours").waitFor();
    const toggles = await page.getByRole("switch").evaluateAll((els) => els.map((e) => `${e.getAttribute("aria-label") ?? e.textContent}=${e.getAttribute("aria-checked")}`));
    console.log("toggles:", JSON.stringify(toggles));
    await save(page, "reminders.png", page.locator("main > div").first(), { pad: 24 });
  });
}
