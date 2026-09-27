// Article art: the pin visual language (soft area gradient, serif headline with
// an accent second line, white product-style cards) rendered as article heroes,
// thumbnails and figures. Every card is drawn from a spec that mirrors the
// guide's own content, so a picture can never disagree with its text.
import fs from "node:fs";
import path from "node:path";

const font = (file) => "data:font/ttf;base64," + fs.readFileSync(path.join(process.cwd(), "public/fonts", file)).toString("base64");

export const AREAS = {
  money: { label: "Money", accent: "#176b51", deep: "#0f4a38", soft: "#e2efe9", tint: "#cfe4da", ink: "#10261f", line: "#cfe0d7" },
  home: { label: "Home", accent: "#96591a", deep: "#6d3f0e", soft: "#f6ebda", tint: "#ecd9bb", ink: "#2b1d0e", line: "#e6d3b6" },
  "mind-and-focus": { label: "Mind and focus", accent: "#5a4bb8", deep: "#40348c", soft: "#e9e6f7", tint: "#d8d3f0", ink: "#1d1a33", line: "#d5d0ec" },
  "family-and-learning": { label: "Family and learning", accent: "#97417a", deep: "#6e2c58", soft: "#f7e6f1", tint: "#efd0e3", ink: "#2e1526", line: "#ecd2e2" },
  "affairs-and-endings": { label: "Affairs and endings", accent: "#4d5a68", deep: "#333e4a", soft: "#e9ecef", tint: "#d6dce2", ink: "#1a2027", line: "#d3d9df" },
  travel: { label: "Travel", accent: "#1f6291", deep: "#144766", soft: "#e2edf5", tint: "#c9dfee", ink: "#0f2331", line: "#c8dbe8" },
  vehicles: { label: "Vehicles", accent: "#4d5a35", deep: "#37421f", soft: "#e9ecdf", tint: "#d7dcc6", ink: "#1c2211", line: "#d3d9c2" },
  "family-health": { label: "Family health", accent: "#424c62", deep: "#2c3548", soft: "#e6e9f0", tint: "#d1d7e4", ink: "#171c28", line: "#ccd2e0" },
  series: { label: "Companion Series", accent: "#0e6e75", deep: "#0a4d52", soft: "#e0f0f0", tint: "#c5e3e4", ink: "#0d2628", line: "#c3dddf" },
};

const logo = "data:image/png;base64," + fs.readFileSync(path.join(process.cwd(), "public/logo/icon-512.png")).toString("base64");
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const eyebrow = (t) => `<div class="eb">${esc(t)}</div>`;
const title = (t) => (t ? `<div class="ti">${esc(t)}</div>` : "");
const exampleChip = (p) => (p.example ? `<div class="ex">Example</div>` : "");

