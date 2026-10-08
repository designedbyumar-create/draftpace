#!/usr/bin/env node
/**
 * One-time generator for the 8 non-MMR products' feature-posts.json files.
 * Headlines are tightened/line-broken from the real problemsSolved.problem
 * text in marketing/product-reference/data/products.json (grounded, not
 * invented), screens are real files already copied into public/screens/.
 * Run once; the output JSON files are the actual source of truth after
 * this, editable by hand like any other shot/post file.
 */
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const PRODUCTS = [
  {
    slug: "personal-finance-companion",
    name: "Personal Finance Companion",
    price: "$49",
    posts: [
      { id: "01", layout: "tilt", headline: ["Your money is", "scattered across", "five different apps."], ui: { kind: "screen", src: "screens/personal-finance-companion-records.png" } },
      { id: "02", layout: "window", headline: ["You have no idea", "when a debt will", "actually be gone."], ui: { kind: "screen", src: "screens/personal-finance-companion-debt.png" } },
      { id: "03", layout: "tilt", headline: ["Which bills have", "you actually paid", "this month?"], ui: { kind: "screen", src: "screens/personal-finance-companion-bills.png" } },
      { id: "04", layout: "window", headline: ["What does a normal", "month actually look like,", "once it's counted?"], ui: { kind: "screen", src: "screens/personal-finance-companion-printables.png" } },
    ],
  },
  {
    slug: "home-management-companion",
    name: "Home Base",
    price: "$49",
    posts: [
      { id: "01", layout: "tilt", headline: ["The filter size.", "The model number.", "None of it lives anywhere."], ui: { kind: "screen", src: "screens/home-management-companion-workspace.png" } },
      { id: "02", layout: "window", headline: ["The expensive stuff", "gets caught too late,", "as a repair."], ui: { kind: "screen", src: "screens/home-management-companion-workspace.png" } },
      { id: "03", layout: "tilt", headline: ["Seasonal work gets", "remembered a year", "too late."], ui: { kind: "screen", src: "screens/home-management-companion-seasons.png" } },
      { id: "04", layout: "window", headline: ["Who came out.", "What they did.", "What it cost."], ui: { kind: "screen", src: "screens/home-management-companion-history.png" } },
    ],
  },
  {
    slug: "personal-life-affairs-companion",
    name: "Personal Life Affairs Companion",
    price: "$49",
    posts: [
      { id: "01", layout: "tilt", headline: ["You've meant to", "sort this out", "for years."], ui: { kind: "screen", src: "screens/personal-life-affairs-companion-workspace.png" } },
      { id: "02", layout: "window", headline: ["What costs the most", "to leave undone?", "You don't actually know."], ui: { kind: "screen", src: "screens/personal-life-affairs-companion-affairs.png" } },
      { id: "03", layout: "tilt", headline: ["Things written down once", "quietly stop", "being true."], ui: { kind: "screen", src: "screens/personal-life-affairs-companion-affairs.png" } },
      { id: "04", layout: "window", headline: ["Not a login", "they'd have to", "inherit."], ui: { kind: "screen", src: "screens/personal-life-affairs-companion-printables.png" } },
    ],
  },
  {
    slug: "homeschooling-companion",
    name: "Homeschooling Companion",
    price: "$34",
    posts: [
      { id: "01", layout: "tilt", headline: ["By March you", "can't remember", "October."], ui: { kind: "screen", src: "screens/homeschooling-companion-record.png" } },
      { id: "02", layout: "window", headline: ["Did it actually", "land? You're", "not sure."], ui: { kind: "screen", src: "screens/homeschooling-companion-workspace.png" } },
      { id: "03", layout: "tilt", headline: ["Keeping two kids'", "records straight", "stopped working."], ui: { kind: "screen", src: "screens/homeschooling-companion-kids.png" } },
      { id: "04", layout: "window", headline: ["Something to show.", "Not a system", "that gets abandoned."], ui: { kind: "screen", src: "screens/homeschooling-companion-record.png" } },
    ],
  },
  {
    slug: "alongside",
    name: "ADHD Life Companion",
    price: "$49",
    posts: [
      { id: "01", layout: "tilt", headline: ["Same thing on", "your mind for", "three weeks."], ui: { kind: "screen", src: "screens/alongside-workspace.png" } },
      { id: "02", layout: "window", headline: ["A to-do list", "becomes a longer", "thing to feel behind on."], ui: { kind: "screen", src: "screens/alongside-life.png" } },
      { id: "03", layout: "tilt", headline: ["Half finished,", "and you lost", "where you were."], ui: { kind: "screen", src: "screens/alongside-help.png" } },
      { id: "04", layout: "window", headline: ["Every system tells", "you that you've", "failed at it."], ui: { kind: "screen", src: "screens/alongside-life.png" } },
    ],
  },
  {
    slug: "travel-companion",
    name: "Travel Companion",
    price: "$34",
    posts: [
      { id: "01", layout: "tilt", headline: ["Confirmation numbers live", "in six different", "inboxes."], ui: { kind: "screen", src: "screens/travel-companion-itinerary.png" } },
      { id: "02", layout: "window", headline: ["Your flight moved.", "What else moved", "with it?"], ui: { kind: "screen", src: "screens/travel-companion-trip.png" } },
      { id: "03", layout: "tilt", headline: ["Phone's at 4%.", "That's the only", "copy of the plan."], ui: { kind: "screen", src: "screens/travel-companion-printables.png" } },
      { id: "04", layout: "window", headline: ["What's actually", "happening today,", "versus just noise."], ui: { kind: "screen", src: "screens/travel-companion-workspace.png" } },
    ],
  },
  {
    slug: "vehicle-maintenance-companion",
    name: "Vehicle Maintenance Companion",
    price: "$34",
    posts: [
      { id: "01", layout: "tilt", headline: ["Nobody remembers the", "exact interval they", "were quoted."], ui: { kind: "screen", src: "screens/vehicle-maintenance-companion-vehicles.png" } },
      { id: "02", layout: "window", headline: ["Inherited the car.", "Not the service", "history."], ui: { kind: "screen", src: "screens/vehicle-maintenance-companion-vehicles.png" } },
      { id: "03", layout: "tilt", headline: ["\"While we had it", "up on the lift\"", "just got expensive."], ui: { kind: "screen", src: "screens/vehicle-maintenance-companion-printables.png" } },
      { id: "04", layout: "window", headline: ["You have no proof", "the car was", "looked after."], ui: { kind: "screen", src: "screens/vehicle-maintenance-companion-history.png" } },
    ],
  },
  {
    slug: "family-health-binder",
    name: "Family Health Binder",
    price: "$34",
    posts: [
      { id: "01", layout: "tilt", headline: ["Every form asks", "the same questions.", "You rebuild from memory."], ui: { kind: "screen", src: "screens/family-health-binder-members.png" } },
      { id: "02", layout: "window", headline: ["A text message", "is not enough", "for a sitter."], ui: { kind: "screen", src: "screens/family-health-binder-printables.png" } },
      { id: "03", layout: "tilt", headline: ["When did it", "start? You're guessing,", "under pressure."], ui: { kind: "screen", src: "screens/family-health-binder-workspace.png" } },
      { id: "04", layout: "window", headline: ["The questions vanish", "the moment you", "sit down."], ui: { kind: "screen", src: "screens/family-health-binder-printables.png" } },
    ],
  },
];

for (const product of PRODUCTS) {
  const dir = path.resolve(process.cwd(), "shots", product.slug);
  await mkdir(dir, { recursive: true });
  const data = {
    id: `feature-posts-${product.slug}`,
    posts: product.posts.map((p) => ({
      id: `${p.id}-${product.slug}`,
      themeSlug: product.slug,
      layout: p.layout,
      eyebrow: product.name.toUpperCase(),
      headline: p.headline,
      ui: p.ui,
      product: { name: product.name, price: product.price },
    })),
  };
  const file = path.join(dir, "feature-posts.json");
  await writeFile(file, JSON.stringify(data, null, 2) + "\n");
  console.log(`wrote ${file}`);
}
