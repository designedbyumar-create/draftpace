/**
 * Rebuilds the WealthDrafts CSV's titles, descriptions, boards and links
 * around Pinterest search terms, without re-rendering any image. Reads the
 * approved combined-100.csv, keeps each row's Media URL and publish date,
 * and writes combined-100-keyworded.csv.
 *
 *   node scripts/pinterest-wealthdrafts/keywords-csv.mjs
 *
 * Keywords come from Pinterest search suggestions (debt payoff tracker,
 * bill tracker printable, sinking funds, safe to spend calculator and so on).
 * Each title leads with its keyword; each description opens with the
 * searcher's question, then says what the image shows, then the call to
 * action and the disclosure.
 *
 * Links: Personal Finance Companion pins go to their guide, then the product
 * CTA. Monthly Money Reset pins go to /free, the free-entry funnel, since
 * the product is free.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SRC = path.resolve(process.cwd(), "marketing/pinterest/wealthdrafts/combined-100.csv");
const DST = path.resolve(process.cwd(), "marketing/pinterest/wealthdrafts/combined-100-keyworded.csv");
const SITE = "https://draftpace.com";

// Topic groups: each has a board name, a keyword pool and a searcher question.
const GROUPS = {
  debt: { board: "Debt Payoff Tracker Ideas", keys: ["debt payoff tracker", "debt payoff planner", "debt snowball plan", "credit card debt payoff plan"] },
  bills: { board: "Bill Tracker Printables", keys: ["bill tracker printable", "monthly bills list", "bill payment tracker"] },
  subs: { board: "Subscription Tracker Ideas", keys: ["subscription tracker", "how to cancel subscriptions", "annual subscriptions list"] },
  sinking: { board: "Sinking Funds Ideas", keys: ["sinking funds", "sinking fund categories", "savings goal tracker"] },
  split: { board: "Splitting Bills Ideas", keys: ["split bills with roommate", "shared expenses tracker", "couples money tracker"] },
  budget: { board: "Monthly Budget Planner Ideas", keys: ["monthly budget template", "budget planner printable", "personal budget spreadsheet", "budget for beginners"] },
  finance: { board: "Personal Finance Template Ideas", keys: ["personal finance template", "financial binder printable", "money tracker printable"] },
  safe: { board: "Safe to Spend Budget Tips", keys: ["safe to spend calculator", "how much can I spend this month", "safe to spend budget"] },
  checkin: { board: "Weekly Money Check-In Ideas", keys: ["weekly money check in", "monthly budget reset", "budget reset"] },
  irregular: { board: "Irregular Income Budgeting", keys: ["irregular income budget", "budget for freelancers", "budget for variable income"] },
  afford: { board: "Can I Afford It Budget Tips", keys: ["can I afford it calculator", "budget before buying", "big purchase budget"] },
};

// Map a guide slug to its group. Order matters: the first match wins.
function groupFor(slug) {
  if (/debt|minimum-payments|snowball/.test(slug)) return "debt";
  if (/subscription/.test(slug)) return "subs";
  if (/sinking|emergency-fund|savings/.test(slug)) return "sinking";
  if (/split-bills|roommate|partner/.test(slug)) return "split";
  if (/direct-debit|monthly-bills|bills/.test(slug)) return "bills";
  if (/safe-to-spend|afford|available-balance/.test(slug)) return "safe";
  if (/irregular|freelance|bonus|budget-for-variable/.test(slug)) return "irregular";
  if (/afford-it|purchase/.test(slug)) return "afford";
  if (/end-of-month|start-over|budget-failure|apps-stop|review/.test(slug)) return "checkin";
  if (/budget|50-30-20|beginners|typical/.test(slug)) return "budget";
  return "finance";
}


function csvField(v) { const s = String(v ?? ""); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }
const csvRow = (vals) => vals.map(csvField).join(",") + "\r\n";

function parse(text) {
  const rows = []; let row = []; let f = ""; let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { f += '"'; i++; } else if (c === '"') q = false; else f += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n") { row.push(f); rows.push(row); row = []; f = ""; }
    else if (c !== "\r") f += c;
  }
  return rows.filter((r) => r.length > 1);
}

async function main() {
  const rows = parse(await readFile(SRC, "utf8")).slice(1);
  const used = {};
  const out = [["Title", "Media URL", "Pinterest board", "Description", "Link", "Publish date", "Keywords"]];
  const titles = new Set();

  rows.forEach((r, i) => {
    const [oldTitle, mediaUrl, , oldDesc, oldLink, publishDate] = r;
    const isPfc = /\/pfc-\d+\.jpg$/.test(mediaUrl);
    const num = mediaUrl.match(/-(\d+)\.jpg$/)[1];
    const slugMatch = oldLink.match(/\/guides\/([^?]+)/);
    const slug = slugMatch ? slugMatch[1] : "";
    const groupKey = groupFor(slug);
    const group = GROUPS[groupKey];

    // Rotate keywords within a group so a board's pins do not all repeat one term.
    used[groupKey] = (used[groupKey] || 0);
    const keyword = group.keys[used[groupKey] % group.keys.length];
    used[groupKey]++;

    // Keep the problem angle from the approved title as the subtitle.
    const angle = oldTitle.replace(/^[^:]*:\s*/, "").trim();
    let title = `${keyword.replace(/\b\w/g, (c) => c.toUpperCase())}: ${oldTitle.includes(":") ? angle : oldTitle}`;
    if (title.length > 100) title = title.slice(0, 97).replace(/\s+\S*$/, "") + "...";
    while (titles.has(title)) title = title.replace(/\.\.\.$/, "") + " (" + num + ")";
    titles.add(title);

    const descBody = oldDesc
      .replace(/\s*Read the guide, then see how Personal Finance Companion works\.\s*/, " ")
      .replace(/\s*Read the guide, then get Monthly Money Reset free\.\s*/, " ")
      .replace(/\s*Made by Draftpace, the maker of .*$/, "")
      .trim();

    let link, cta, disclosure;
    if (isPfc) {
      link = `${SITE}/guides/${slug}`;
      cta = "Read the guide, then see how Personal Finance Companion works.";
      disclosure = "Made by Draftpace, the maker of Personal Finance Companion.";
    } else {
      link = `${SITE}/free`;
      cta = "Get Monthly Money Reset free, with no card.";
      disclosure = "Made by Draftpace, the maker of Monthly Money Reset.";
    }
    const utm = `utm_source=pinterest&utm_medium=organic_social&utm_campaign=${isPfc ? "wealthdrafts_pfc" : "wealthdrafts_mmr"}&utm_content=${isPfc ? "pfc" : "mmr"}-${num}`;
    const question = `Looking for a ${keyword}? `;
    let description = `${question}${descBody} ${cta} ${disclosure}`;
    if (description.length > 500) description = description.slice(0, 497) + "...";

    out.push([title, mediaUrl, group.board, description, `${link}?${utm}`, publishDate, keyword]);
  });

  await writeFile(DST, out.map(csvRow).join(""), "utf8");
  console.log(`wrote ${out.length - 1} rows to marketing/pinterest/wealthdrafts/combined-100-keyworded.csv`);
  console.log(`unique titles: ${titles.size}`);
}

await main();
