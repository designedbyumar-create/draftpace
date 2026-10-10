#!/usr/bin/env node
/**
 * End-to-end check of the review → schedule → render flow through the real
 * UI (Studio running on :3100): approves a film, schedules it, renders it
 * with the Render button and waits for the mastered file.
 *   node studio/scripts/flow.mjs <film-id> [YYYY-MM-DD]
 */
import { chromium } from "@playwright/test";
import fs from "node:fs";

const BASE = process.env.STUDIO_URL ?? "http://localhost:3100";
const [id, date = new Date(Date.now() + 2 * 864e5).toISOString().slice(0, 10)] = process.argv.slice(2);
const exe = ["/opt/pw-browsers/chromium-1194/chrome-linux/chrome"].find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const step = (m) => console.log(`[${new Date().toISOString().slice(11, 19)}] ${m}`);

await page.goto(`${BASE}/library/${id}`, { waitUntil: "networkidle", timeout: 240_000 });
step("opened film page");
await page.getByLabel("Note (optional)").fill("Good to go: the cut lands on the voice.");
await page.getByRole("button", { name: "Approve" }).click();
await page.getByText("Approved", { exact: true }).first().waitFor({ timeout: 20_000 });
step("approved");

await page.getByRole("button", { name: "Schedule", exact: true }).click();
await page.getByLabel("Day").fill(date);
await page.getByRole("button", { name: "Add to calendar" }).click();
await page.getByText(`${date} 09:00`).waitFor({ timeout: 20_000 });
step(`scheduled for ${date}`);

const render = page.getByRole("button", { name: /^Render( again)?$/ });
await render.click();
step("render started");
const t0 = Date.now();
for (;;) {
  const r = await page.evaluate(async (film) => (await fetch(`/api/jobs?film=${film}`)).json(), id);
  if (r.latest?.status === "done") { step(`rendered: ${r.rendered.bytes} bytes in ${Math.round((Date.now() - t0) / 1000)}s`); break; }
  if (r.latest?.status === "failed") { step(`FAILED: ${r.latest.message}`); process.exitCode = 1; break; }
  if (Date.now() - t0 > 15 * 60_000) { step("timed out"); process.exitCode = 1; break; }
  await page.waitForTimeout(5000);
}
await page.screenshot({ path: "studio/.data/screens/flow-done.png" });
await browser.close();
