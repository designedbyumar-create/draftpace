/**
 * Travel Companion pins for the Maple & Main Finds account, in a luxury
 * travel look: midnight navy and champagne, serif type, generous space.
 * Each pin focuses on a different travel problem, uses a different layout,
 * and carries the same plain disclosure as the rest of the account's pins.
 *
 *   node scripts/run-tsx.mjs scripts/pinterest-maple-main/travel-luxe.mjs
 *
 * Starts after the Maple & Main home batch (day 2) so the account stays at
 * 10 pins a day, on the same five PKT times.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";

const PAGES_DIR = path.resolve(process.cwd(), ".etsy-images/_pages");
const SCREENS_DIR = path.resolve(process.cwd(), ".etsy-images/_screens");
const FONTS_DIR = path.resolve(process.cwd(), "public/fonts");
const IMG_OUT = path.resolve(process.cwd(), "public/store/pinterest-travel-luxe");
const CSV_OUT = path.resolve(process.cwd(), "marketing/pinterest/travel-luxe");
const SITE = "https://draftpace.com";
const UTM = "utm_source=pinterest&utm_medium=organic_social&utm_campaign=travel_luxe";
const DISCLOSURE = "Made by Draftpace, the maker of Travel Companion.";
const START_DAY = 2;

const PINS = [
  { slug: "flight-delayed-with-a-connection-what-to-do-first", layout: "cinematic", board: "Travel Problems and Fixes", asset: "screen0",
    head: "Your connection is gone. Do the arithmetic before you join the line.",
    desc: "A delay and a connection to catch. Do the arithmetic, join the line and call at the same time, and ask for a specific flight, not for help." },
  { slug: "flight-changed-what-else-is-affected", layout: "ivory", board: "Trip Planning and Itineraries", asset: "screen1",
    head: "One flight moved. What else in your trip moved with it?",
    desc: "Decide about the flight first, then check the transfer, hotel check-in and dinner that were booked around it, one at a time." },
  { slug: "hotel-cannot-find-your-reservation", layout: "gold", board: "Travel Problems and Fixes", asset: "glance",
    head: "The desk says there is no booking. Open with these two sentences.",
    desc: "Which references and names to try, what to ask for tonight, and the two sentences to open with at the counter." },
  { slug: "lost-passport-wallet-or-phone-abroad-what-to-have-ready", layout: "split", board: "Travel Problems and Fixes", asset: "signature",
    head: "Lost your passport abroad? Gather these before you call anyone.",
    desc: "Passport, wallet or phone gone abroad. The order to act in for each, what to gather before you call anyone, and where the official steps live." },
  { slug: "travel-document-checklist", layout: "signature", board: "Travel Document Checklists", asset: "flat1",
    head: "Four travellers, one folder: where every document lives",
    desc: "What each traveller needs, what to check months ahead, and how to note where every document is kept, because a phone photo is not a backup." },
  { slug: "first-international-trip-checklist", layout: "twoScreens", board: "Travel Document Checklists", asset: "screens01",
    head: "Your first international trip, sorted in the right order",
    desc: "Passport, entry rules, money, insurance and phone, in the order to sort them and how early. Check each rule at the source." },
  { slug: "what-to-keep-on-paper-when-you-travel", layout: "gold", board: "Travel Document Checklists", asset: "flat2",
    head: "Phones die at the wrong moment. Print one page.",
    desc: "The one page worth printing, including your hotel address in the local language, and why two copies beat one." },
  { slug: "night-before-you-travel-checklist", layout: "cinematic", board: "Packing Lists", asset: "screen2",
    head: "The fifteen minutes the evening before you leave",
    desc: "Documents, cards, phone, the ride and the house, so the morning is only leaving. Plus what to skip." },
  { slug: "how-to-write-a-one-page-trip-itinerary", layout: "ivory", board: "Trip Planning and Itineraries", asset: "glance",
    head: "A trip itinerary short enough to survive a change",
    desc: "A trip itinerary that survives a change is short, in time order, with the reference beside each booking. A worked example and what to leave off." },
  { slug: "organising-a-multi-stop-trip-without-a-spreadsheet", layout: "split", board: "Trip Planning and Itineraries", asset: "screen0",
    head: "Many stops, many bookings that depend on each other",
    desc: "Record four things per booking, in time order, and skip the rebuild after every change." },
  { slug: "road-trip-planning-checklist", layout: "signature", board: "Trip Planning and Itineraries", asset: "flat1",
    head: "Fix these before you drive: hours, stays, the car, who drives",
    desc: "The few things to fix before you drive: hours per day, stays with their references, the car check, who drives when, and what stays within reach." },
  { slug: "how-to-plan-a-group-trip", layout: "twoScreens", board: "Family Travel Planning", asset: "screens12",
    head: "Planning a group trip without becoming the only one who knows the plan",
    desc: "Group trips go wrong when one person holds everything in their head. Decide who books what, who is on each booking and where the answers live." },
  { slug: "packing-list-for-a-week-away", layout: "ivory", board: "Packing Lists", asset: "screen1",
    head: "Packing for a week, split by person",
    desc: "Start with what every trip needs, add what this one asks for, then split it by person. A full list by category to check off as you pack." },
  { slug: "carry-on-only-packing-list", layout: "cinematic", board: "Packing Lists", asset: "flat2",
    head: "One bag, nothing checked. Choose the bag first.",
    desc: "Pack to the list, and check size and weight on your airline's own page before you go." },
  { slug: "packing-and-planning-for-a-trip-with-kids-or-a-baby", layout: "gold", board: "Family Travel Planning", asset: "signature",
    head: "Travelling with children: what changes, and what to pack per child",
    desc: "What changes when children come along: what to pack per child and by age, the paperwork to note for each, and how to plan a day with room for a bad one." },
];

const PAL = {
  navy: "#0e1a2b", ivory: "#f6f1e6", champagne: "#d6b98a", ink: "#14202f", muted: "#5c6675", deep: "#18283d",
};

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

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const csvField = (v) => { const s = String(v ?? ""); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const csvRow = (vals) => vals.map(csvField).join(",") + "\r\n";
async function dataUri(file, mime) { return `data:${mime};base64,${(await readFile(file)).toString("base64")}`; }
async function findByPrefix(dir, prefix) {
  const m = (await readdir(dir)).find((f) => f.startsWith(prefix));
  if (!m) throw new Error(`no file ${prefix}* in ${dir}`);
  return path.join(dir, m);
}

function shell(body, fonts, darkish) {
  const bg = darkish ? PAL.navy : PAL.ivory;
  const fg = darkish ? PAL.ivory : PAL.ink;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:1000px;height:1500px;background:${bg};color:${fg};font-family:Plex,sans-serif;overflow:hidden}
    @font-face{font-family:Newsreader;src:url(${fonts.newsreader}) format('truetype');font-weight:400 800}
    @font-face{font-family:Plex;src:url(${fonts.plex}) format('truetype');font-weight:400 700}
    .cv{width:1000px;height:1500px;position:relative;overflow:hidden;background:${bg}}
    .h{font-family:Newsreader;font-weight:600;line-height:1.08;position:absolute;text-wrap:balance;z-index:8}
    .brand{position:absolute;top:60px;left:80px;font-size:16px;letter-spacing:4px;text-transform:uppercase;font-weight:700;color:${PAL.champagne};z-index:9}
    .foot{position:absolute;left:80px;right:80px;bottom:56px;display:flex;justify-content:space-between;font-size:15px;font-weight:700;z-index:9;color:${darkish ? PAL.champagne : PAL.muted}}
    .foot .dis{font-weight:500}
    .img{position:absolute;z-index:4;border-radius:44px;box-shadow:0 60px 110px -36px rgba(0,0,0,0.55)}
    .frame{position:absolute;inset:40px;border:1.5px solid ${PAL.champagne};opacity:0.7;z-index:7}
  </style></head><body><div class="cv">${body}
    <div class="brand">Maple &amp; Main Finds</div>
    <div class="foot"><span>Travel Companion, $34 once</span><span class="dis">${esc(DISCLOSURE)}</span></div>
  </div></body></html>`;
}

function layout(p, a) {
  const img = (src, style, extra = "") => `<img class="img" src="${src}" style="${style}${extra}">`;
  switch (p.layout) {
    case "cinematic":
      return shell(`
        <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 42%,${PAL.deep},${PAL.navy} 70%)"></div>
        ${img(a.main, "left:50%;top:200px;height:690px;transform:translateX(-50%) rotate(-2deg)")}
        <div class="h" style="left:80px;right:80px;bottom:240px;font-size:72px;color:${PAL.ivory}">${esc(p.head)}</div>
        <div style="position:absolute;left:80px;width:120px;height:2px;background:${PAL.champagne};bottom:210px;z-index:8"></div>`, a.fonts, true);
    case "ivory":
      return shell(`
        <div class="h" style="left:80px;right:80px;top:150px;font-size:76px;color:${PAL.ink}">${esc(p.head)}</div>
        <div style="position:absolute;left:80px;right:80px;top:560px;bottom:200px;background:${PAL.navy};border-radius:6px"></div>
        ${img(a.main, "left:50%;top:600px;height:760px;transform:translateX(-50%)")}`, a.fonts, false);
    case "gold":
      return shell(`
        <div style="position:absolute;inset:0;background:${PAL.navy}"></div>
        <div class="frame"></div>
        <div class="h" style="left:120px;right:120px;top:210px;font-size:70px;color:${PAL.ivory};text-align:center">${esc(p.head)}</div>
        ${img(a.page, "left:50%;top:620px;width:520px;transform:translateX(-50%) rotate(-1.5deg)")}`, a.fonts, true);
    case "split":
      return shell(`
        <div style="position:absolute;left:0;right:0;top:0;height:700px;background:${PAL.navy}"></div>
        <div class="h" style="left:80px;right:80px;top:170px;font-size:70px;color:${PAL.ivory}">${esc(p.head)}</div>
        ${img(a.main, "left:200px;top:720px;height:700px;transform:rotate(3deg)")}`, a.fonts, false);
    case "signature":
      return shell(`
        <div style="position:absolute;left:100px;right:100px;top:300px;bottom:220px;background:#fff;border-radius:4px;box-shadow:0 40px 90px -30px rgba(0,0,0,0.25)"></div>
        <div class="h" style="left:150px;right:150px;top:380px;font-size:62px;color:${PAL.ink}">${esc(p.head)}</div>
        ${img(a.page, "right:110px;bottom:260px;width:360px;transform:rotate(-5deg)")}`, a.fonts, false);
    case "twoScreens":
      return shell(`
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,${PAL.navy},${PAL.deep})"></div>
        <div class="h" style="left:80px;right:80px;top:160px;font-size:68px;color:${PAL.ivory}">${esc(p.head)}</div>
        ${img(a.main, "left:70px;top:600px;height:780px;transform:rotate(-5deg)")}
        ${img(a.second, "right:70px;top:660px;height:740px;transform:rotate(5deg)")}`, a.fonts, true);
    default:
      throw new Error(p.layout);
  }
}

async function main() {
  await mkdir(IMG_OUT, { recursive: true });
  await mkdir(CSV_OUT, { recursive: true });
  const fonts = {
    newsreader: await dataUri(path.join(FONTS_DIR, "Newsreader.ttf"), "font/ttf"),
    plex: await dataUri(path.join(FONTS_DIR, "IBMPlexSans.ttf"), "font/ttf"),
  };
  const pg = (f) => findByPrefix(PAGES_DIR, `travel-companion-${f}`);
  const sc = (n) => findByPrefix(SCREENS_DIR, `travel-companion-${n}.`);
  const assets = {
    cover: await dataUri(await pg("cover-"), "image/png"),
    flat1: await dataUri(await pg("flat1-"), "image/png"),
    flat2: await dataUri(await pg("flat2-"), "image/png"),
    signature: await dataUri(await pg("signature-"), "image/png"),
    glance: await dataUri(await pg("glance-"), "image/png"),
    s0: await dataUri(await sc(0), "image/png"),
    s1: await dataUri(await sc(1), "image/png"),
    s2: await dataUri(await sc(2), "image/png"),
  };

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 1500 }, deviceScaleFactor: 2 });
  const rows = [];
  for (let i = 0; i < PINS.length; i++) {
    const p = PINS[i];
    const num = String(i + 1).padStart(2, "0");
    const a = { fonts, main: assets.s0, second: assets.s2, page: assets.cover };
    if (p.asset === "screen0") a.main = assets.s0;
    if (p.asset === "screen1") a.main = assets.s1;
    if (p.asset === "screen2") a.main = assets.s2;
    if (p.asset === "glance") { a.main = assets.s0; a.page = assets.glance; }
    if (p.asset === "flat1") a.page = assets.flat1;
    if (p.asset === "flat2") a.page = assets.flat2;
    if (p.asset === "signature") a.page = assets.signature;
    if (p.asset === "screens01") { a.main = assets.s0; a.second = assets.s1; }
    if (p.asset === "screens12") { a.main = assets.s1; a.second = assets.s2; }

    await page.setContent(layout(p, a), { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const png = await page.screenshot();
    await sharp(png).resize(2000, 3000).jpeg({ quality: 90, mozjpeg: true }).toFile(path.join(IMG_OUT, `tl-${num}.jpg`));

    rows.push([
      p.head.replace(/\.$/, ""),
      `${SITE}/store/pinterest-travel-luxe/tl-${num}.jpg`,
      p.board,
      `${p.desc} ${DISCLOSURE}`,
      `${SITE}/guides/${p.slug}?${UTM}&utm_content=tl-${num}`,
      isoDate(START_DAY + Math.floor(i / 10), SLOT_SEQUENCE[i % 10]),
      "",
    ]);
    console.log(`tl-${num}.jpg  [${p.layout}]  ${p.head}`);
  }
  await browser.close();

  const header = ["Title", "Media URL", "Pinterest board", "Description", "Link", "Publish date", "Keywords"];
  await writeFile(path.join(CSV_OUT, "travel-luxe.csv"), csvRow(header) + rows.map(csvRow).join(""), "utf8");
  console.log(`csv: marketing/pinterest/travel-luxe/travel-luxe.csv (${rows.length} rows)`);
}

await main();
