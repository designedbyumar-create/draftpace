/**
 * Maple & Main Finds: two pastel design systems, one per product.
 *
 *   Home Base:      "Kitchen table" system. Rounded cards and soft blobs,
 *                   sage, blush, butter, lilac, sky, peach grounds.
 *   Travel Companion: "Postcard" system. Arched windows, ticket shapes and
 *                   champagne hairlines on ivory, blush, powder and sage.
 *
 * Every pin's headline is the reader's problem in plain words. Titles are
 * searchable. Descriptions say what the image shows, ask the reader to do
 * one thing, and carry the disclosure.
 *
 *   node scripts/run-tsx.mjs scripts/pinterest-maple-main/pastel.mjs
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
const PER_DAY = 15;

const HOME = [
  { slug: "winterize-your-house-checklist", board: "Seasonal Home Care", pal: "sky", layout: "card", asset: "flat2", screen: 0,
    title: "Winterizing Checklist: What to Do Before the First Freeze",
    head: "Winter is coming. Don't know what to do?",
    desc: "Frozen pipes and a cold house usually come from jobs left until the last minute. This page lists the freeze jobs in the order to do them. Read the winterizing checklist and pick a weekend before the first cold snap." },
  { slug: "how-often-change-furnace-filter", board: "Tiny Space Home Upkeep", pal: "butter", layout: "phone", asset: "flat1", screen: 1,
    title: "How Often to Change a Furnace Filter",
    head: "Your filter is due, and you can't remember the size.",
    desc: "The size is the one thing people forget, and it is the thing you need at the shop. This page shows how often to change the filter and how to write the size down once. Read the filter guide." },
  { slug: "where-is-my-water-shutoff", board: "Tiny Space Home Upkeep", pal: "sky", layout: "window", asset: "screen", screen: 0,
    title: "Where Is the Main Water Shutoff in Your Home?",
    head: "Something is dripping, and you don't know where to turn the water off.",
    desc: "When a pipe goes, minutes matter. This guide shows where the main valve usually is, how to tell a stuck valve, and the one page to write it on. Read where your shutoff is and make the note today." },
  { slug: "first-week-after-buying-a-house", board: "Home Binder Ideas", pal: "lilac", layout: "pair", asset: "screens01", screen: 0,
    title: "New House Checklist for the First Week",
    head: "You moved in last week, and nobody told you where anything is.",
    desc: "Shutoffs, meter readings, alarms and the inspection report are easy to lose in the first busy week. This checklist puts them in order. Read the first-week list and write down what you find." },
  { slug: "inherited-a-house-where-to-start", board: "Home Binder Ideas", pal: "peach", layout: "card", asset: "cover", screen: 1,
    title: "Inherited a House With No Records: Where to Start",
    head: "You inherited the house, and nobody left a single manual.",
    desc: "No service history and no idea how old the furnace is. This guide shows how to date what you have and what to check first. Read where to start with an inherited house." },
  { slug: "moving-into-a-rental-what-to-document", board: "Renter Move-In Checklists", pal: "sage", layout: "phone", asset: "flat2", screen: 2,
    title: "Renter Checklist: What to Document on Move-In Day",
    head: "Your landlord asks about the deposit, and you have no photos from day one.",
    desc: "Dated photos and a short log on the first day settle most deposit arguments later. This guide shows what to record before you unpack. Read the move-in checklist." },
  { slug: "how-to-find-the-model-number-on-any-appliance", board: "Home Binder Ideas", pal: "blush", layout: "window", asset: "cover", screen: 2,
    title: "How to Find the Model Number on Any Appliance",
    head: "The fridge died, and the warranty might still cover it.",
    desc: "The model number is on a label most people never look at, and the company will ask for it first. This guide shows where it hides on each appliance. Read how to find yours." },
  { slug: "appliance-warranties-what-to-track", board: "Home Binder Ideas", pal: "butter", layout: "pair", asset: "screens12", screen: 1,
    title: "How to Track Appliance Warranties Before a Repair",
    head: "Before you pay for that repair, check whether the warranty still covers it.",
    desc: "A warranty only helps if you know when it ends. This guide shows what to record at purchase and when to check the expiration date. Read the warranty guide." },
  { slug: "what-to-keep-after-a-home-repair", board: "Home Binder Ideas", pal: "peach", layout: "card", asset: "signature", screen: 0,
    title: "What to Keep After a Home Repair",
    head: "The repairman left, and you have no idea what he actually fixed.",
    desc: "An invoice says what you paid, not what was wrong or what comes next. This guide shows what to write down the same day. Read what to keep after a repair." },
  { slug: "home-maintenance-checklist-by-month", board: "Seasonal Home Care", pal: "sage", layout: "phone", asset: "cover", screen: 0,
    title: "Home Maintenance Checklist by Month",
    head: "Most months ask for nothing. October asks for everything.",
    desc: "One short list, month by month, with only the jobs that cause damage if skipped. See what this month needs and tap through to the full checklist." },
  { slug: "home-maintenance-you-skip-that-costs-the-most", board: "Tiny Space Home Upkeep", pal: "lilac", layout: "window", asset: "screen", screen: 1,
    title: "Home Maintenance Jobs That Cost the Most to Skip",
    head: "The small job you keep skipping is the one that turns into a big bill.",
    desc: "A normal delay turns some jobs into real damage. This guide lists nine of them, how often each is due, and what a missed one becomes. Read the nine jobs." },
  { slug: "fall-home-maintenance-checklist", board: "Seasonal Home Care", pal: "butter", layout: "pair", asset: "flat1", screen: 2,
    title: "Fall Home Maintenance Checklist by Month",
    head: "Autumn is here, and you don't know where to start.",
    desc: "September, October and November, in order, with heating and safety first and gutters last. Read the fall checklist and start with the first job." },
  { slug: "how-often-home-systems-need-servicing", board: "Seasonal Home Care", pal: "sky", layout: "phone", asset: "screen", screen: 2,
    title: "How Often Each Home System Needs Service",
    head: "Is it time for the boiler service? How do you know?",
    desc: "Service follows the system, not the calendar, and your own manual has the last word. This guide shows the usual intervals for heating, cooling, water and safety. Read how often each one needs a visit." },
  { slug: "how-to-make-a-home-binder", board: "Home Binder Ideas", pal: "lilac", layout: "card", asset: "flat1", screen: 1,
    title: "How to Make a Home Binder in One Afternoon",
    head: "Your house papers are in a drawer, a folder and your head.",
    desc: "One afternoon, five sections, and one category of thing that should never go in the binder. This guide shows how to build it. Read how to make a home binder." },
  { slug: "home-maintenance-log-template", board: "Home Binder Ideas", pal: "sage", layout: "window", asset: "signature", screen: 0,
    title: "Home Maintenance Log: What to Write Each Time",
    head: "Your maintenance history is in your head, and your head is full.",
    desc: "Date, what was done, who did it and what it cost. That is the whole log, and the examples show how much detail is enough. Read the log template." },
  { slug: "what-to-record-when-you-buy-an-appliance", board: "Home Binder Ideas", pal: "blush", layout: "pair", asset: "screen", screen: 0,
    title: "What to Write Down When You Buy an Appliance",
    head: "New appliance, and you're about to forget the one detail you'll need.",
    desc: "Brand, model, serial number, purchase date and warranty end, written while the machine is still in front of you. Read the five facts to write down." },
];

const TRAVEL = [
  { slug: "flight-delayed-with-a-connection-what-to-do-first", board: "Travel Problems and Fixes", pal: "blush", layout: "postcard", asset: "screen", screen: 0,
    title: "Flight Delayed With a Connection: What to Do First",
    head: "Your flight is delayed and your connection is about to go. What now?",
    desc: "A delay and a connection to catch means the next ten minutes matter. This guide shows the order to act in and what to ask for. Read the delay guide before you join the line." },
  { slug: "flight-changed-what-else-is-affected", board: "Trip Planning and Itineraries", pal: "powder", layout: "arch", asset: "screen", screen: 1,
    title: "Flight Changed? Check What Else Moved With It",
    head: "Your flight moved, and now your hotel check-in is wrong.",
    desc: "One change can quietly break the transfer, the check-in and the dinner you booked around it. This guide shows how to check each one. Read the trip checklist." },
  { slug: "hotel-cannot-find-your-reservation", board: "Travel Problems and Fixes", pal: "ivory", layout: "ticket", asset: "glance", screen: 0,
    title: "Hotel Cannot Find Your Reservation: What to Say",
    head: "The desk says there's no booking. Here is what to say.",
    desc: "Which references and names to try, what to ask for tonight, and the two sentences to open with at the counter. Read the hotel guide." },
  { slug: "lost-passport-wallet-or-phone-abroad-what-to-have-ready", board: "Travel Problems and Fixes", pal: "sage", layout: "pair", asset: "signature", screen: 1,
    title: "Lost Passport Abroad: What to Gather First",
    head: "Lost your passport abroad? Breathe, then do this first.",
    desc: "The order to act in, and what to have ready before you call anyone. Read the abroad guide before the next call." },
  { slug: "travel-document-checklist", board: "Travel Document Checklists", pal: "champagne", layout: "postcard", asset: "flat1", screen: 2,
    title: "Travel Document Checklist: Where Every Document Lives",
    head: "Four of you, one folder, and nobody knows where the passports are.",
    desc: "What each traveller needs, what to check months ahead, and where every document is kept. A phone photo is not a backup. Read the document checklist." },
  { slug: "first-international-trip-checklist", board: "Travel Document Checklists", pal: "powder", layout: "arch", asset: "screen", screen: 2,
    title: "First International Trip Checklist, in Order",
    head: "Your first trip abroad, and you don't know what to sort first.",
    desc: "Passport, entry rules, money, insurance and phone, in the order to sort them and how early. Check each rule at the source. Read the checklist." },
  { slug: "what-to-keep-on-paper-when-you-travel", board: "Travel Document Checklists", pal: "blush", layout: "ticket", asset: "flat2", screen: 0,
    title: "What to Print Before You Travel",
    head: "Your phone dies at the airport. Do you have the hotel address on paper?",
    desc: "The one page worth printing, including your hotel address in the local language, and why two copies beat one. Read the print list." },
  { slug: "night-before-you-travel-checklist", board: "Packing Lists", pal: "ivory", layout: "postcard", asset: "screen", screen: 1,
    title: "Night Before You Travel: The Fifteen-Minute Checklist",
    head: "The night before you fly, what have you forgotten?",
    desc: "Documents, cards, phone, the ride and the house, so the morning is only leaving. Read the night-before checklist." },
  { slug: "how-to-write-a-one-page-trip-itinerary", board: "Trip Planning and Itineraries", pal: "sage", layout: "arch", asset: "glance", screen: 0,
    title: "How to Write a One-Page Trip Itinerary",
    head: "Your trip plan lives in your head. Put it on one page.",
    desc: "A short itinerary in time order, with the reference beside each booking, plus a worked example. Read the itinerary guide." },
  { slug: "organising-a-multi-stop-trip-without-a-spreadsheet", board: "Trip Planning and Itineraries", pal: "powder", layout: "pair", asset: "screen", screen: 1,
    title: "Multi-Stop Trip Planning Without a Spreadsheet",
    head: "Stops, bookings, and one change you didn't plan for.",
    desc: "Four things to record per booking, in time order, so a change does not mean a full rebuild. Read the multi-stop guide." },
  { slug: "road-trip-planning-checklist", board: "Trip Planning and Itineraries", pal: "champagne", layout: "ticket", asset: "flat1", screen: 2,
    title: "Road Trip Planning Checklist: Stops, Stays and the Car",
    head: "A road trip with no plan for the hours or the car check.",
    desc: "Hours per day, stays with their references, the car check, who drives when, and what stays within reach. Read the road trip checklist." },
  { slug: "how-to-plan-a-group-trip", board: "Family Travel Planning", pal: "blush", layout: "pair", asset: "screens12", screen: 2,
    title: "How to Plan a Group Trip Without Doing Everything",
    head: "You're organising the trip, and you're the only one who knows the plan.",
    desc: "Decide who books what, who is on each booking, and where the answers live. Read how to plan a group trip." },
  { slug: "packing-list-for-a-week-away", board: "Packing Lists", pal: "sage", layout: "postcard", asset: "flat2", screen: 2,
    title: "Packing List for a Week Away, Split by Person",
    head: "A week away, and nobody knows who packs what.",
    desc: "What every trip needs, what this one asks for, split by person and checked by category. Read the packing list." },
  { slug: "carry-on-only-packing-list", board: "Packing Lists", pal: "powder", layout: "ticket", asset: "screen", screen: 0,
    title: "Carry-On Only Packing List",
    head: "One carry-on bag, and you're hoping it all fits.",
    desc: "Choose the bag first, pack to the list, and check size and weight on your airline's own page before you go. Read the carry-on list." },
  { slug: "packing-and-planning-for-a-trip-with-kids-or-a-baby", board: "Family Travel Planning", pal: "champagne", layout: "arch", asset: "signature", screen: 1,
    title: "Travelling With Kids or a Baby: What to Pack Per Child",
    head: "Travelling with a baby, and you're packing for everyone except yourself.",
    desc: "What to pack per child and by age, the paperwork to note for each, and room in the day for a bad one. Read the family travel guide." },
];

const HOME_PAL = {
  sage: { bg: "#dfe9dc", card: "#f5f8f2", ink: "#2c3a30", accent: "#6f8f76" },
  blush: { bg: "#f7e1dc", card: "#fcf3f0", ink: "#4a2e2a", accent: "#b97e72" },
  butter: { bg: "#f7efcf", card: "#fcf8e8", ink: "#4a4020", accent: "#b59a3c" },
  lilac: { bg: "#e8e1f2", card: "#f6f2fb", ink: "#3a3050", accent: "#8a78ad" },
  sky: { bg: "#dde9f3", card: "#f3f8fc", ink: "#243646", accent: "#5f87a6" },
  peach: { bg: "#fbe3d0", card: "#fdf4ec", ink: "#4a3020", accent: "#c8875c" },
};
const TRAVEL_PAL = {
  ivory: { bg: "#faf6ee", card: "#ffffff", ink: "#2b2a33", accent: "#c9a46a" },
  blush: { bg: "#f6dfd9", card: "#fdf4f1", ink: "#3d2a2c", accent: "#c9a46a" },
  powder: { bg: "#dbe7ef", card: "#f4f9fc", ink: "#24323f", accent: "#b8966a" },
  sage: { bg: "#e2ebe2", card: "#f5f9f4", ink: "#2a3a2f", accent: "#b8966a" },
  champagne: { bg: "#f3e7cf", card: "#fcf7ec", ink: "#3a2f22", accent: "#b08a50" },
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const csvField = (v) => { const s = String(v ?? ""); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const csvRow = (vals) => vals.map(csvField).join(",") + "\r\n";
const TIME_SLOTS = [
  { time: "17:00:00", dayShift: 0 }, { time: "21:30:00", dayShift: 0 }, { time: "00:00:00", dayShift: 1 },
  { time: "04:00:00", dayShift: 1 }, { time: "06:00:00", dayShift: 1 },
];
const SLOT_COUNTS = [2, 3, 3, 3, 4];
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

function phone(src, { x, y, w, rot = 0, z = 6 }) {
  const r = Math.round(w * 0.12);
  return `<div class="phone" style="left:${x}px;top:${y}px;width:${w}px;height:${Math.round(w * 2.1)}px;border-radius:${r}px;transform:rotate(${rot}deg);z-index:${z}"><img src="${src}" style="border-radius:${r - 12}px"></div>`;
}
function paper(src, { x, y, w, rot = 0, z = 5 }) {
  return `<div class="paper" style="left:${x}px;top:${y}px;width:${w}px;transform:rotate(${rot}deg);z-index:${z}"><img src="${src}"></div>`;
}
function headSize(text) { return text.length < 36 ? 104 : text.length < 62 ? 90 : 76; }

function pageCss(fonts, pal) {
  return `
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:1000px;height:1500px;overflow:hidden;font-family:Plex,sans-serif}
    @font-face{font-family:Newsreader;src:url(${fonts.newsreader}) format('truetype');font-weight:400 800}
    @font-face{font-family:Plex;src:url(${fonts.plex}) format('truetype');font-weight:400 700}
    .cv{width:1000px;height:1500px;position:relative;overflow:hidden;background:${pal.bg};color:${pal.ink}}
    .head{position:absolute;font-family:Newsreader;font-weight:700;letter-spacing:-0.02em;line-height:1.02;text-wrap:balance;z-index:8}
    .label{position:absolute;left:80px;top:72px;font-size:16px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${pal.accent};z-index:9}
    .foot{position:absolute;left:80px;right:80px;bottom:60px;display:flex;justify-content:space-between;font-size:15px;font-weight:600;color:${pal.ink};z-index:9}
    .phone{position:absolute;background:#15151a;padding:12px;box-shadow:0 50px 90px -30px rgba(40,30,20,0.35);z-index:6}
    .phone img{display:block;width:100%;height:100%;object-fit:cover}
    .paper{position:absolute;background:#fbfaf6;box-shadow:0 2px 0 rgba(0,0,0,0.04),0 46px 80px -30px rgba(40,30,20,0.35);z-index:5}
    .paper img{display:block;width:100%;height:auto}
    .blob{position:absolute;border-radius:50%;z-index:1}
    .card{position:absolute;border-radius:44px;z-index:2;box-shadow:0 30px 60px -30px rgba(40,30,20,0.25)}
  `;
}

function homeBody(p, c, pal) {
  const size = headSize(p.head);
  const head = (style) => `<div class="head" style="font-size:${size}px;${style}">${esc(p.head)}</div>`;
  const label = `<div class="label">Maple &amp; Main Finds</div>`;
  const pageSrc = c.pages[p.asset] || c.pages.cover;
  const screenSrc = c.screens[p.screen];
  const foot = `<div class="foot"><span>Home Base, $49 once</span><span>Made by Draftpace, the maker of Home Base.</span></div>`;
  switch (p.layout) {
    case "card":
      return `${label}
        <div class="blob" style="left:560px;top:820px;width:720px;height:720px;background:${pal.card};opacity:0.7"></div>
        <div class="card" style="left:90px;top:620px;width:820px;height:700px;background:${pal.card}"></div>
        ${head("left:80px;top:150px;right:80px")}
        ${paper(pageSrc, { x: 180, y: 680, w: 480, rot: -4, z: 4 })}
        ${phone(screenSrc, { x: 620, y: 760, w: 260, rot: 5, z: 6 })}${foot}`;
    case "phone":
      return `${label}
        <div class="blob" style="left:180px;top:500px;width:640px;height:640px;background:${pal.card}"></div>
        ${head("left:80px;top:150px;right:80px")}
        ${phone(screenSrc, { x: 300, y: 620, w: 330, rot: -3, z: 6 })}
        ${paper(pageSrc, { x: 70, y: 980, w: 260, rot: -8, z: 4 })}${foot}`;
    case "window":
      return `${label}
        <div class="card" style="left:80px;top:500px;width:840px;height:880px;border-radius:260px 260px 44px 44px;background:${pal.card}"></div>
        ${head("left:80px;top:150px;right:80px")}
        ${phone(screenSrc, { x: 350, y: 640, w: 300, rot: 3, z: 6 })}
        ${paper(pageSrc, { x: 130, y: 760, w: 250, rot: -7, z: 4 })}${foot}`;
    case "pair":
      return `${label}
        <div class="blob" style="left:-120px;top:900px;width:620px;height:620px;background:${pal.card}"></div>
        <div class="blob" style="left:520px;top:720px;width:560px;height:560px;background:${pal.card};opacity:0.8"></div>
        ${head("left:80px;top:150px;right:80px")}
        ${paper(pageSrc, { x: 90, y: 760, w: 380, rot: -5, z: 4 })}
        ${phone(screenSrc, { x: 540, y: 700, w: 300, rot: 6, z: 6 })}${foot}`;
    default:
      throw new Error(p.layout);
  }
}

function travelBody(p, c, pal) {
  const size = headSize(p.head);
  const head = (style) => `<div class="head" style="font-size:${size}px;${style}">${esc(p.head)}</div>`;
  const label = `<div class="label">Maple &amp; Main Finds</div>`;
  const pageSrc = c.pages[p.asset] || c.pages.cover;
  const screenSrc = c.screens[p.screen];
  const foot = `<div class="foot"><span>Travel Companion, $34 once</span><span>Made by Draftpace, the maker of Travel Companion.</span></div>`;
  const frame = `<div style="position:absolute;inset:46px;border:1.5px solid ${pal.accent};opacity:0.75;z-index:3"></div>`;
  switch (p.layout) {
    case "postcard":
      return `${frame}${label}
        ${head("left:120px;top:190px;right:120px;text-align:center")}
        ${paper(pageSrc, { x: 230, y: 700, w: 540, rot: -2, z: 5 })}
        ${foot}`;
    case "arch":
      return `${label}
        ${head("left:80px;top:150px;right:80px")}
        <div class="card" style="left:150px;top:560px;width:700px;height:860px;border-radius:350px 350px 40px 40px;background:${pal.card};border:1.5px solid ${pal.accent}"></div>
        ${phone(screenSrc, { x: 320, y: 640, w: 360, rot: 0, z: 6 })}${foot}`;
    case "ticket":
      return `${label}
        ${head("left:80px;top:150px;right:80px")}
        <div class="card" style="left:90px;top:590px;width:820px;height:800px;border-radius:30px;background:${pal.card}"></div>
        <div style="position:absolute;left:110px;right:110px;top:1070px;border-top:2px dashed ${pal.accent};z-index:4"></div>
        ${paper(pageSrc, { x: 190, y: 640, w: 480, rot: -2, z: 5 })}
        ${phone(screenSrc, { x: 560, y: 700, w: 260, rot: 4, z: 6 })}${foot}`;
    case "pair":
      return `${label}
        ${head("left:80px;top:150px;right:80px")}
        ${phone(screenSrc, { x: 90, y: 680, w: 320, rot: -5, z: 6 })}
        ${phone(c.screens[(p.screen + 1) % 3], { x: 540, y: 700, w: 320, rot: 5, z: 7 })}${foot}`;
    default:
      throw new Error(p.layout);
  }
}

async function main() {
  await mkdir(HOME_OUT, { recursive: true });
  await mkdir(TRAVEL_OUT, { recursive: true });
  await mkdir(CSV_OUT, { recursive: true });

  const fonts = {
    newsreader: await dataUri(path.join(FONTS_DIR, "Newsreader.ttf"), "font/ttf"),
    plex: await dataUri(path.join(FONTS_DIR, "IBMPlexSans.ttf"), "font/ttf"),
  };
  async function load(prefix) {
    const f = (x) => findByPrefix(PAGES_DIR, `${prefix}-${x}`);
    const s = (n) => findByPrefix(SCREENS_DIR, `${prefix}-${n}.`);
    const pages = {
      cover: await dataUri(await f("cover-"), "image/png"),
      flat1: await dataUri(await f("flat1-"), "image/png"),
      flat2: await dataUri(await f("flat2-"), "image/png"),
      signature: await dataUri(await f("signature-"), "image/png"),
      glance: await dataUri(await f("glance-").catch(() => f("cover-")), "image/png"),
    };
    const screens = [];
    for (let n = 0; n < 3; n++) screens.push(await dataUri(await s(n), "image/png"));
    return { pages, screens };
  }
  const home = await load("home-management-companion");
  const travel = await load("travel-companion");

  const browser = await chromium.launch();
  const pg = await browser.newPage({ viewport: { width: 1000, height: 1500 }, deviceScaleFactor: 2 });

  // Interleave the two products so every day carries both.
  const items = [];
  const maxLen = Math.max(HOME.length, TRAVEL.length);
  for (let i = 0; i < maxLen; i++) {
    if (HOME[i]) items.push({ p: HOME[i], set: "home", n: i + 1 });
    if (TRAVEL[i]) items.push({ p: TRAVEL[i], set: "travel", n: i + 1 });
  }

  const rows = [];
  for (let i = 0; i < items.length; i++) {
    const { p, set, n } = items[i];
    const isHome = set === "home";
    const assets = isHome ? home : travel;
    const pal = isHome ? HOME_PAL[p.pal] : TRAVEL_PAL[p.pal];
    const body = isHome ? homeBody(p, assets, pal) : travelBody(p, assets, pal);
    const css = pageCss(fonts, pal);
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><div class="cv">${body}</div></body></html>`;
    await pg.setContent(html, { waitUntil: "load" });
    await pg.evaluate(() => document.fonts.ready);
    const png = await pg.screenshot();

    const prefix = isHome ? "mm" : "tl";
    const outDir = isHome ? HOME_OUT : TRAVEL_OUT;
    const folder = isHome ? "pinterest-maple-main" : "pinterest-travel-luxe";
    const num = String(n).padStart(2, "0");
    await sharp(png).resize(2000, 3000).jpeg({ quality: 90, mozjpeg: true }).toFile(path.join(outDir, `${prefix}-${num}.jpg`));

    const utm = `utm_source=pinterest&utm_medium=organic_social&utm_campaign=${isHome ? "maple_home" : "maple_travel"}&utm_content=${prefix}-${num}`;
    const product = isHome ? "Home Base" : "Travel Companion";
    rows.push([
      p.title,
      `${SITE}/store/${folder}/${prefix}-${num}.jpg`,
      p.board,
      `${p.desc} Made by Draftpace, the maker of ${product}.`,
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
