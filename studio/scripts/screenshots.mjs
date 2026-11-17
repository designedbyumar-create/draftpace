#!/usr/bin/env node
/**
 * Screenshots of Studio pages, for reviewing a change by eye:
 *   node studio/scripts/screenshots.mjs [path ...]   (Studio must be running on :3100)
 * Writes studio/.data/screens/<name>.png. Uses the Chromium Playwright installed.
 */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.STUDIO_URL ?? "http://localhost:3100";
const OUT = path.resolve(import.meta.dirname, "..", ".data", "screens");
const pages = process.argv.slice(2).length ? process.argv.slice(2) : ["/"];
const exe = ["/opt/pw-browsers/chromium/chrome-linux/chrome", "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"].find((p) => fs.existsSync(p));

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: exe });
const ctx = await browser.newContext({ viewport: { width: Number(process.env.W ?? 1440), height: Number(process.env.H ?? 1000) }, deviceScaleFactor: 1, colorScheme: process.env.DARK ? "dark" : "light" });
for (const p of pages) {
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(BASE + p, { waitUntil: "networkidle", timeout: 240_000 });
  await page.waitForTimeout(Number(process.env.WAIT ?? 1500));
  const name = (p === "/" ? "today" : p.replace(/^\//, "").replace(/[/?=&]/g, "_")).slice(0, 80);
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: !!process.env.FULL });
  console.log(`${p} -> ${name}.png${errors.length ? `\n  errors: ${errors.slice(0, 5).join("\n  ")}` : ""}`);
  await page.close();
}
await browser.close();
