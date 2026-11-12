#!/usr/bin/env node
/**
 * The REAL one-page "Shared Responsibility" statement PDF.
 *
 * Runs the product's own exported function, downloadSharedStatement()
 * (src/products/personal-finance-companion/printables/generateSharedStatement.tsx),
 * unmodified, in Node. That function builds the document with
 * @react-pdf/renderer and hands the Blob to the browser (object URL + a
 * clicked <a download>); here those two DOM calls are caught to take the
 * bytes. Nothing lays out, words or adds up anything: the rows and the
 * total are what computeSharedResponsibilitySummary() derives from the
 * shared bills / subscriptions of harness/fixtures.ts, exactly as
 * SharedStatementDownloadButton.tsx selects them (`item.shared`).
 *
 * Writes under creative/out/pfc/assets/: shared-statement.pdf and
 * shared-statement.png (page 1, pdftoppm -r 200).
 *
 *   node creative/pinterest/pfc/capture/shared-statement.mjs
 */
import { createServer } from "vite";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { OUT, REPO, CREATIVE, NOW } from "./lib/screen-harness.mjs";

fs.mkdirSync(OUT, { recursive: true });

// The two browser-only calls downloadSharedStatement() makes at the end.
let captured = null;
globalThis.URL.createObjectURL = (blob) => { captured = blob; return "blob:capture"; };
globalThis.URL.revokeObjectURL = () => {};
globalThis.document = { createElement: () => ({ click() {}, remove() {} }), body: { appendChild() {} } };

const vite = await createServer({
  configFile: false, logLevel: "error", appType: "custom", root: CREATIVE,
  server: { middlewareMode: true }, optimizeDeps: { noDiscovery: true },
  resolve: { alias: { "@": path.join(REPO, "src") } },
  define: { __PFC_VARIANT__: JSON.stringify("base"), __PFC_BALANCE__: JSON.stringify("household") },
});
const P = path.join(REPO, "src/products/personal-finance-companion");
const { downloadSharedStatement } = await vite.ssrLoadModule(path.join(P, "printables/generateSharedStatement.tsx"));
const { BILLS, SUBSCRIPTIONS } = await vite.ssrLoadModule(path.resolve(import.meta.dirname, "harness/fixtures.ts"));
const { computeSharedResponsibilitySummary } = await vite.ssrLoadModule(path.join(P, "domain/sharedResponsibility.ts"));

// As SharedStatementDownloadButton.tsx: every shared bill and subscription; the label is its own toLocaleDateString format, on the fixture's "today".
const items = [...BILLS, ...SUBSCRIPTIONS].filter((item) => item.shared);
const generatedLabel = new Date(NOW).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
await downloadSharedStatement({ generatedLabel, items, origin: "https://draftpace.com", slug: "personal-finance-companion" });
if (!captured) throw new Error("downloadSharedStatement did not hand over a Blob");

const pdf = path.join(OUT, "shared-statement.pdf");
fs.writeFileSync(pdf, Buffer.from(await captured.arrayBuffer()));
for (const f of fs.readdirSync(OUT)) if (/^shared-statement-.*\.png$/.test(f)) fs.unlinkSync(path.join(OUT, f));
execFileSync("pdftoppm", ["-r", "200", "-png", "-f", "1", "-l", "1", pdf, path.join(OUT, "shared-statement-tmp")]);
const tmp = fs.readdirSync(OUT).find((f) => f.startsWith("shared-statement-tmp") && f.endsWith(".png"));
fs.renameSync(path.join(OUT, tmp), path.join(OUT, "shared-statement.png"));
console.log(execFileSync("pdfinfo", [pdf]).toString().split("\n").filter((l) => /Pages|Page size/.test(l)).join("\n"));
console.log(execFileSync("pdftotext", ["-layout", pdf, "-"]).toString().trim());
console.log("summary:", JSON.stringify(computeSharedResponsibilitySummary(items)));
const b = fs.readFileSync(path.join(OUT, "shared-statement.png"));
console.log("wrote shared-statement.png", `${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`);
await vite.close();
process.exit(0);