// Every piece is a 520px-wide card. The composer scales it to fit.
export const PIECES = {
  checklist: (p) =>
    `${eyebrow(p.eyebrow)}${title(p.title)}<div class="rows">${p.items
      .map((t, i) => `<div class="row"><span class="box${(p.done ?? []).includes(i) ? " on" : ""}">${(p.done ?? []).includes(i) ? "&#10003;" : ""}</span><span>${esc(t)}</span></div>`)
      .join("")}</div>${exampleChip(p)}`,
  script: (p) =>
    `${eyebrow(p.eyebrow)}${title(p.title)}<div class="sc">${p.lines
      .map((l) => `<div class="say"><b>${esc(l.label)}</b><span>${esc(l.text)}</span></div>`)
      .join("")}</div>${exampleChip(p)}`,
  ledger: (p) =>
    `${eyebrow(p.eyebrow)}${title(p.title)}<div class="rows">${p.rows
      .map(([a, b]) => `<div class="lr"><span>${esc(a)}</span><b>${esc(b)}</b></div>`)
      .join("")}</div><div class="lt"><span>${esc(p.total[0])}</span><b>${esc(p.total[1])}</b></div>${exampleChip(p)}`,
  timeline: (p) =>
    `${eyebrow(p.eyebrow)}${title(p.title)}<div class="tl">${p.steps
      .map((s) => `<div class="st"><i></i><div><small>${esc(s.when)}</small><span>${esc(s.what)}</span></div></div>`)
      .join("")}</div>${exampleChip(p)}`,
  compare: (p) =>
    `${eyebrow(p.eyebrow)}<div class="cmp">${[p.left, p.right]
      .map((c, i) => `<div class="cc${i ? " r" : ""}"><b>${esc(c.label)}</b>${c.items.map((t) => `<span>${esc(t)}</span>`).join("")}</div>`)
      .join("")}</div>${exampleChip(p)}`,
  choice: (p) =>
    `${eyebrow(p.eyebrow)}<div class="ti">${esc(p.question)}</div><div class="ch">${p.options
      .map((t, i) => `<div class="op${p.picked === i ? " pk" : ""}">${esc(t)}</div>`)
      .join("")}</div>${exampleChip(p)}`,
  stat: (p) =>
    `${eyebrow(p.eyebrow)}<div class="big">${esc(p.value)}</div><div class="cap">${esc(p.caption)}</div>${
      p.bars ? `<div class="bars">${p.bars.map((w, i) => `<i style="width:${w}%;opacity:${1 - i * 0.22}"></i>`).join("")}</div>` : ""
    }${p.foot ? `<div class="ft">${esc(p.foot)}</div>` : ""}${exampleChip(p)}`,
  note: (p) => `${eyebrow(p.eyebrow)}<div class="nt">${esc(p.text)}</div>${exampleChip(p)}`,
  page: (p) =>
    `${eyebrow(p.eyebrow)}${title(p.title)}<div class="pg">${p.rows
      .map((t) => `<div class="pr"><span>${esc(t)}</span><u></u></div>`)
      .join("")}</div>${exampleChip(p)}`,
  table: (p) =>
    `${eyebrow(p.eyebrow)}<div class="tb"><div class="th">${p.columns.map((c) => `<span>${esc(c)}</span>`).join("")}</div>${p.rows
      .map((r) => `<div class="tr">${r.map((c) => `<span>${esc(c)}</span>`).join("")}</div>`)
      .join("")}</div>${exampleChip(p)}`,
};

