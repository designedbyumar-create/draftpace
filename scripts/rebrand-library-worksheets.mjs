// Re-skins every generic library worksheet (public/guides/print/library/*.html)
// with real Draftpace branding (logo, area accent, numbered print-tuned layout)
// and a product upsell band before the footer, while preserving the exact field
// set, worksheet title, prompt and footer copy each already has. Safe to re-run:
// it parses its OWN output, not the pre-rebrand template.
// Run: node scripts/rebrand-library-worksheets.mjs
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "public/guides/print/library");

// Founder-supplied monogram path, viewBox 0 0 512 512 (src/design-system/Logo.tsx, unmodified).
const MONOGRAM_PATH =
  "M134.029 137.69C133.209 138.5 133.216 138.408 133.694 142.177C134.446 148.103 137.054 154.357 140.878 159.402C147.641 168.325 157.232 173.609 168.914 174.846C171.154 175.084 194.694 175.208 237.347 175.208C308.183 175.208 304.752 175.118 311.564 177.158C324.417 181.005 336.025 190.876 342.37 203.352C346.424 211.325 348.151 218.628 348.16 227.838C348.176 243.106 342.171 257.131 331.185 267.488C325.738 272.623 319.422 276.42 312.623 278.648C306.038 280.805 305.867 280.815 275.387 280.815C259.455 280.815 245.806 280.968 243.23 281.174C235.741 281.775 230.855 283.155 224.037 286.595C218.552 289.362 214.61 292.263 210.283 296.717C202.48 304.748 197.939 313.999 196.431 324.934C195.757 329.826 195.673 373.885 196.337 374.541C196.984 375.181 232.246 375.138 232.785 374.497C233.056 374.174 233.201 367.167 233.267 351.135L233.363 328.234L234.277 326.307C235.427 323.886 237.055 322.04 239.069 320.874C242.744 318.746 240.675 318.872 275.382 318.66C305.927 318.473 307.373 318.435 311.423 317.718C329.773 314.47 345.562 306.284 358.862 293.123C380.144 272.063 389.649 242.388 384.727 212.374C380.004 183.572 361.384 158.838 334.65 145.853C323.811 140.589 314.658 138.173 302.425 137.347C299.335 137.139 265.631 137.004 216.045 137.001C135.197 136.996 134.728 136.999 134.029 137.69ZM198.903 208.801C195.628 209.095 188.539 210.421 185.23 211.358C171.865 215.143 159.936 222.129 150.019 231.978C137.772 244.141 129.959 259.397 126.761 277.394C126.25 280.269 126.168 285.995 126.046 327.31C125.942 362.594 126.008 374.098 126.319 374.468C126.664 374.878 129.781 374.958 145.487 374.958C163.671 374.958 164.255 374.937 164.608 374.286C164.853 373.833 164.972 358.988 164.974 328.691C164.976 300.383 165.107 282.976 165.329 281.625C166.231 276.132 168.862 269.518 172.129 264.529C174.222 261.332 178.498 256.915 182.025 254.304C185.598 251.66 191.656 248.761 196.13 247.554L199.607 246.616L238.11 246.411C280.226 246.187 277.966 246.301 283.208 244.132C288.014 242.144 293.349 237.617 296.419 232.925C299.071 228.871 301.05 222.348 301.05 217.662C301.05 214.572 300.297 209.6 299.746 209.055C299.313 208.628 292.287 208.566 249.776 208.616C222.57 208.649 199.677 208.732 198.903 208.801Z";

