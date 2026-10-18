/**
 * The page the film is captured from: 1920 x 1080, the machine in the
 * middle, the product's own words under it, and the readout of what the
 * machine is doing. Light theme, Home Base's sage for what is moving.
 */
import path from "node:path";
import { pathToFileURL } from "node:url";
import * as k from "../anatomy-kit/iso-kit.mjs";
import { LABEL } from "./machine.mjs";

const FONTS = path.resolve(import.meta.dirname, "../../../public/fonts");
const font = (file) => pathToFileURL(path.join(FONTS, file)).href;

/** Home Base's accent scale, from its product definition. */
export const SAGE = { base: "#4f7a5c", strong: "#3d6149", soft: "#e6ede2" };

const CSS = `
@font-face{font-family:"Newsreader";src:url("${font("Newsreader.ttf")}")}
@font-face{font-family:"Plex";src:url("${font("IBMPlexSans.ttf")}")}
html,body{margin:0;padding:0;width:1920px;height:1080px;overflow:hidden}
.iso{--anatomy-weight:1.15px;--anatomy-mono:"Plex",ui-monospace,monospace;background:#f3f2ee}
.iso[data-theme="light"]{--anatomy-page:#f3f2ee;--anatomy-paper:#fbfbf9;--anatomy-lit:${SAGE.strong}}
.stage{position:absolute;left:0;top:0;width:1920px;height:1080px}
.foot,.top{z-index:2}
.veil-top{position:absolute;left:0;right:0;top:0;height:130px;background:linear-gradient(to top,rgba(243,242,238,0),rgba(243,242,238,.9) 45%,#f3f2ee);z-index:1}
.veil{position:absolute;left:0;right:0;bottom:0;height:300px;background:linear-gradient(to bottom,rgba(243,242,238,0),rgba(243,242,238,.94) 42%,#f3f2ee);z-index:1}
.hb-lit>.iso-top{fill:#eef3eb}
.hb-lit>.iso-shade[data-shade="0"]{fill:#b9cdb9}.hb-lit>.iso-shade[data-shade="1"]{fill:#c8d8c6}
.hb-lit>.iso-shade[data-shade="2"]{fill:#d5e1d2}.hb-lit>.iso-shade[data-shade="3"]{fill:#e1eadd}
.hb-lit>.iso-edge{stroke:${SAGE.strong}}
.hb-lit>.iso-crease{stroke:${SAGE.base}}
.hb-flag{fill:${SAGE.base};stroke:${SAGE.strong};stroke-width:1px}
.top{position:absolute;left:110px;right:110px;top:46px;display:flex;justify-content:space-between;align-items:baseline;font-family:"Plex";color:#6d6d72;font-size:22px;letter-spacing:.02em}
.top b{color:#1d1d20;font-weight:600}
.date{font-variant-numeric:tabular-nums}
.foot{position:absolute;left:110px;right:110px;bottom:58px;display:flex;justify-content:space-between;align-items:flex-end;gap:60px}
.say{font-family:"Newsreader",Georgia,serif;font-size:50px;line-height:1.14;color:#1d1d20;max-width:1060px;letter-spacing:-.01em}
.say small{display:block;font-family:"Plex";font-size:24px;line-height:1.4;color:#5d5d62;margin-top:14px;letter-spacing:0}
.read{font-family:"Plex";font-size:21px;line-height:1.45;color:#5d5d62;text-align:right;max-width:760px;font-variant-numeric:tabular-nums}
.read b{display:block;color:#1d1d20;font-weight:600;font-size:23px}
.read b span{font-weight:400;color:#6d6d72}
.read i{font-style:normal;color:${SAGE.strong}}
.fade{transition:none}
.end{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f3f2ee;font-family:"Plex";color:#5d5d62}
.end h1{font-family:"Newsreader",Georgia,serif;font-weight:500;font-size:110px;color:#1d1d20;margin:0;letter-spacing:-.02em}
.end p{font-size:30px;margin:18px 0 0}
.end .mark{display:inline-block;width:18px;height:18px;border-radius:5px;background:${SAGE.base};margin-right:14px;vertical-align:1px}
`;

export function pageHtml() {
  const svg = k.figureSvg({ width: 1920, height: 1080, label: LABEL, body: '<g id="machine"></g>' });
  const body = `
<div class="top"><span><b>Fig 1</b>&nbsp;&nbsp;Home Base, how it decides what your home needs</span><span class="date" id="date"></span></div>
<div class="stage" id="stage">${svg}</div>
<div class="veil"></div><div class="veil-top"></div>
<div class="foot"><div class="say" id="say"></div><div class="read" id="read"></div></div>
<div class="end" id="cover" style="opacity:1;z-index:3"></div>
<div class="end" id="end" style="opacity:0;z-index:4"><h1>Home Base</h1><p><span class="mark"></span>draftpace.com &nbsp;·&nbsp; $49 once</p></div>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>${k.ISO_CSS}${CSS}</style></head><body class="iso" data-theme="light">${body}
<script>
window.__show = (s) => {
  document.getElementById("machine").innerHTML = s.svg;
  const stage = document.getElementById("stage"); stage.style.opacity = s.machine; document.getElementById("cover").style.opacity = s.intro;
  const say = document.getElementById("say"); if (say.dataset.k !== s.sayKey) { say.innerHTML = s.say; say.dataset.k = s.sayKey; } say.style.opacity = s.sayAlpha;
  const read = document.getElementById("read"); if (read.dataset.k !== s.read) { read.innerHTML = s.read; read.dataset.k = s.read; } read.style.opacity = s.readAlpha;
  document.getElementById("date").textContent = s.date;
  document.getElementById("end").style.opacity = s.end;
};
</script></body></html>`;
}
