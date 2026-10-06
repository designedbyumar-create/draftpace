/**
 * Builds the Maple & Main Finds Pinterest batch: 16 pins, each a distinct
 * layout and palette, each focused on a different household problem that
 * Home Base solves (not the product itself). Every pin carries a plain
 * disclosure that Draftpace makes Home Base.
 *
 *   node scripts/run-tsx.mjs scripts/pinterest-maple-main/build.mjs
 *
 * Output: public/store/pinterest-maple-main/mm-NN.jpg (2000x3000, must be
 * deployed before the CSV's Media URLs resolve) and
 * marketing/pinterest/maple-main/maple-main.csv.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";

const PAGES_DIR = path.resolve(process.cwd(), ".etsy-images/_pages");
const SCREENS_DIR = path.resolve(process.cwd(), ".etsy-images/_screens");
const FONTS_DIR = path.resolve(process.cwd(), "public/fonts");
const IMG_OUT = path.resolve(process.cwd(), "public/store/pinterest-maple-main");
const CSV_OUT = path.resolve(process.cwd(), "marketing/pinterest/maple-main");
const SITE = "https://draftpace.com";
const UTM = "utm_source=pinterest&utm_medium=organic_social&utm_campaign=maple_main";
const DISCLOSURE = "Made by Draftpace, the maker of Home Base.";

// Each entry: a different household problem, its own real guide, its own
// layout (L1-L6), palette, and real Home Base asset. Descriptions keep the
// guide's real facts, reworded toward the problem rather than the product.
const PINS = [
  { slug: "where-is-my-water-shutoff", layout: "split", pal: "sage", asset: "screen0", board: "Tiny Space Home Upkeep",
    head: "A pipe bursts at 2 a.m. Where is the water shutoff?",
    desc: "Where the main valve usually is, the two valve types, how to tell if it is stuck, and the one page to write it on so anyone in the house can find it in an emergency." },
  { slug: "how-often-change-furnace-filter", layout: "pageLeft", pal: "slate", asset: "flat1", board: "Tiny Space Home Upkeep",
    head: "Know your furnace filter size before the filter is due",
    desc: "Check it once a month and change it at least every three months. How to read the size from the frame and write it down once, so the next filter is the right one." },
  { slug: "home-maintenance-you-skip-that-costs-the-most", layout: "dark", pal: "charcoal", asset: "screen1", board: "Seasonal Home Care",
    head: "Nine small jobs that turn into big repairs",
    desc: "The home maintenance jobs where a normal delay becomes real damage: how often each one is really due, and what a missed one turns into by the next season." },
  { slug: "what-to-keep-after-a-home-repair", layout: "signatureCard", pal: "bone", asset: "signature", board: "Home Binder Ideas",
    head: "The invoice says what you paid. Not what was wrong.",
    desc: "Write down what was wrong, what was replaced, and what the technician said comes next, on the same day the repair is done." },
  { slug: "first-week-after-buying-a-house", layout: "twoScreens", pal: "terracotta", asset: "screens01", board: "Home Binder Ideas",
    head: "Your first week in a house you just bought",
    desc: "Shutoffs, meter readings, alarms, appliance labels and the inspection report: what to capture while it is all still in front of you." },
  { slug: "inherited-a-house-where-to-start", layout: "coverFull", pal: "plum", asset: "cover", board: "Home Binder Ideas",
    head: "Inherited a house and nobody left the manuals",
    desc: "No service history, no idea how old the furnace is. How to date what you have, typical service lives, and what to check first." },
  { slug: "moving-into-a-rental-what-to-document", layout: "pageRight", pal: "mint", asset: "flat2", board: "Renter Move-In Checklists",
    head: "Protect your deposit: document the rental on day one",
    desc: "Dated photos, lease dates, the deposit and a log of what you reported. Four records made on day one settle most deposit arguments later." },
  { slug: "how-to-find-the-model-number-on-any-appliance", layout: "checklistCard", pal: "sand", asset: "cover", board: "Home Binder Ideas",
    head: "Where is the model number on your appliance?",
    desc: "Where the data plate hides on a fridge, washer, dryer, dishwasher, range and water heater, and what to do when the label has worn away." },
  { slug: "appliance-warranties-what-to-track", layout: "stat", pal: "ink", asset: "screen2", board: "Home Binder Ideas",
    head: "Which appliance warranty runs out this year?",
    desc: "What to record at purchase, the service condition that catches people out, and when to check the expiration date before you pay for a repair." },
  { slug: "how-to-make-a-home-binder", layout: "pageLeft", pal: "olive", asset: "flat1", board: "Home Binder Ideas",
    head: "One afternoon is enough to build a home binder",
    desc: "Five sections cover almost everything a home binder needs. One category of thing should never go in it, and it is the one most people try to file first." },
  { slug: "home-maintenance-log-template", layout: "signatureCard", pal: "rose", asset: "signature", board: "Home Binder Ideas",
    head: "Your house needs a log, not a memory",
    desc: "A maintenance log is four fields and one note: date, what was done, who did it and what it cost. Example entries show how much to write." },
  { slug: "what-to-record-when-you-buy-an-appliance", layout: "checklistCard", pal: "sage", asset: "screen0", board: "Home Binder Ideas",
    head: "Buying an appliance? Write five facts down before the first repair",
    desc: "Brand, model, serial number, purchase date and warranty end, written once while the machine is still in front of you." },
  { slug: "winterize-your-house-checklist", layout: "split", pal: "slate", asset: "flat2", board: "Seasonal Home Care",
    head: "Which house job has a freeze deadline?",
    desc: "Freeze jobs have a deadline, and the weather sets it. What to do, in what order, and what to write down so next year takes five minutes." },
  { slug: "fall-home-maintenance-checklist", layout: "pageRight", pal: "amber", asset: "flat2", board: "Seasonal Home Care",
    head: "Fall jobs in order: heating first, gutters last",
    desc: "September, October and November in order, built around the jobs that prevent damage. Heating and safety come before outdoor equipment." },
  { slug: "home-maintenance-checklist-by-month", layout: "coverFull", pal: "ink", asset: "cover", board: "Seasonal Home Care",
    head: "Most months ask for nothing. October asks for everything.",
    desc: "January to December in one short list: only the jobs that belong to a month and cause damage if skipped." },
  { slug: "how-often-home-systems-need-servicing", layout: "stat", pal: "mustard", asset: "screen1", board: "Seasonal Home Care",
    head: "How often does each home system really need service?",
    desc: "Service intervals for heating, cooling, water, structure and safety, plus the jobs tied to a season instead of a date. Your own manual wins over any table." },
];

const PAL = {
  sage: { bg: "#e9efe6", ink: "#23332a", accent: "#5b7d64", soft: "#d3e0d2" },
  slate: { bg: "#e7ebf0", ink: "#1f2a38", accent: "#4a6584", soft: "#cfd9e4" },
  charcoal: { bg: "#1f1d1b", ink: "#f2ede6", accent: "#d9a46b", soft: "#2e2b28" },
  bone: { bg: "#f6f2ea", ink: "#2b2723", accent: "#8a6f4e", soft: "#e8dfcd" },
  terracotta: { bg: "#f6e6dc", ink: "#4a2a1e", accent: "#b65c3a", soft: "#ecc9b6" },
  plum: { bg: "#efe6ee", ink: "#3a2540", accent: "#7d4a86", soft: "#dcc8df" },
  mint: { bg: "#e4f1ec", ink: "#1d3a31", accent: "#2f7a64", soft: "#c6e2d7" },
  sand: { bg: "#f3ead9", ink: "#3b3122", accent: "#a3803c", soft: "#e6d8b8" },
  ink: { bg: "#17202e", ink: "#eef1f5", accent: "#7fb0e0", soft: "#243246" },
  olive: { bg: "#eef0e2", ink: "#2e3320", accent: "#6d7a32", soft: "#dde3c6" },
  rose: { bg: "#f8e9e9", ink: "#4a2526", accent: "#b25d62", soft: "#f0cdcf" },
  amber: { bg: "#fbefd9", ink: "#43300f", accent: "#c07c14", soft: "#f3dcae" },
  mustard: { bg: "#f7f0cf", ink: "#3d3510", accent: "#b89318", soft: "#ebdfa6" },
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function csvField(v) {
  const s = String(v ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
const csvRow = (vals) => vals.map(csvField).join(",") + "\r\n";

const TIME_SLOTS = [
  { time: "17:00:00", dayShift: 0, slotCount: 1 },
  { time: "21:30:00", dayShift: 0, slotCount: 2 },
  { time: "00:00:00", dayShift: 1, slotCount: 2 },
  { time: "04:00:00", dayShift: 1, slotCount: 2 },
  { time: "06:00:00", dayShift: 1, slotCount: 3 },
];
const SLOT_SEQUENCE = TIME_SLOTS.flatMap((s, i) => Array(s.slotCount).fill(i));
function isoDate(dayOffset, slotIndex) {
  const slot = TIME_SLOTS[slotIndex];
  const d = new Date();
  d.setDate(d.getDate() + 1 + dayOffset + slot.dayShift);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${slot.time}`;
}

async function dataUri(file, mime) {
  return `data:${mime};base64,${(await readFile(file)).toString("base64")}`;
}
async function findByPrefix(dir, prefix) {
  const match = (await readdir(dir)).find((f) => f.startsWith(prefix));
  if (!match) throw new Error(`no file ${prefix}* in ${dir}`);
  return path.join(dir, match);
}

function shell(p, body, fonts) {
  const c = PAL[p.pal];
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    :root{ --bg:${c.bg}; --ink:${c.ink}; --accent:${c.accent}; --soft:${c.soft}; }
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:1000px;height:1500px;background:var(--bg);color:var(--ink);font-family:Plex,sans-serif;overflow:hidden}
    @font-face{font-family:Newsreader;src:url(${fonts.newsreader}) format('truetype');font-weight:400 800}
    @font-face{font-family:Plex;src:url(${fonts.plex}) format('truetype');font-weight:400 700}
    .cv{width:1000px;height:1500px;position:relative;overflow:hidden;background:var(--bg)}
    .brand{position:absolute;top:56px;left:70px;font-size:17px;letter-spacing:2.8px;text-transform:uppercase;font-weight:700;color:var(--accent);z-index:9}
    .h{font-family:Newsreader;font-weight:700;line-height:1.05;text-wrap:balance;position:absolute;z-index:8}
    .shadowed{box-shadow:0 60px 110px -36px rgba(0,0,0,0.35)}
    .foot{position:absolute;left:70px;right:70px;bottom:52px;display:flex;justify-content:space-between;align-items:center;font-size:16px;font-weight:700;z-index:9}
    .foot .dis{font-weight:500;opacity:0.8}
    .phone{position:absolute;border-radius:34px;box-shadow:0 50px 95px -30px rgba(0,0,0,0.45);z-index:4}
    .page{position:absolute;border:1px solid rgba(0,0,0,0.08);background:#fff;z-index:3}
  </style></head><body><div class="cv">${body}
    <div class="brand">Maple &amp; Main Finds</div>
    <div class="foot"><span>Home Base, $49 once</span><span class="dis">${esc(DISCLOSURE)}</span></div>
  </div></body></html>`;
}

function layoutHtml(p, a) {
  const { head } = p;
  const img = (src, style, cls = "page") => `<img class="${cls}" src="${src}" style="${style}">`;
  switch (p.layout) {
    case "split":
      return shell(p, `
        <div class="h" style="left:70px;top:150px;right:70px;font-size:84px">${esc(head)}</div>
        <div style="position:absolute;left:0;right:0;bottom:0;height:800px;background:var(--soft)"></div>
        ${img(a.main, "left:200px;top:720px;width:600px;transform:rotate(-3deg)", "phone")}`, a.fonts);
    case "pageLeft":
      return shell(p, `
        ${img(a.page, "left:70px;top:520px;width:470px;transform:rotate(-5deg)")}
        <div class="h" style="left:70px;top:150px;right:70px;font-size:76px">${esc(head)}</div>
        <div style="position:absolute;left:580px;top:640px;width:340px;height:4px;background:var(--accent)"></div>`, a.fonts);
    case "pageRight":
      return shell(p, `
        ${img(a.page, "right:70px;top:520px;width:470px;transform:rotate(5deg)")}
        <div class="h" style="left:70px;top:160px;right:70px;font-size:78px">${esc(head)}</div>`, a.fonts);
    case "dark":
      return shell(p, `
        <div class="h" style="left:70px;top:150px;right:70px;font-size:80px;color:var(--accent)">${esc(head)}</div>
        <div style="position:absolute;left:0;right:0;top:0;bottom:0;background:radial-gradient(circle at 50% 70%,var(--soft),var(--bg) 70%)"></div>
        ${img(a.main, "left:230px;top:600px;height:760px", "phone")}`, a.fonts);
    case "signatureCard":
      return shell(p, `
        <div style="position:absolute;left:90px;right:90px;top:330px;bottom:200px;background:#fff;border-radius:18px;box-shadow:0 40px 80px -30px rgba(0,0,0,0.25);padding:70px 60px">
          <div class="h" style="position:relative;font-size:60px;color:var(--ink)">${esc(head)}</div>
          <div style="margin-top:48px;opacity:0.45;height:2px;background:var(--ink)"></div>
          <div style="margin-top:36px;opacity:0.45;height:2px;background:var(--ink);width:70%"></div>
          <div style="margin-top:36px;opacity:0.45;height:2px;background:var(--ink);width:85%"></div>
        </div>
        ${img(a.page, "right:60px;bottom:170px;width:360px;transform:rotate(-6deg)")}
        <div class="h" style="position:absolute;left:70px;top:120px;font-size:0"></div>`, a.fonts);
    case "twoScreens":
      return shell(p, `
        <div class="h" style="left:70px;top:150px;right:70px;font-size:76px">${esc(head)}</div>
        ${img(a.main, "left:60px;top:560px;height:800px;transform:rotate(-6deg)", "phone")}
        ${img(a.second, "right:60px;top:640px;height:760px;transform:rotate(6deg)", "phone")}`, a.fonts);
    case "coverFull":
      return shell(p, `
        <div class="h" style="left:70px;top:140px;right:70px;font-size:80px">${esc(head)}</div>
        ${img(a.page, "left:50%;top:560px;width:620px;transform:translateX(-50%) rotate(-2deg);box-shadow:0 60px 110px -36px rgba(0,0,0,0.35)")}`, a.fonts);
    case "checklistCard":
      return shell(p, `
        <div class="h" style="left:70px;top:150px;right:70px;font-size:70px">${esc(head)}</div>
        <div style="position:absolute;left:70px;right:70px;top:500px;bottom:200px;background:var(--soft);border-radius:22px;padding:60px 56px">
          ${["Brand", "Model", "Serial number", "Purchase date", "Warranty end"].map((t) =>
            `<div style="display:flex;align-items:center;gap:22px;font-size:34px;padding:22px 0;border-bottom:2px solid rgba(0,0,0,0.12)"><span style="width:30px;height:30px;border:3px solid var(--accent);border-radius:6px;display:inline-block"></span>${t}</div>`).join("")}
        </div>`, a.fonts);
    case "stat":
      return shell(p, `
        <div class="h" style="left:70px;top:150px;right:70px;font-size:74px">${esc(head)}</div>
        <div style="position:absolute;left:70px;top:520px;font-family:Newsreader;font-size:150px;font-weight:700;color:var(--accent);line-height:1">Before</div>
        <div style="position:absolute;left:70px;top:700px;font-size:36px;font-weight:700;line-height:1.35;width:620px">you pay for a repair, check the expiration date on the warranty.</div>
        ${img(a.main, "right:40px;bottom:180px;height:640px;transform:rotate(4deg)", "phone")}`, a.fonts);
    default:
      throw new Error(`unknown layout ${p.layout}`);
  }
}

async function main() {
  await mkdir(IMG_OUT, { recursive: true });
  await mkdir(CSV_OUT, { recursive: true });

  const fonts = {
    newsreader: await dataUri(path.join(FONTS_DIR, "Newsreader.ttf"), "font/ttf"),
    plex: await dataUri(path.join(FONTS_DIR, "IBMPlexSans.ttf"), "font/ttf"),
  };
  const page = (f) => findByPrefix(PAGES_DIR, `home-management-companion-${f}`);
  const screen = (n) => findByPrefix(SCREENS_DIR, `home-management-companion-${n}.`);
  const assets = {
    cover: await dataUri(await page("cover-"), "image/png"),
    flat1: await dataUri(await page("flat1-"), "image/png"),
    flat2: await dataUri(await page("flat2-"), "image/png"),
    signature: await dataUri(await page("signature-"), "image/png"),
    screen0: await dataUri(await screen(0), "image/png"),
    screen1: await dataUri(await screen(1), "image/png"),
    screen2: await dataUri(await screen(2), "image/png"),
  };

  const browser = await chromium.launch();
  const pg = await browser.newPage({ viewport: { width: 1000, height: 1500 }, deviceScaleFactor: 2 });

  const rows = [];
  for (let i = 0; i < PINS.length; i++) {
    const p = PINS[i];
    const num = String(i + 1).padStart(2, "0");
    const a = {
      fonts,
      page: assets[p.asset.startsWith("screen") || p.asset === "screens01" ? "cover" : p.asset],
      main: p.asset.startsWith("screen") ? assets[p.asset] : assets.screen0,
      second: assets.screen2,
    };
    if (p.asset === "screens01") { a.main = assets.screen0; a.second = assets.screen1; }
    if (p.asset === "cover") a.page = assets.cover;
    if (p.asset === "signature") a.page = assets.signature;

    await pg.setContent(layoutHtml(p, a), { waitUntil: "load" });
    await pg.evaluate(() => document.fonts.ready);
    const png = await pg.screenshot();
    await sharp(png).resize(2000, 3000).jpeg({ quality: 90, mozjpeg: true }).toFile(path.join(IMG_OUT, `mm-${num}.jpg`));

    rows.push([
      p.head.replace(/\.$/, ""),
      `${SITE}/store/pinterest-maple-main/mm-${num}.jpg`,
      p.board,
      `${p.desc} ${DISCLOSURE}`,
      `${SITE}/guides/${p.slug}?${UTM}&utm_content=mm-${num}`,
      isoDate(Math.floor(i / 10), SLOT_SEQUENCE[i % 10]),
      "",
    ]);
    console.log(`mm-${num}.jpg  [${p.layout}/${p.pal}]  ${p.head}`);
  }
  await browser.close();

  const header = ["Title", "Media URL", "Pinterest board", "Description", "Link", "Publish date", "Keywords"];
  await writeFile(path.join(CSV_OUT, "maple-main.csv"), csvRow(header) + rows.map(csvRow).join(""), "utf8");
  console.log(`csv: marketing/pinterest/maple-main/maple-main.csv (${rows.length} rows)`);
}

await main();
