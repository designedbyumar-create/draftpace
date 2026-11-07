#!/usr/bin/env node
/**
 * Pin idea #75: the REAL "What came back" result screen of a check.
 *
 * Mounts the real <CheckModule/> (src/products/homeschooling-companion/
 * components/CheckModule.tsx) in headless Chromium with its Supabase layer
 * stubbed (harness/stubs, nothing in src/ changed), inside the product's own
 * theme variables (real productThemeStyle + real globals.css). It then DRIVES
 * the real UI the way a parent would: tick two topics, Next, Start the check,
 * and mark each question from harness/fixtures.ts MARKS. The standings on the
 * result screen are therefore computed by the real check.ts deriveResult();
 * none is typed here.
 *
 * Output: creative/out/homeschool/assets/screen-check-result.png
 * (390 css px wide, device scale 3 = 1170 px, light theme, no dev badge, no shell chrome).
 *
 *   node creative/pinterest/homeschool/capture/screen-check-result.mjs
 */
import path from "node:path";
import { bundleEntry, openPage, fontsReady, OUT } from "./lib/screen-harness.mjs";

const html = await bundleEntry("check-result-entry");
const { browser, page, problems } = await openPage(html);
try {
  await page.getByRole("heading", { name: "What would you like to check?" }).waitFor();
  await page.getByRole("button", { name: /Understanding fractions/ }).click();
  await page.getByRole("button", { name: /Equivalent fractions/ }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Start the check" }).click();

  // Mark every question the way the fixture says; the topic is read off the screen's own "Question n of N · Topic".
  const MARKS = { "Understanding fractions": ["Right", "Right", "Right", "Right"], "Equivalent fractions": ["Right", "Right"] };
  const used = {};
  for (;;) {
    const line = page.getByText(/^Question \d+ of \d+ · /);
    if (!(await line.isVisible().catch(() => false))) break;
    const topic = (await line.textContent()).split(" · ")[1];
    const i = (used[topic] = (used[topic] ?? -1) + 1);
    await page.getByRole("button", { name: MARKS[topic][i], exact: true }).click();
    await page.waitForTimeout(60);
  }
  await page.getByText("What came back", { exact: true }).waitFor();
  await fontsReady(page);
  const text = await page.locator("main").innerText();
  const out = path.join(OUT, "screen-check-result.png");
  const box = await page.locator("main").boundingBox();
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 390, height: Math.ceil(box.y + box.height) }, fullPage: true });
  console.log(text);
  console.log("wrote", out);
} finally {
  await browser.close();
  if (problems.length) console.log("browser problems:", problems);
}
