/**
 * Builds the 9 real Pinterest bulk-upload CSVs from the pre-built
 * planning sheets at ~/Documents/Draftpace Pinterest Assets/pins/, with
 * zero edits to title/description/board/link copy (per instruction:
 * the pins are final, this only reshapes and hosts them).
 *
 *   node scripts/pinterest-pins-host/build-csvs.mjs
 *
 * Planning sheet columns: pin,title,plan_on_pin_text,cta,description,
 * destination_url,board,alt_text,status,image_file
 * Pinterest's real bulk-upload columns: Title,Media URL,Pinterest board,
 * Description,Link,Publish date,Keywords
 *
 * Media URL points at the hosted JPEGs this same directory's convert.mjs
 * produces (public/store/pinterest-pins/<product>/pin-X.Y.jpg), which
 * only resolve publicly once this is deployed, not on localhost.
 *
 * Publish date: 5 pins/day across all 9 products, interleaved (not
 * product-by-product), weighted so stronger-audience products (per the
 * Medium tag research) appear earlier and more often, starting
 * tomorrow. ISO 8601, 9:00 local server time, 90 days to clear all 450.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const SRC_ROOT = "/Users/user/Documents/Draftpace Pinterest Assets/pins";
const OUT_ROOT = path.resolve(process.cwd(), "marketing/pinterest/csv");
const SITE_URL = "https://draftpace.com";

const PRODUCT_FOLDERS = ["pfc", "homebase", "adhd", "homeschool", "ple", "travel", "vehicle", "health", "mmr"];

// Tier weighting from the Medium research (same real tag-strength logic),
// higher weight = appears more often across the 90-day cycle.
const WEIGHT = { pfc: 3, adhd: 3, health: 3, ple: 2, travel: 2, homeschool: 2, mmr: 2, homebase: 1, vehicle: 1 };

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c === "\r") { /* skip */ }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.length > 1 || r[0] !== "");
}

function csvField(value) {
  const v = String(value ?? "");
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function csvRow(values) {
  return values.map(csvField).join(",") + "\r\n";
}

async function loadProduct(folder) {
  const dir = path.join(SRC_ROOT, folder);
  const files = await (await import("node:fs/promises")).readdir(dir);
  const csvName = files.find((f) => f.endsWith("upload_sheet.csv"));
  const text = await readFile(path.join(dir, csvName), "utf8");
  const rows = parseCsv(text);
  const header = rows[0];
  const idx = Object.fromEntries(header.map((h, i) => [h.trim(), i]));
  return rows.slice(1).map((r) => ({
    pin: r[idx.pin],
    title: r[idx.title],
    description: r[idx.description],
    destination_url: r[idx.destination_url],
    board: r[idx.board],
    alt_text: r[idx.alt_text],
    status: r[idx.status],
    image_file: r[idx.image_file],
  }));
}

function buildSchedule(productCounts) {
  // Round-robin weighted queue: repeat each product's folder name
  // WEIGHT times per cycle, draw 5 per day until every product's rows
  // are exhausted.
  const cycle = [];
  for (const [folder, w] of Object.entries(WEIGHT)) for (let i = 0; i < w; i++) cycle.push(folder);

  const remaining = { ...productCounts };
  const schedule = []; // array of {folder, dayIndex}
  let cyclePos = 0;
  let day = 0;
  let today = [];
  const totalRemaining = () => Object.values(remaining).reduce((a, b) => a + b, 0);

  while (totalRemaining() > 0) {
    let attempts = 0;
    while (today.length < 5 && attempts < cycle.length * 2) {
      const folder = cycle[cyclePos % cycle.length];
      cyclePos++;
      attempts++;
      if (remaining[folder] > 0) {
        today.push(folder);
        remaining[folder]--;
      }
    }
    if (today.length === 0) break; // safety
    for (const folder of today) schedule.push({ folder, day });
    today = [];
    day++;
  }
  return schedule; // schedule.length === sum(productCounts), in day order
}

function isoDate(dayOffset) {
  const d = new Date();
  d.setDate(d.getDate() + 1 + dayOffset); // start tomorrow
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T09:00:00`;
}

async function main() {
  await mkdir(OUT_ROOT, { recursive: true });

  const allRows = {};
  for (const folder of PRODUCT_FOLDERS) {
    allRows[folder] = await loadProduct(folder);
  }

  const counts = Object.fromEntries(PRODUCT_FOLDERS.map((f) => [f, allRows[f].length]));
  const schedule = buildSchedule(counts);

  // Assign each product's rows a day in the order they appear in their
  // own sheet (pin 1.1, 1.2, ... already the other session's own
  // intended sequence), consuming the schedule's day slots per product.
  const daysByFolder = {};
  for (const folder of PRODUCT_FOLDERS) daysByFolder[folder] = [];
  for (const { folder, day } of schedule) daysByFolder[folder].push(day);

  const HEADER = ["Title", "Media URL", "Pinterest board", "Description", "Link", "Publish date", "Keywords"];

  let totalWritten = 0;
  for (const folder of PRODUCT_FOLDERS) {
    const rows = allRows[folder];
    const days = daysByFolder[folder];
    const lines = [csvRow(HEADER)];

    rows.forEach((r, i) => {
      const mediaUrl = `${SITE_URL}/store/pinterest-pins/${folder}/${r.image_file.replace(/\.png$/, ".jpg")}`;
      const publishDate = isoDate(days[i]);
      const keywords = ""; // not present in source sheets; left blank rather than invented
      lines.push(
        csvRow([r.title, mediaUrl, r.board, r.description, r.destination_url, publishDate, keywords])
      );
    });

    const outPath = path.join(OUT_ROOT, `${folder}.csv`);
    await writeFile(outPath, lines.join(""), "utf8");
    totalWritten += rows.length;
    console.log(`marketing/pinterest/csv/${folder}.csv: ${rows.length} rows`);
  }
  console.log(`total: ${totalWritten}`);
  console.log(`schedule spans ${Math.max(...schedule.map((s) => s.day)) + 1} days`);
}

await main();
