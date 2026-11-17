#!/usr/bin/env node
/**
 * Builds a review page for everything in out/: every video (playable, with
 * sound) and every still, grouped by product, each with Approve / Reject
 * and a note. Decisions are kept in the browser as you go, and "Export
 * decisions" downloads approvals.json for publish-pinterest.mjs (or any
 * later publishing step) to act on.
 *
 *   node scripts/review.mjs        writes out/review/index.html; open it in a browser
 *
 * Nothing is published by reviewing; approving only records a decision.
 */
import { readdir, readFile, writeFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("out");
const products = (await readdir("shots")).sort((a, b) => b.length - a.length);
// Which product each still belongs to, from the shot files themselves.
const owner = {};
for (const slug of products) {
  for (const f of await readdir(path.join("shots", slug))) {
    const json = JSON.parse(await readFile(path.join("shots", slug, f), "utf8"));
    for (const x of [...(json.posts ?? []), ...(json.slides ?? [])]) owner[x.id] = slug;
  }
}
const pascal = (slug) => slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join("");

const items = [];
for (const f of (await readdir(OUT)).filter((f) => f.endsWith(".mp4"))) {
  const slug = products.find((p) => f.startsWith(pascal(p) + "-"));
  items.push({ id: f.replace(/\.mp4$/, ""), kind: "video", src: `../${f}`, product: slug ?? "other", ratio: "9:16" });
}
for (const f of (await readdir(path.join(OUT, "images")).catch(() => [])).filter((f) => f.endsWith(".png")).sort()) {
  const id = f.replace(/\.png$/, "");
  const postId = id.replace(/^(Post|Image)-/, "").replace(/-(square|portrait|pinterest)$/, "");
  const slug = owner[postId] ?? "other";
  items.push({ id, kind: "still", src: `../images/${f}`, product: slug, ratio: id.split("-").pop() });
}
const built = new Date().toISOString();
const mtime = Math.max(0, ...(await Promise.all(items.map((i) => stat(path.join(OUT, "review", i.src)).then((s) => s.mtimeMs).catch(() => 0)))));

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Creative review</title>
<style>
  :root { --bg:#f4f2ec; --card:#fff; --ink:#1b1a16; --muted:#66625a; --line:#e7e2d8; --ok:#2f7a55; --no:#a34a3c; }
  @media (prefers-color-scheme: dark) { :root { --bg:#14130f; --card:#1c1a16; --ink:#f5f2ea; --muted:#b1aa9d; --line:#2d2a21; --ok:#7cc4a0; --no:#e0897a; } }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--ink); font:15px/1.45 system-ui, sans-serif; }
  header { position:sticky; top:0; z-index:2; display:flex; flex-wrap:wrap; gap:12px; align-items:center; padding:14px 16px; background:var(--bg); border-bottom:1px solid var(--line); }
  header h1 { font-size:17px; margin:0 12px 0 0; }
  header .count { color:var(--muted); }
  button, select { font:inherit; border:1px solid var(--line); background:var(--card); color:var(--ink); border-radius:8px; padding:6px 12px; cursor:pointer; }
  main { padding:16px; max-width:1400px; margin:0 auto; }
  h2 { font-size:15px; margin:28px 0 10px; text-transform:uppercase; letter-spacing:.08em; color:var(--muted); }
  .grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:14px; }
  .item { background:var(--card); border:1px solid var(--line); border-radius:12px; overflow:hidden; display:flex; flex-direction:column; }
  .item[data-d="approve"] { outline:3px solid var(--ok); }
  .item[data-d="reject"] { outline:3px solid var(--no); opacity:.6; }
  .item img, .item video { width:100%; display:block; background:#000; }
  .meta { padding:8px 10px; display:flex; flex-direction:column; gap:6px; }
  .meta code { font-size:12px; color:var(--muted); word-break:break-all; }
  .row { display:flex; gap:6px; }
  .row button { flex:1; }
  .row button.on.approve { background:var(--ok); color:#fff; border-color:var(--ok); }
  .row button.on.reject { background:var(--no); color:#fff; border-color:var(--no); }
  textarea { width:100%; font:inherit; font-size:13px; border:1px solid var(--line); border-radius:8px; padding:6px; background:var(--bg); color:var(--ink); resize:vertical; min-height:34px; }
</style></head>
<body>
<header>
  <h1>Creative review</h1>
  <span class="count" id="count"></span>
  <select id="filter"><option value="">All</option><option value="video">Videos</option><option value="still">Stills</option><option value="undecided">Undecided</option></select>
  <button id="export">Export decisions</button>
</header>
<main id="main"></main>
<script>
const ITEMS = ${JSON.stringify(items)};
const KEY = "draftpace-creative-review";
let state = {};
try { state = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} };
function render() {
  const f = document.getElementById("filter").value;
  const main = document.getElementById("main"); main.innerHTML = "";
  const byProduct = {};
  for (const it of ITEMS) {
    if (f === "video" && it.kind !== "video") continue;
    if (f === "still" && it.kind !== "still") continue;
    if (f === "undecided" && state[it.id]?.decision) continue;
    (byProduct[it.product] ||= []).push(it);
  }
  for (const [product, list] of Object.entries(byProduct).sort()) {
    const h = document.createElement("h2"); h.textContent = product + " (" + list.length + ")"; main.append(h);
    const grid = document.createElement("div"); grid.className = "grid"; main.append(grid);
    for (const it of list) {
      const s = state[it.id] || {};
      const el = document.createElement("div"); el.className = "item"; el.dataset.d = s.decision || "";
      el.innerHTML = (it.kind === "video" ? '<video controls preload="metadata" src="' + it.src + '"></video>' : '<a href="' + it.src + '" target="_blank"><img loading="lazy" src="' + it.src + '"></a>')
        + '<div class="meta"><code>' + it.id + '</code><div class="row"><button class="approve">Approve</button><button class="reject">Reject</button></div><textarea placeholder="Note"></textarea></div>';
      const [a, r] = el.querySelectorAll("button"); const t = el.querySelector("textarea");
      if (s.decision === "approve") a.classList.add("on"); if (s.decision === "reject") r.classList.add("on");
      t.value = s.note || "";
      const set = (d) => { state[it.id] = { ...state[it.id], decision: state[it.id]?.decision === d ? undefined : d }; save(); render(); };
      a.onclick = () => set("approve"); r.onclick = () => set("reject");
      t.onchange = () => { state[it.id] = { ...state[it.id], note: t.value }; save(); };
      grid.append(el);
    }
  }
  const n = Object.values(state).filter((x) => x.decision === "approve").length;
  document.getElementById("count").textContent = ITEMS.length + " items · " + n + " approved";
}
document.getElementById("filter").onchange = render;
document.getElementById("export").onclick = () => {
  const out = { exportedAt: new Date().toISOString(), builtAt: ${JSON.stringify(built)}, decisions: ITEMS.filter((i) => state[i.id]?.decision).map((i) => ({ id: i.id, kind: i.kind, product: i.product, ratio: i.ratio, decision: state[i.id].decision, note: state[i.id].note || "" })) };
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(out, null, 2)], { type: "application/json" })); a.download = "approvals.json"; a.click();
};
render();
</script></body></html>`;

await mkdir(path.join(OUT, "review"), { recursive: true });
await writeFile(path.join(OUT, "review", "index.html"), html);
console.log(`out/review/index.html: ${items.length} items (${items.filter((i) => i.kind === "video").length} videos), renders as of ${new Date(mtime).toISOString()}`);