const CSS = (a) => `
@font-face{font-family:Newsreader;src:url(${font("Newsreader.ttf")});font-weight:200 800}
@font-face{font-family:Plex;src:url(${font("IBMPlexSans.ttf")});font-weight:100 700}
*{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased}
:root{--a:${a.accent};--d:${a.deep};--s:${a.soft};--t:${a.tint};--i:${a.ink};--l:${a.line}}
html,body{overflow:hidden;font-family:Plex,sans-serif;color:var(--i)}
.cv{position:relative;overflow:hidden;background:linear-gradient(135deg,#fff 0%,var(--s) 46%,var(--t) 100%)}
.cv:before{content:"";position:absolute;right:-160px;top:-160px;width:560px;height:560px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.75),rgba(255,255,255,0) 68%)}
.brand{position:absolute;left:64px;top:52px;display:flex;align-items:center;gap:14px;font:600 20px/1 Newsreader,serif;color:var(--i)}
.brand img{width:36px;height:36px;border-radius:9px;display:block}
.brand span{font:600 13px Plex;letter-spacing:.14em;text-transform:uppercase;color:var(--d);margin-left:6px;padding:7px 14px;border:1.5px solid var(--a);border-radius:99px}
h1{position:absolute;left:64px;width:560px;font:500 62px/1.05 Newsreader,serif;letter-spacing:-1.8px;color:var(--i)}
.foot{position:absolute;left:64px;bottom:52px;font:700 13px Plex;letter-spacing:.16em;text-transform:uppercase;color:var(--d);opacity:.8;display:flex;align-items:center;gap:12px}
.foot:before{content:"";width:36px;height:2px;background:var(--a)}
h1 em{display:block;font-style:normal;color:var(--a)}
.card{position:absolute;width:520px;background:#fff;border:2px solid var(--l);border-radius:30px;padding:34px 36px 32px;box-shadow:0 34px 60px -34px rgba(20,20,30,.38);transform-origin:top left}
.eb{font:700 13px Plex;letter-spacing:.16em;text-transform:uppercase;color:var(--a)}
.ti{font:500 30px/1.16 Newsreader,serif;letter-spacing:-.5px;margin-top:10px;color:var(--i)}
.rows{margin-top:18px;display:flex;flex-direction:column}
.row{display:flex;gap:16px;align-items:center;padding:14px 0;border-top:1.5px solid var(--l);font:500 21px/1.25 Plex}
.row:first-child{border-top:0}
.box{width:26px;height:26px;border-radius:8px;border:2.5px solid var(--a);flex:none;display:flex;align-items:center;justify-content:center;color:#fff;font:700 16px Plex}
.box.on{background:var(--a)}
.lr{display:flex;justify-content:space-between;gap:16px;padding:12px 0;border-top:1.5px solid var(--l);font:500 20px Plex;color:#4a4f57}
.lr:first-child{border-top:0}.lr b{font:600 20px Plex;color:var(--i);white-space:nowrap}
.lt{display:flex;justify-content:space-between;align-items:baseline;margin-top:6px;padding:18px 20px;border-radius:18px;background:var(--d);color:#fff;font:600 19px Plex}
.lt b{font:500 38px Newsreader,serif;letter-spacing:-.6px}
.sc{margin-top:16px;display:flex;flex-direction:column;gap:12px}
.say{border-radius:18px;background:var(--s);padding:16px 20px;display:flex;flex-direction:column;gap:6px}
.say b{font:700 12px Plex;letter-spacing:.14em;text-transform:uppercase;color:var(--a)}
.say span{font:500 25px/1.28 Newsreader,serif;color:var(--i)}
.tl{margin-top:20px;display:flex;flex-direction:column;gap:0;position:relative}
.st{display:flex;gap:18px;padding-bottom:20px;position:relative}
.st:last-child{padding-bottom:0}
.st i{width:16px;height:16px;border-radius:50%;background:var(--a);flex:none;margin-top:5px;position:relative;z-index:1}
.st:not(:last-child):before{content:"";position:absolute;left:7px;top:22px;bottom:-4px;width:2px;background:var(--l)}
.st small{display:block;font:700 12px Plex;letter-spacing:.14em;text-transform:uppercase;color:var(--a);margin-bottom:3px}
.st span{font:500 21px/1.28 Plex}
.cmp{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:16px}
.cc{border-radius:20px;background:var(--s);padding:18px;display:flex;flex-direction:column;gap:10px}
.cc.r{background:var(--d);color:#fff}
.cc b{font:500 25px/1.1 Newsreader,serif}
.cc span{font:500 18px/1.3 Plex;opacity:.9;border-top:1.5px solid rgba(0,0,0,.09);padding-top:9px}
.cc.r span{border-top-color:rgba(255,255,255,.2)}
.ch{margin-top:18px;display:flex;flex-direction:column;gap:12px}
.op{border:2px solid var(--l);border-radius:18px;padding:18px 22px;font:600 21px/1.2 Plex}
.op.pk{background:var(--a);border-color:var(--a);color:#fff}
.big{font:500 84px/1 Newsreader,serif;letter-spacing:-2.4px;margin-top:14px;color:var(--d)}
.cap{font:500 22px/1.32 Plex;color:#4a4f57;margin-top:12px}
.bars{display:flex;flex-direction:column;gap:9px;margin-top:22px}.bars i{display:block;height:16px;border-radius:99px;background:var(--a)}
.ft{margin-top:18px;font:500 17px/1.3 Plex;color:#6b7078}
.nt{margin-top:14px;font:500 34px/1.22 Newsreader,serif;letter-spacing:-.6px;padding:22px 24px;border-radius:20px;background:var(--s);border-left:8px solid var(--a)}
.pg{margin-top:20px;display:flex;flex-direction:column;gap:6px}
.pr{display:flex;align-items:flex-end;gap:14px;padding:11px 0;font:500 19px Plex;color:#4a4f57}
.pr u{flex:1;border-bottom:2px solid var(--l);height:2px;margin-bottom:6px}
.tb{margin-top:16px;border:2px solid var(--l);border-radius:18px;overflow:hidden}
.th,.tr{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:12px;padding:13px 18px;font:500 18px/1.25 Plex}
.th{background:var(--s);font:700 12px Plex;letter-spacing:.12em;text-transform:uppercase;color:var(--a)}
.tr{border-top:1.5px solid var(--l)}
.ex{position:absolute;right:30px;top:-14px;background:#fff;border:1.5px solid var(--l);color:#5b606a;font:700 11px Plex;letter-spacing:.16em;text-transform:uppercase;padding:6px 12px;border-radius:99px}
`;