// Real light-mode life-area accents (src/app/globals.css :root block) and the
// real product each area sells (src/content/areas.ts productSlugs[0]), with
// each product's own published positioning line (src/shop/products/*.ts
// listing.subtitle, reused verbatim — never invented here).
const AREA = {
  money: { accent: "#176b51", soft: "#e2efe9", label: "Money", product: "personal-finance-companion", productTitle: "Personal Finance Companion", pitch: "your always-current money picture" },
  home: { accent: "#96591a", soft: "#f6ebda", label: "Home", product: "home-management-companion", productTitle: "Home Base", pitch: "know what your home needs, before it gets expensive" },
  "mind-and-focus": { accent: "#5a4bb8", soft: "#e9e6f7", label: "Mind and focus", product: "alongside", productTitle: "ADHD Life Companion", pitch: "hold what you cannot keep in your head" },
  "family-and-learning": { accent: "#97417a", soft: "#f7e6f1", label: "Family and learning", product: "homeschooling-companion", productTitle: "Homeschooling Companion", pitch: "keep track of what you actually taught" },
  "affairs-and-endings": { accent: "#4d5a68", soft: "#e9ecef", label: "Affairs and endings", product: "personal-life-affairs-companion", productTitle: "Personal Life Affairs Companion", pitch: "get your affairs in order, one step at a time" },
  travel: { accent: "#1f6291", soft: "#e2edf5", label: "Travel", product: "travel-companion", productTitle: "Travel Companion", pitch: "know what else moves when one thing moves" },
  vehicles: { accent: "#4d5a35", soft: "#e9ecdf", label: "Vehicles", product: "vehicle-maintenance-companion", productTitle: "Vehicle Maintenance Companion", pitch: "know what's due, in writing before a shop touches your car" },
  "family-health": { accent: "#424c62", soft: "#e6e9f0", label: "Family health", product: "family-health-binder", productTitle: "Family Health Binder", pitch: "the answers every form asks, entered once for your family" },
  // No single product owns this topic (it spans every companion), so its
  // worksheets point at the Shop itself rather than naming one product.
  series: { accent: "#0e6e75", soft: "#e0f0f0", label: "Draftpace", product: null, productTitle: "Draftpace", pitch: "nine companions for the parts of life nobody teaches you" },
};

function logoSvg(size = 26) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Draftpace"><rect width="512" height="512" rx="112" fill="#0f172a"/><path fill-rule="evenodd" clip-rule="evenodd" d="${MONOGRAM_PATH}" fill="#ffffff"/></svg>`;
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function build({ areaSlug, backHref, title, intro, fields, footer }) {
  const area = AREA[areaSlug];
  if (!area) throw new Error(`No product mapped for area "${areaSlug}"`);
  const fieldsHtml = fields
    .map((label, i) => {
      const n = String(i + 1).padStart(2, "0");
      const tall = label.length > 30 || /\b(record|note|question|explain|plan|status|follow|find|detail)\b/i.test(label);
      return `<li><span class="n">${n}</span><div class="f"><h2>${label}</h2><div class="lines${tall ? " tall" : ""}"></div></div></li>`;
    })
    .join("");
  const shopHref = area.product ? `/shop/${area.product}` : "/shop";
  const upsellBody = area.product
    ? `You just filled this in by hand, once. ${escapeHtml(area.productTitle)} is the same kind of record, kept in one place and easy to update instead of reprinted, with the rest of ${escapeHtml(area.label.toLowerCase())} alongside it. See what's actually inside before you decide.`
    : `You just filled in one page by hand. Draftpace is nine companions like this one, each built around a single part of life people are never taught to manage. See the one that fits before you decide.`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)} | Draftpace</title>
