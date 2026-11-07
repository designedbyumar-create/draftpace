#!/usr/bin/env node
/**
 * Pin idea #79: the REAL child-page section "What appears on anything you
 * print".
 *
 * Mounts the real <ChildDetailModule/> (src/products/homeschooling-companion/
 * components/ChildDetailModule.tsx) with its Supabase layer stubbed
 * (harness/stubs, nothing in src/ changed), inside the product's own theme
 * variables (real productThemeStyle + real globals.css), and screenshots the
 * section: heading, paragraph and the three switches, full 390 px width with
 * a little ground above and below. The switch positions are the product's own
 * defaults for a child (name on, age off, notes off).
 *
 * Output: creative/out/homeschool/assets/screen-print-section.png
 * (390 css px wide, device scale 3 = 1170 px, light theme, no dev badge).
 *
 *   node creative/pinterest/homeschool/capture/screen-print-section.mjs
 */
import path from "node:path";
import { bundleEntry, openPage, fontsReady, OUT } from "./lib/screen-harness.mjs";

const html = await bundleEntry("print-section-entry");
const { browser, page, problems } = await openPage(html);
try {
  const section = page.locator('section[aria-label="What appears on anything you print"]');
  await section.waitFor();
  await fontsReady(page);
  console.log(await section.innerText());
  console.log("switches:", await section.getByRole("switch").evaluateAll((els) => els.map((e) => `${e.getAttribute("aria-label")} = ${e.getAttribute("aria-checked")}`)));
  const box = await section.boundingBox();
  const pad = 20;
  const out = path.join(OUT, "screen-print-section.png");
  await page.screenshot({ path: out, fullPage: true, clip: { x: 0, y: Math.max(0, box.y - pad), width: 390, height: box.height + 2 * pad } });
  console.log("wrote", out);
} finally {
  await browser.close();
  if (problems.length) console.log("browser problems:", problems);
}
