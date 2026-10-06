/**
 * Maple & Main Finds: the Home Base set (16) and the Travel Companion set
 * (15), rebuilt together in one editorial system. One combined CSV of 31
 * pins, scheduled 15 a day.
 *
 *   node scripts/run-tsx.mjs scripts/pinterest-maple-main/editorial.mjs
 *
 * Design rules used throughout:
 *  - Phone mockups are drawn in CSS (bezel, radius, shadow) around the real
 *    screen capture, so no light rectangle from the PNG can show at the corners.
 *  - Page scans sit on paper with a clean edge and a soft shadow.
 *  - Backgrounds are layered gradients with a fine grain, not flat fills.
 *  - Type is editorial: a heavy serif headline, small tracked uppercase
 *    labels, no chips, pills or tags anywhere on the image.
 *  - Every pin's description states what the image shows and ends with a
 *    call to action, then the disclosure.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";

const PAGES_DIR = path.resolve(process.cwd(), ".etsy-images/_pages");
const SCREENS_DIR = path.resolve(process.cwd(), ".etsy-images/_screens");
const FONTS_DIR = path.resolve(process.cwd(), "public/fonts");
const HOME_OUT = path.resolve(process.cwd(), "public/store/pinterest-maple-main");
const TRAVEL_OUT = path.resolve(process.cwd(), "public/store/pinterest-travel-luxe");
const CSV_OUT = path.resolve(process.cwd(), "marketing/pinterest/maple-main");
const SITE = "https://draftpace.com";
const DISCLOSURE = "Made by Draftpace, the maker of";
const PER_DAY = 15;

const HOME = [
  { slug: "home-maintenance-checklist-by-month", board: "Seasonal Home Care", pal: "forest", layout: "poster",
    title: "Home Maintenance Checklist by Month", head: "Most months ask for nothing. October does not.",
    desc: "One short list, month by month, with only the jobs that cause damage if they are skipped. Read the checklist, then tap through for the full guide.", product: "Home Base" },
  { slug: "how-often-home-systems-need-servicing", board: "Seasonal Home Care", pal: "sage", layout: "split",
    title: "How Often Each Home System Needs Service", head: "Service follows the system, not the calendar",
    desc: "Service intervals for heating, cooling, water, structure and safety, with your own manual as the final word. See how often each system needs a visit.", product: "Home Base" },
  { slug: "home-maintenance-you-skip-that-costs-the-most", board: "Tiny Space Home Upkeep", pal: "oxblood", layout: "centered",
    title: "Home Maintenance Jobs That Cost the Most to Skip", head: "Nine small jobs. One large bill.",
    desc: "The jobs where a normal delay becomes real damage, how often each one is really due, and what a missed one turns into. Read the nine jobs.", product: "Home Base" },
  { slug: "how-often-change-furnace-filter", board: "Tiny Space Home Upkeep", pal: "slate", layout: "quote",
    title: "How Often to Change a Furnace Filter", head: "Write the size down once",
    desc: "Change it at least every three months, and record the size so the next filter is the right one. Read the filter guide.", product: "Home Base" },
  { slug: "home-maintenance-log-template", board: "Home Binder Ideas", pal: "ivory", layout: "two",
    title: "Home Maintenance Log Template: What to Write", head: "A log, not a memory",
    desc: "Date, what was done, who did it and what it cost, with example entries that show how much detail is enough. Read the log guide.", product: "Home Base" },
  { slug: "how-to-make-a-home-binder", board: "Home Binder Ideas", pal: "forest", layout: "poster",
    title: "How to Make a Home Binder in One Afternoon", head: "One afternoon. One binder.",
    desc: "Five sections cover almost everything a home binder needs, and one category of thing should never go in it. Read how to build one.", product: "Home Base" },
  { slug: "where-is-my-water-shutoff", board: "Tiny Space Home Upkeep", pal: "navy", layout: "split",
    title: "Where Is the Main Water Shutoff in Your Home?", head: "Find it before the pipe bursts",
    desc: "Where the main valve usually sits, the two valve types, how to tell a stuck valve, and the one page to write it on. Read the shutoff guide.", product: "Home Base" },
  { slug: "what-to-keep-after-a-home-repair", board: "Home Binder Ideas", pal: "ivory", layout: "centered",
    title: "What to Keep After a Home Repair", head: "The invoice says what you paid",
    desc: "Write down what was wrong, what was replaced, and what the technician said comes next, on the same day. Read what to keep.", product: "Home Base" },
  { slug: "first-week-after-buying-a-house", board: "Home Binder Ideas", pal: "sage", layout: "two",
    title: "New House Checklist for the First Week", head: "The first week, in order",
    desc: "Shutoffs, meter readings, alarms, appliance labels and the inspection report, captured while it is still in front of you. Read the checklist.", product: "Home Base" },
  { slug: "inherited-a-house-where-to-start", board: "Home Binder Ideas", pal: "slate", layout: "quote",
    title: "Inherited a House With No Records: Where to Start", head: "No manuals. No history. Start here.",
    desc: "How to date what you have, typical service lives, and what to check first. Read where to start.", product: "Home Base" },
  { slug: "moving-into-a-rental-what-to-document", board: "Renter Move-In Checklists", pal: "sand", layout: "poster",
    title: "Renter Checklist: What to Document on Move-In Day", head: "Protect the deposit on day one",
    desc: "Dated photos, lease dates, the deposit and a log of what you reported, made on the first day. Read the move-in guide.", product: "Home Base" },
  { slug: "how-to-find-the-model-number-on-any-appliance", board: "Home Binder Ideas", pal: "forest", layout: "split",
    title: "How to Find the Model Number on Any Appliance", head: "Where the model number hides",
    desc: "The data plate on a fridge, washer, dryer, dishwasher, range and water heater, and what to do when the label has worn away. Read the guide.", product: "Home Base" },
  { slug: "what-to-record-when-you-buy-an-appliance", board: "Home Binder Ideas", pal: "terracotta", layout: "centered",
    title: "What to Write Down When You Buy an Appliance", head: "Five facts, written once",
    desc: "Brand, model, serial number, purchase date and warranty end, recorded while the machine is still in front of you. Read the five facts.", product: "Home Base" },
  { slug: "appliance-warranties-what-to-track", board: "Home Binder Ideas", pal: "navy", layout: "quote",
    title: "How to Track Appliance Warranties Before a Repair", head: "Check the warranty before you pay",
    desc: "What to record at purchase, the service condition that catches people out, and when to check the expiration date. Read the warranty guide.", product: "Home Base" },
  { slug: "fall-home-maintenance-checklist", board: "Seasonal Home Care", pal: "oxblood", layout: "two",
    title: "Fall Home Maintenance Checklist by Month", head: "Heating first. Gutters last.",
    desc: "September, October and November in order, built around the jobs that prevent damage. Read the fall checklist.", product: "Home Base" },
  { slug: "winterize-your-house-checklist", board: "Seasonal Home Care", pal: "slate", layout: "poster",
    title: "Winterize Your House Before the First Freeze", head: "Freeze jobs have a deadline",
    desc: "What to do before the first freeze, in what order, and what to write down so next year takes five minutes. Read the checklist.", product: "Home Base" },
];

const TRAVEL = [
  { slug: "flight-delayed-with-a-connection-what-to-do-first", board: "Travel Problems and Fixes", pal: "navy", layout: "poster",
    title: "Flight Delayed With a Connection: What to Do First", head: "Do the arithmetic before the line",
    desc: "A delay and a connection to catch: do the arithmetic, call and join the line at once, and ask for a specific flight. Read the delay guide.", product: "Travel Companion" },
  { slug: "flight-changed-what-else-is-affected", board: "Trip Planning and Itineraries", pal: "ivory", layout: "split",
    title: "Flight Changed? Check What Else Moved With It", head: "One flight moved. What else?",
    desc: "Decide about the flight first, then check the transfer, hotel check-in and dinner that were booked around it. Read the trip guide.", product: "Travel Companion" },
  { slug: "hotel-cannot-find-your-reservation", board: "Travel Problems and Fixes", pal: "oxblood", layout: "quote",
    title: "Hotel Cannot Find Your Reservation: What to Say", head: "Open with two sentences",
    desc: "Which references and names to try, what to ask for tonight, and the two sentences to open with at the desk. Read the hotel guide.", product: "Travel Companion" },
  { slug: "lost-passport-wallet-or-phone-abroad-what-to-have-ready", board: "Travel Problems and Fixes", pal: "slate", layout: "centered",
    title: "Lost Passport Abroad: What to Gather First", head: "Gather before you call",
    desc: "The order to act in for a lost passport, wallet or phone abroad, and what to have ready before you call anyone. Read the abroad guide.", product: "Travel Companion" },
  { slug: "travel-document-checklist", board: "Travel Document Checklists", pal: "forest", layout: "two",
    title: "Travel Document Checklist: Where Every Document Lives", head: "Four travellers. One folder.",
    desc: "What each traveller needs, what to check months ahead, and where every document is kept, because a phone photo is not a backup. Read the checklist.", product: "Travel Companion" },
  { slug: "first-international-trip-checklist", board: "Travel Document Checklists", pal: "sand", layout: "poster",
    title: "First International Trip Checklist, in Order", head: "Sort it in the right order",
    desc: "Passport, entry rules, money, insurance and phone, in the order to sort them and how early. Check each rule at the source. Read the checklist.", product: "Travel Companion" },
  { slug: "what-to-keep-on-paper-when-you-travel", board: "Travel Document Checklists", pal: "plum", layout: "centered",
    title: "What to Print Before You Travel", head: "Phones die at the wrong moment",
    desc: "The one page worth printing, including your hotel address in the local language, and why two copies beat one. Read the print list.", product: "Travel Companion" },
  { slug: "night-before-you-travel-checklist", board: "Packing Lists", pal: "navy", layout: "quote",
    title: "Night Before You Travel: The Fifteen-Minute Checklist", head: "Fifteen minutes, then leave",
    desc: "Documents, cards, phone, the ride and the house, so the morning is only leaving. Read the night-before checklist.", product: "Travel Companion" },
  { slug: "how-to-write-a-one-page-trip-itinerary", board: "Trip Planning and Itineraries", pal: "ivory", layout: "two",
    title: "How to Write a One-Page Trip Itinerary", head: "Short enough to survive a change",
    desc: "A trip itinerary in time order with the reference beside each booking, plus a worked example. Read the itinerary guide.", product: "Travel Companion" },
  { slug: "organising-a-multi-stop-trip-without-a-spreadsheet", board: "Trip Planning and Itineraries", pal: "forest", layout: "split",
    title: "Multi-Stop Trip Planning Without a Spreadsheet", head: "Many stops. Linked bookings.",
    desc: "Four things to record per booking, in time order, so a change does not mean a full rebuild. Read the multi-stop guide.", product: "Travel Companion" },
  { slug: "road-trip-planning-checklist", board: "Trip Planning and Itineraries", pal: "sand", layout: "poster",
    title: "Road Trip Planning Checklist: Stops, Stays and the Car", head: "Fix these before you drive",
    desc: "Hours per day, stays with their references, the car check, who drives when, and what stays within reach. Read the road trip checklist.", product: "Travel Companion" },
  { slug: "how-to-plan-a-group-trip", board: "Family Travel Planning", pal: "terracotta", layout: "two",
    title: "How to Plan a Group Trip Without Doing Everything", head: "Share the plan, not just the work",
    desc: "Decide who books what, who is on each booking, and where the answers live. Read how to plan a group trip.", product: "Travel Companion" },
  { slug: "packing-list-for-a-week-away", board: "Packing Lists", pal: "slate", layout: "centered",
    title: "Packing List for a Week Away, Split by Person", head: "A week, packed by person",
    desc: "What every trip needs, what this one asks for, split by person and checked by category. Read the packing list.", product: "Travel Companion" },
  { slug: "carry-on-only-packing-list", board: "Packing Lists", pal: "oxblood", layout: "quote",
    title: "Carry-On Only Packing List", head: "One bag. Nothing checked.",
    desc: "Choose the bag first, pack to the list, and check size and weight on your airline's own page before you go. Read the carry-on list.", product: "Travel Companion" },
  { slug: "packing-and-planning-for-a-trip-with-kids-or-a-baby", board: "Family Travel Planning", pal: "plum", layout: "poster",
    title: "Travelling With Kids or a Baby: What to Pack Per Child", head: "What changes with children",
    desc: "What to pack per child and by age, the paperwork to note for each, and room in the day for a bad one. Read the family travel guide.", product: "Travel Companion" },
];

const PAL = {
  forest: ["#24432f", "#0d1f16", "#d9bd82", "#f4efe2"],
  oxblood: ["#5a2229", "#1f0a0e", "#e8b9a4", "#f7ece5"],
  navy: ["#18304f", "#081426", "#d6b98a", "#f2ece0"],
  slate: ["#d9e1ea", "#9dafc3", "#203a57", "#101c2b"],
  sage: ["#dfe8dc", "#b5c7b1", "#2f5a43", "#17261d"],
  ivory: ["#f6efe2", "#e2d4bb", "#8a4f2a", "#2a1f16"],
  sand: ["#f1e6d0", "#d7c09a", "#7a4e1d", "#2b1f10"],
  plum: ["#41263f", "#170c18", "#e9c3e0", "#f5ecf3"],
  terracotta: ["#e09a74", "#a24d2d", "#fff1e6", "#2a120a"],
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const csvField = (v) => { const s = String(v ?? ""); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const csvRow = (vals) => vals.map(csvField).join(",") + "\r\n";
const SLOT_COUNTS = [2, 3, 3, 3, 4];
const TIME_SLOTS = [
  { time: "17:00:00", dayShift: 0 }, { time: "21:30:00", dayShift: 0 }, { time: "00:00:00", dayShift: 1 },
  { time: "04:00:00", dayShift: 1 }, { time: "06:00:00", dayShift: 1 },
];
const SLOT_SEQUENCE = TIME_SLOTS.flatMap((_, i) => Array(SLOT_COUNTS[i]).fill(i));
function isoDate(dayOffset, slotIndex) {
  const slot = TIME_SLOTS[slotIndex];
  const d = new Date();
  d.setDate(d.getDate() + 1 + dayOffset + slot.dayShift);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${slot.time}`;
}

async function dataUri(file, mime) { return `data:${mime};base64,${(await readFile(file)).toString("base64")}`; }
async function findByPrefix(dir, prefix) {
  const m = (await readdir(dir)).find((f) => f.startsWith(prefix));
  if (!m) throw new Error(`no file ${prefix}* in ${dir}`);
  return path.join(dir, m);
}

const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

function headSize(text) {
  const n = text.length;
  return n < 30 ? 128 : n < 60 ? 104 : 86;
}

function phone(src, { x, y, w, rot = 0, z = 5 }) {
  const r = Math.round(w * 0.12);
  return `<div class="phone" style="left:${x}px;top:${y}px;width:${w}px;height:${Math.round(w * 2.1)}px;border-radius:${r}px;transform:rotate(${rot}deg);z-index:${z}">
    <img src="${src}" style="border-radius:${r - 12}px"></div>`;
}
function paper(src, { x, y, w, rot = 0, z = 4 }) {
  return `<div class="paper" style="left:${x}px;top:${y}px;width:${w}px;transform:rotate(${rot}deg);z-index:${z}"><img src="${src}"></div>`;
}

function build(p, c, product, shell) {
  const [bgA, bgB, accent, ink] = PAL[p.pal];
  const head = esc(p.head);
  const size = headSize(p.head);
  const eyebrow = `<div class="eyebrow" style="color:${accent}">Maple &amp; Main Finds</div>`;
  const footer = `<div class="foot" style="color:${ink}"><span>${esc(product)}</span><span>${esc(DISCLOSURE)} ${esc(product)}.</span></div>`;
  const h = (style) => `<div class="head" style="color:${ink};font-size:${size}px;${style}">${head}</div>`;
  const bg = `background:radial-gradient(120% 90% at 85% 10%,${bgA} 0%,${bgB} 70%);`;
  const layers = `<div class="grain" style="background-image:${GRAIN}"></div>`;

  const phoneSrc = c.screens[p.screenIdx];
  const pageSrc = c.pages[p.pageIdx];
  let body = "";
  switch (p.layout) {
    case "poster":
      body = `${eyebrow}${h("left:80px;top:170px;right:80px")}
        ${phone(phoneSrc, { x: 520, y: 600, w: 340, rot: 4 })}
        ${paper(pageSrc, { x: 90, y: 700, w: 380, rot: -4, z: 3 })}`;
      break;
    case "split":
      body = `${eyebrow}${h("left:80px;top:170px;right:80px")}
        <div style="position:absolute;left:0;right:0;bottom:0;height:640px;background:${accent};opacity:0.12"></div>
        ${paper(pageSrc, { x: 150, y: 740, w: 480, rot: -3, z: 4 })}
        ${phone(phoneSrc, { x: 600, y: 680, w: 270, rot: 6, z: 6 })}`;
      break;
    case "centered":
      body = `${eyebrow}
        <div style="position:absolute;left:80px;right:80px;top:200px;text-align:center">${h("position:relative;text-align:center")}</div>
        <div style="position:absolute;left:50%;top:880px;width:140px;height:2px;background:${accent};transform:translateX(-50%)"></div>
        ${paper(pageSrc, { x: 250, y: 880, w: 380, rot: 0, z: 4 })}`;
      break;
    case "quote":
      body = `${eyebrow}
        <div style="position:absolute;left:80px;right:80px;top:330px;height:2px;background:${accent}"></div>
        ${h("left:80px;top:380px;right:80px")}
        ${phone(phoneSrc, { x: 350, y: 740, w: 280, rot: -3 })}`;
      break;
    case "two":
      body = `${eyebrow}${h("left:80px;top:170px;right:80px")}
        ${phone(phoneSrc, { x: 110, y: 640, w: 300, rot: -5, z: 5 })}
        ${phone(c.screens[(p.screenIdx + 1) % 3], { x: 520, y: 660, w: 300, rot: 5, z: 6 })}`;
      break;
    default:
      throw new Error(p.layout);
  }
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:1000px;height:1500px;overflow:hidden;font-family:Plex,sans-serif}
    @font-face{font-family:Newsreader;src:url(${shell.fonts.newsreader}) format('truetype');font-weight:400 800}
    @font-face{font-family:Plex;src:url(${shell.fonts.plex}) format('truetype');font-weight:400 700}
    .cv{width:1000px;height:1500px;position:relative;overflow:hidden;${bg}}
    .grain{position:absolute;inset:0;opacity:0.22;mix-blend-mode:multiply;pointer-events:none;z-index:2}
    .head{position:absolute;font-family:Newsreader;font-weight:800;line-height:0.96;letter-spacing:-0.025em;text-wrap:balance;z-index:8}
    .eyebrow{position:absolute;left:80px;top:72px;font-size:16px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;z-index:9}
    .foot{position:absolute;left:80px;right:80px;bottom:60px;display:flex;justify-content:space-between;font-size:15px;font-weight:600;z-index:9;border-top:1.5px solid ${accent};padding-top:18px}
    .phone{position:absolute;background:#0b0b0c;padding:12px;box-shadow:0 60px 110px -34px rgba(0,0,0,0.6),inset 0 0 0 2px #1d1d20;z-index:5}
    .phone img{display:block;width:100%;height:100%;object-fit:cover}
    .paper{position:absolute;background:#fbfaf6;box-shadow:0 2px 0 rgba(0,0,0,0.06),0 50px 90px -30px rgba(0,0,0,0.5);z-index:4}
    .paper img{display:block;width:100%;height:auto}
    .phone,.paper{transform-origin:center}
  </style></head><body><div class="cv">${body}${layers}${footer}</div></body></html>`;
}

async function main() {
  await mkdir(HOME_OUT, { recursive: true });
  await mkdir(TRAVEL_OUT, { recursive: true });
  await mkdir(CSV_OUT, { recursive: true });

  const fonts = {
    newsreader: await dataUri(path.join(FONTS_DIR, "Newsreader.ttf"), "font/ttf"),
    plex: await dataUri(path.join(FONTS_DIR, "IBMPlexSans.ttf"), "font/ttf"),
  };
  const load = async (product, key) => {
    const prefix = product === "home" ? "home-management-companion" : "travel-companion";
    const pageFile = (f) => findByPrefix(PAGES_DIR, `${prefix}-${f}`);
    const screen = (n) => findByPrefix(SCREENS_DIR, `${prefix}-${n}.`);
    const pages = [
      await dataUri(await pageFile("cover-"), "image/png"),
      await dataUri(await pageFile("flat1-"), "image/png"),
      await dataUri(await pageFile("flat2-"), "image/png"),
      await dataUri(await pageFile("signature-"), "image/png"),
    ];
    const screens = [0, 1, 2].map(async (n) => dataUri(await screen(n), "image/png"));
    return { pages, screens: await Promise.all(screens) };
  };
  const homeAssets = await load("home");
  const travelAssets = await load("travel");

  const browser = await chromium.launch();
  const pg = await browser.newPage({ viewport: { width: 1000, height: 1500 }, deviceScaleFactor: 2 });

  const jobs = [];
  HOME.forEach((p, i) => jobs.push({ p: { ...p, screenIdx: i % 3, pageIdx: i % 4 }, set: "home", n: i + 1, assets: homeAssets }));
  TRAVEL.forEach((p, i) => jobs.push({ p: { ...p, screenIdx: i % 3, pageIdx: (i + 1) % 4 }, set: "travel", n: i + 1, assets: travelAssets }));

  // Interleave the two sets so each day carries both products.
  const home = jobs.filter((j) => j.set === "home");
  const travel = jobs.filter((j) => j.set === "travel");
  const order = [];
  for (let i = 0; i < Math.max(home.length, travel.length); i++) {
    if (home[i]) order.push(home[i]);
    if (travel[i]) order.push(travel[i]);
  }

  const rows = [];
  for (let i = 0; i < order.length; i++) {
    const { p, set, n, assets } = order[i];
    const product = p.product;
    const shell = { fonts, assets: [], screens: assets.screens, pages: assets.pages };
    const html = build(p, { screens: assets.screens, pages: assets.pages }, product, shell);
    await pg.setContent(html, { waitUntil: "load" });
    await pg.evaluate(() => document.fonts.ready);
    const png = await pg.screenshot();
    const prefix = set === "home" ? "mm" : "tl";
    const outDir = set === "home" ? HOME_OUT : TRAVEL_OUT;
    const num = String(n).padStart(2, "0");
    await sharp(png).resize(2000, 3000).jpeg({ quality: 90, mozjpeg: true }).toFile(path.join(outDir, `${prefix}-${num}.jpg`));

    const utm = `utm_source=pinterest&utm_medium=organic_social&utm_campaign=${set === "home" ? "maple_home" : "maple_travel"}&utm_content=${prefix}-${num}`;
    const folder = set === "home" ? "pinterest-maple-main" : "pinterest-travel-luxe";
    const description = `${p.desc} ${DISCLOSURE} ${product}.`;
    rows.push([
      p.title,
      `${SITE}/store/${folder}/${prefix}-${num}.jpg`,
      p.board,
      description,
      `${SITE}/guides/${p.slug}?${utm}`,
      isoDate(Math.floor(i / PER_DAY), SLOT_SEQUENCE[i % PER_DAY]),
      "",
    ]);
    console.log(`${prefix}-${num}.jpg  [${p.layout}/${p.pal}]  ${p.head}`);
  }
  await browser.close();

  const header = ["Title", "Media URL", "Pinterest board", "Description", "Link", "Publish date", "Keywords"];
  await writeFile(path.join(CSV_OUT, "combined-31.csv"), csvRow(header) + rows.map(csvRow).join(""), "utf8");
  console.log(`csv: marketing/pinterest/maple-main/combined-31.csv (${rows.length} rows)`);
}

await main();