const pieceHtml = (p, cls, id) => `<div class="card ${cls}" id="${id}">${PIECES[p.type](p)}</div>`;

// mode: hero (1200x630, headline + cards), thumb (800x600, cards only), figure (1000x700, main card only)
export function pageHtml(spec, mode) {
  const a = AREAS[spec.area] ?? AREAS.series;
  const [w, h] = mode === "hero" ? [1200, 630] : mode === "thumb" ? [800, 600] : [1000, 700];
  const cards = mode === "figure" ? [spec.pieces[0]] : spec.pieces.slice(0, 2);
  const head =
    mode === "hero"
      ? `<div class="brand"><img src="${logo}">Draftpace<span>${esc(a.label)}</span></div><h1 style="top:200px;font-size:${Math.max(spec.line1.length, spec.line2.length) > 21 ? 54 : 62}px">${esc(spec.line1)}<em>${esc(spec.line2)}</em></h1><div class="foot">Free guide</div>`
      : "";
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS(a)} html,body{width:${w}px;height:${h}px}.cv{width:${w}px;height:${h}px}</style></head><body><div class="cv" data-w="${w}" data-h="${h}" data-mode="${mode}">${head}${cards
    .map((p, i) => pieceHtml(p, i === 0 ? "c1" : "c2", "c" + i))
    .join("")}</div>
<script>
window.__layout=function(){
  const cv=document.querySelector('.cv'),mode=cv.dataset.mode,W=+cv.dataset.w,H=+cv.dataset.h;
  const c1=document.getElementById('c0'),c2=document.getElementById('c1');
  const fit=(el,boxW,boxH)=>{el.style.transform='none';const r=el.getBoundingClientRect();const s=Math.min(boxW/520,boxH/(r.height||1));el.style.transform='scale('+s+')';return {w:520*s,h:r.height*s}};
  if(mode==='hero'){
    const m=fit(c1,500,c2?330:440);
    c1.style.left=(1200-56-m.w)+'px';c1.style.top=(c2?54:(H-m.h)/2)+'px';
    if(c2){const n=fit(c2,340,200);c2.style.left=(1200-56-n.w-28)+'px';c2.style.top=(54+m.h-22)+'px';c2.style.zIndex=3;c2.style.boxShadow='0 30px 50px -28px rgba(20,20,30,.5)'}
  }else if(mode==='thumb'){
    const m=fit(c1,c2?480:580,c2?330:480);
    c1.style.left=(c2?36:(W-m.w)/2)+'px';c1.style.top=(c2?36:(H-m.h)/2)+'px';
    if(c2){const n=fit(c2,340,200);c2.style.left=(W-n.w-30)+'px';c2.style.top=(36+m.h-20)+'px';c2.style.zIndex=3}
  }else{
    const m=fit(c1,640,600);c1.style.left=(W-m.w)/2+'px';c1.style.top=(H-m.h)/2+'px';
  }
};
</script></body></html>`;
}
