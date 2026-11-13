#!/usr/bin/env node
/**
 * The REAL one-page Item Card PDF.
 *
 * Runs the product's own exported function, downloadItemCard()
 * (src/products/home-management-companion/printables/generateItemCard.tsx),
 * unmodified, in Node. That function builds the document with
 * @react-pdf/renderer and hands the Blob to the browser (object URL + a
 * clicked <a download>); here those two DOM calls are caught to take the
 * bytes. Nothing lays out or words anything: the rows are what the real
 * component prints for the Fridge freezer of harness/fixtures.ts (the same
 * item the existing screens show), and the category line is the real
 * HOME_ITEM_CATEGORY_LABEL for its type.
 *
 * Writes under creative/out/homebase/assets/: item-card.pdf and
 * item-card.png (page 1, pdftoppm -r 200).
 *
 *   node creative/pinterest/homebase/capture/item-card.mjs
 */
import { createServer } from "vite";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { OUT, REPO, CREATIVE } from "./lib/screen-harness.mjs";

fs.mkdirSync(OUT, { recursive: true });

// The browser-only calls downloadItemCard() makes at the end.
let captured = null;
let filename = null;
globalThis.URL.createObjectURL = (blob) => { captured = blob; return "blob:capture"; };
globalThis.URL.revokeObjectURL = () => {};
globalThis.document = { createElement: () => ({ click() {}, remove() {}, set download(v) { filename = v; } }), body: { appendChild() {} } };

const vite = await createServer({
  configFile: false, logLevel: "error", appType: "custom", root: CREATIVE,
  server: { middlewareMode: true }, optimizeDeps: { noDiscovery: true },
  resolve: { alias: { "@": path.join(REPO, "src") } },
  define: { __HB_TENURE__: JSON.stringify("own") },
});
const P = path.join(REPO, "src/products/home-management-companion");
const { downloadItemCard } = await vite.ssrLoadModule(path.join(P, "printables/generateItemCard.tsx"));
const { HOME_ITEM_TYPE_BY_ID } = await vite.ssrLoadModule(path.join(P, "homeKnowledge.ts"));
const { FRIDGE } = await vite.ssrLoadModule(path.resolve(import.meta.dirname, "harness/fixtures.ts"));

// As PrintItemCardButton.tsx: the item and the label of its type.
await downloadItemCard(FRIDGE, HOME_ITEM_TYPE_BY_ID[FRIDGE.type]?.label ?? FRIDGE.type);
if (!captured) throw new Error("downloadItemCard did not hand over a Blob");

const pdf = path.join(OUT, "item-card.pdf");
fs.writeFileSync(pdf, Buffer.from(await captured.arrayBuffer()));
for (const f of fs.readdirSync(OUT)) if (/^item-card-tmp.*\.png$/.test(f)) fs.unlinkSync(path.join(OUT, f));
execFileSync("pdftoppm", ["-r", "200", "-png", "-f", "1", "-l", "1", pdf, path.join(OUT, "item-card-tmp")]);
const tmp = fs.readdirSync(OUT).find((f) => f.startsWith("item-card-tmp") && f.endsWith(".png"));
fs.renameSync(path.join(OUT, tmp), path.join(OUT, "item-card.png"));
console.log("download filename:", filename);
console.log(execFileSync("pdfinfo", [pdf]).toString().split("\n").filter((l) => /Pages|Page size/.test(l)).join("\n"));
console.log(execFileSync("pdftotext", ["-layout", pdf, "-"]).toString().trim());
const b = fs.readFileSync(path.join(OUT, "item-card.png"));
console.log("wrote item-card.png", `${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`);
await vite.close();
process.exit(0);
