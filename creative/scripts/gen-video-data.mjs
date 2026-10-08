#!/usr/bin/env node
/**
 * One-time generator for the 8 non-MMR products' feature-spotlight.shot.json
 * files: a 16s PROBLEM -> NOISE -> WORDMARK -> REVEAL (real screen) -> CTA
 * arc, reusing the "screen" beat kind (generic, any product) rather than
 * MMR's live-component beats. Copy is grounded in the same real
 * problemsSolved text already used for each product's feature-posts.json.
 */
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const FPS = 30;
const PRODUCTS = [
  {
    slug: "personal-finance-companion",
    name: "Personal Finance Companion",
    price: "$49",
    problem: ["Your money is", "scattered across", "five different apps."],
    noise: ["what did I spend?", "is that bill paid?", "what's left this month?"],
    reveal: { src: "screens/personal-finance-companion-records.png", caption: "One Available Money figure. Every number behind it, one tap away." },
  },
  {
    slug: "home-management-companion",
    name: "Home Base",
    price: "$49",
    problem: ["The filter size.", "The model number.", "None of it lives anywhere."],
    noise: ["when was it serviced?", "what size filter?", "who do I call?"],
    reveal: { src: "screens/home-management-companion-workspace.png", caption: "The expensive stuff, caught before it's a repair." },
  },
  {
    slug: "personal-life-affairs-companion",
    name: "Personal Life Affairs Companion",
    price: "$49",
    problem: ["You've meant to", "sort this out", "for years."],
    noise: ["where's the will?", "who do they call?", "where do I even start?"],
    reveal: { src: "screens/personal-life-affairs-companion-workspace.png", caption: "One question on screen, chosen for you. Not a blank folder." },
  },
  {
    slug: "homeschooling-companion",
    name: "Homeschooling Companion",
    price: "$34",
    problem: ["By March you", "can't remember", "October."],
    noise: ["did we cover that?", "is she keeping up?", "what's next?"],
    reveal: { src: "screens/homeschooling-companion-record.png", caption: "Kept as it happened. Not reconstructed in May." },
  },
  {
    slug: "alongside",
    name: "ADHD Life Companion",
    price: "$49",
    problem: ["Same thing on", "your mind for", "three weeks."],
    noise: ["still haven't called.", "where did I leave off?", "another thing undone."],
    reveal: { src: "screens/alongside-life.png", caption: "Everything you're holding, in one list. Never once says you failed." },
  },
  {
    slug: "travel-companion",
    name: "Travel Companion",
    price: "$34",
    problem: ["Confirmation numbers live", "in six different", "inboxes."],
    noise: ["which email had it?", "did the time change?", "what else moved?"],
    reveal: { src: "screens/travel-companion-trip.png", caption: "Record a change. Everything that depends on it, walked through." },
  },
  {
    slug: "vehicle-maintenance-companion",
    name: "Vehicle Maintenance Companion",
    price: "$34",
    problem: ["Nobody remembers the", "exact interval they", "were quoted."],
    noise: ["was it 5,000 miles?", "when was it last done?", "is this even due?"],
    reveal: { src: "screens/vehicle-maintenance-companion-vehicles.png", caption: "Type it in once. Keep it, editable, for good." },
  },
  {
    slug: "family-health-binder",
    name: "Family Health Binder",
    price: "$34",
    problem: ["Every form asks", "the same questions.", "You rebuild from memory."],
    noise: ["what are they allergic to?", "who's their doctor?", "what dose again?"],
    reveal: { src: "screens/family-health-binder-members.png", caption: "One card per person. Printed in the order the form asks." },
  },
];

for (const p of PRODUCTS) {
  const dir = path.resolve(process.cwd(), "shots", p.slug);
  await mkdir(dir, { recursive: true });
  const shot = {
    id: `feature-spotlight-${p.slug}`,
    product: p.slug,
    themeSlug: p.slug,
    format: "feature-spotlight",
    fps: FPS,
    width: 1080,
    height: 1920,
    beats: [
      {
        id: "problem", kind: "typography", startFrame: 0, durationFrames: 85,
        typography: { lines: p.problem },
        camera: { move: "static" }, transition: { out: "blurDissolve", frames: 15 },
        sound: { sfx: null }, caption: null,
      },
      {
        id: "noise", kind: "noise", startFrame: 85, durationFrames: 75,
        typography: { lines: p.noise },
        camera: { move: "static" }, transition: { in: "blurDissolve", out: "blurDissolve", frames: 15 },
        sound: { sfx: "whoosh-sweep" }, caption: null,
      },
      {
        id: "wordmark", kind: "wordmark", startFrame: 160, durationFrames: 70,
        typography: { eyebrow: "DRAFTPACE", headline: p.name },
        camera: { move: "static" }, transition: { in: "blurDissolve", frames: 15 },
        sound: { sfx: "chime-reveal" }, caption: null,
      },
      {
        id: "reveal", kind: "screen", startFrame: 230, durationFrames: 200,
        screen: { src: p.reveal.src },
        camera: { move: "pushIn", fromScale: 1.0, toScale: 1.07 },
        transition: { in: "blurDissolve", frames: 15 },
        sound: { sfx: "click-settle" }, caption: p.reveal.caption,
      },
      {
        id: "cta", kind: "cta", startFrame: 430, durationFrames: 50,
        typography: { headline: "Available now.", sub: `draftpace.com/shop · ${p.price}` },
        camera: { move: "static" }, transition: { in: "blurDissolve", frames: 15 },
        sound: { sfx: null }, cta: { label: "Shop", url: "draftpace.com/shop" },
      },
    ],
  };
  const file = path.join(dir, "feature-spotlight.shot.json");
  await writeFile(file, JSON.stringify(shot, null, 2) + "\n");
  console.log(`wrote ${file}`);
}