<style>
:root{--ink:#1c1917;--muted:#55504a;--rule:#d8d3cb;--accent:${area.accent};--soft:${area.soft}}
*{box-sizing:border-box;print-color-adjust:exact;-webkit-print-color-adjust:exact}
body{font:16px/1.6 Arial,Helvetica,sans-serif;color:var(--ink);max-width:720px;margin:0 auto;padding:40px 28px 36px;background:#fff}
.topbar{height:5px;background:var(--accent);margin:0 -28px 28px}
header{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:26px}
.brand{display:flex;align-items:center;gap:9px}
.brand span{font:700 13px/1 Arial,Helvetica,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--ink)}
.screen{font-size:12.5px;color:var(--muted);text-align:right}
.screen a{color:var(--accent);font-weight:700;text-decoration:none}
.screen a:hover{text-decoration:underline}
.screen p{margin:2px 0 0}
.eyebrow{font:700 11px/1 Arial,Helvetica,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin:0 0 10px}
h1{font-family:Georgia,'Iowan Old Style','Palatino Linotype',serif;font-size:30px;line-height:1.22;letter-spacing:-.01em;margin:0 0 10px;color:var(--ink)}
.prompt{margin:0 0 30px;color:var(--muted);font-size:15px;max-width:58ch}
ol.fields{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:18px}
ol.fields li{display:flex;gap:14px;align-items:flex-start;padding-bottom:16px;border-bottom:1px solid var(--rule)}
ol.fields li:last-child{border-bottom:none;padding-bottom:0}
.n{flex:0 0 auto;width:24px;height:24px;border-radius:999px;background:var(--soft);color:var(--accent);font:700 11px/24px Arial,Helvetica,sans-serif;text-align:center}
.f{flex:1;min-width:0}
.f h2{font-size:14.5px;font-weight:700;margin:0 0 8px;color:var(--ink)}
.lines{height:30px;border-bottom:1px solid #a8a29a}
.lines.tall{height:52px}
.upsell{margin-top:30px;padding:22px 24px;border-radius:12px;background:var(--soft);border:1px solid var(--accent)}
.upsell .k{font:700 10.5px/1 Arial,Helvetica,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin:0 0 9px}
.upsell h3{font-family:Georgia,'Iowan Old Style','Palatino Linotype',serif;font-size:19px;line-height:1.3;margin:0 0 8px;color:var(--ink)}
.upsell p{margin:0 0 14px;font-size:13.5px;color:var(--muted);max-width:52ch}
.upsell .cta{display:inline-flex;align-items:center;gap:7px;background:var(--accent);color:#fff;font:700 13px/1 Arial,Helvetica,sans-serif;padding:11px 20px;border-radius:999px;text-decoration:none}
.upsell .url{margin:10px 0 0;font-size:11px;color:var(--muted)}
footer{margin-top:24px;padding-top:16px;border-top:1px solid var(--rule);font-size:11.5px;line-height:1.5;color:var(--muted);display:flex;align-items:center;gap:10px}
footer svg{flex:0 0 auto;opacity:.55}
@media print{
  body{margin:0;max-width:none;padding:16mm 16mm 10mm}
  .topbar{display:none}
  .screen{display:none}
  header{margin-bottom:20px}
  h1{font-size:24px}
  .prompt{margin-bottom:22px}
  ol.fields{gap:12px}
  ol.fields li{padding-bottom:10px;break-inside:avoid}
  .lines{height:24px}
  .lines.tall{height:40px}
  .upsell{margin-top:20px;padding:16px 18px;break-inside:avoid}
  .upsell .cta{padding:9px 16px}
  footer{margin-top:16px}
  @page{size:A4;margin:12mm}
}
@media (max-width:420px){
  body{padding:28px 18px 28px}
  header{flex-direction:column;align-items:flex-start;gap:10px}
  .screen{text-align:left}
}
</style></head>
<body>
<div class="topbar"></div>
<header>
  <div class="brand">${logoSvg(24)}<span>Draftpace</span></div>
  <nav class="screen"><a href="${backHref}">Back to the guide</a><p>Print or save as PDF. Nothing you write here is sent to Draftpace.</p></nav>
</header>
<main>
  <p class="eyebrow">${escapeHtml(area.label)} worksheet</p>
  <h1>${escapeHtml(title)}</h1>
  <p class="prompt">${escapeHtml(intro)}</p>
  <ol class="fields">${fieldsHtml}</ol>
  <section class="upsell">
    <p class="k">This is one page</p>
    <h3>${escapeHtml(area.productTitle)}: ${escapeHtml(area.pitch)}</h3>
    <p>${upsellBody}</p>
    <a class="cta" href="${shopHref}">${area.product ? `See ${escapeHtml(area.productTitle)}` : "See all nine companions"} &rarr;</a>
    <p class="url">draftpace.com${shopHref}</p>
  </section>
  <footer>${logoSvg(16)}<span>${escapeHtml(footer)}</span></footer>
</main>
</body></html>
`;
}

function parseExisting(html) {
  const backHref = html.match(/<a href="(\/guides\/[a-z0-9-]+)">Back to the guide<\/a>/)[1];
  const title = html.match(/<h1>([\s\S]*?)<\/h1>/)[1];
  const intro = html.match(/<\/h1>\s*<p class="prompt">([\s\S]*?)<\/p>/)[1];
  const fields = [...html.matchAll(/<h2>([\s\S]*?)<\/h2><div class="lines[^"]*"><\/div>/g)].map((m) => m[1]);
  const footer = html.match(/<footer>[\s\S]*?<span>([\s\S]*?)<\/span><\/footer>/)[1];
  return { backHref, title, intro, fields, footer };
}

const info = JSON.parse(readFileSync(join(ROOT, "src/content/revisions/library-info.generated.json"), "utf8"));

let n = 0;
for (const file of readdirSync(DIR)) {
  if (!file.endsWith(".html")) continue;
  const slug = file.replace(/\.html$/, "");
  const areaSlug = info[slug]?.areaSlug;
  if (!areaSlug) throw new Error(`No areaSlug for ${slug} in library-info.generated.json`);
  const html = readFileSync(join(DIR, file), "utf8");
  const parsed = parseExisting(html);
  const rebuilt = build({ slug, areaSlug, ...parsed });
  writeFileSync(join(DIR, file), rebuilt);
  n++;
}
console.log(`Rebranded ${n} worksheets.`);
