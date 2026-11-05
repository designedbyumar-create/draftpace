/**
 * Monthly Money Reset, v3 test pins: two of the seven visuals in
 * pinterest/strategy/monthly-money-reset.json, drawn from the product's own
 * world (paper on a kitchen table, never a bank dashboard).
 *
 * - mmr/pin-3.2, the receipt: the forest Number panel with the torn till
 *   receipt of the working hanging from its slot, exactly the seven terms
 *   SafeToSpendCard.tsx prints, and the expected salary clipped outside
 *   the sum ("not counted yet", SetupModule.tsx).
 * - mmr/pin-10.1, held-back envelopes: the two unpaid protected bills as
 *   sealed kraft envelopes bundled in one clay band, and the open envelope
 *   with what is left.
 *
 * Every figure is the demo month (DEMO_STATE, creative/src/ui-adapter/
 * monthlyMoneyReset.tsx) run through the real calculation, as the strategy
 * records; every word is read from the strategy's pin entry below.
 *
 * Monthly Money Reset is free, so kit.product() (which needs a price)
 * cannot describe it: the name and "free" are read from the same Shop
 * listing here, and the colours are the product's own theme.ts tokens.
 */
import fs from "node:fs";
import path from "node:path";
import { page, foot, esc } from "../kit.mjs";

const SLUG = "monthly-money-reset";
const ROOT = path.resolve(import.meta.dirname, "../../../..");
const listing = fs.readFileSync(path.join(ROOT, "src/shop/products", `${SLUG}.ts`), "utf8");
const name = listing.match(/\btitle:\s*"([^"]+)"/)?.[1];
if (!name || !/\baccess:\s*"free"/.test(listing)) throw new Error(`${SLUG}: expected a free product with a title in its Shop listing`);

/** theme.ts LIGHT tokens. */
const C = {
  forest: "#173c32", forest950: "#102a24", forest800: "#214b3e", forest700: "#315f50",
  sageStrong: "#718772", sage: "#96a58f", sageSoft: "#dce2d7", sagePale: "#edf0e9",
  ivory: "#f5f0e8", paper: "#fffdf9", ink: "#18231f", muted: "#6e776f", muted2: "#8f968f",
  line: "#ded8cd", lineStrong: "#cbc3b7", clay: "#b86f4a", claySoft: "#f2e2d8", success: "#43765e",
};
/** Kraft: clay-soft deepened toward line-strong, with a shade for edges and seams. */
const KRAFT = { body: "#dcc6ab", flap: "#e3cfb6", seam: "#c9ab88", edge: "#b08d68", inner: "#cfb593" };

const p = { slug: SLUG, name, price: 0, accent: C.forest, strong: C.forest950, soft: C.sageSoft };
/** The kit's product line, with the listing's real price: free. */
const productLine = () => foot(p, { cta: "guide" }).replace(">Free guide<", ">Free<");

const STRATEGY = (await import("../../strategy/monthly-money-reset.json", { with: { type: "json" } })).default;
const plan = (id) => {
  const pin = STRATEGY.pins.find((x) => x.id === id);
  if (!pin) throw new Error(`no ${id} in the monthly-money-reset strategy`);
  return pin;
};
const must = (m, what) => {
  if (!m) throw new Error(`could not read ${what} from the strategy`);
  return m;
};

/** Kraft paper fibre, shared by every paper object. */
const FIBRE = `<svg width="0" height="0" style="position:absolute"><defs>
  <filter id="fibre" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .24  0 0 0 0 .14  0 0 0 .10 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
</defs></svg>`;

/* ------------------------------------------------------------ the receipt */

function receipt() {
  const pin = plan("mmr/pin-3.2");
  // "Money available right now $1,842.50", "+ Income received $900.00 (Freelance work)", ..., "Safe to spend $43.65"
  const lines = pin.content.items.filter((s) => !s.startsWith("Clipped stub")).map((s) => {
    const [, sign, label, amount, note] = must(s.match(/^([+-] )?(.+?) (\$[\d,.]+)(?: \((.+)\))?$/), s);
    return { sign: sign?.trim() ?? "", label, amount, note };
  });
  const total = lines.pop();
  const [, stubName, stubAmount, stubDate, stubStamp] = must(
    pin.content.items.find((s) => s.startsWith("Clipped stub")).match(/^Clipped stub: (\w+) (\$[\d,.]+), expected (.+?), '(.+)'$/),
    "the clipped stub",
  );
  const [stampTop, stampBottom] = must(stubStamp.match(/^(.+?) (\(.+\))$/), "the stub's stamp").slice(1);
  const [dollars, cents] = must(total.amount.match(/^(.*?)(\.\d{2})$/), "the total").slice(1);

  const row = (l) => `
      <div class="row${l.note ? " arrived" : ""}">
        <span class="sign ${l.sign === "+" ? "plus" : ""}">${l.sign === "-" ? "&minus;" : esc(l.sign)}</span>
        <span class="label">${esc(l.label)}${l.note ? `<small>${esc(l.note)}</small>` : ""}</span>
        <span class="lead"></span>
        <span class="fig">${esc(l.amount)}</span>
      </div>`;

  const body = `
  ${FIBRE}
  <div class="top" data-check="headline">
    <div class="eyebrow">Irregular income</div>
    <h1 class="serif">${esc(pin.headline)}</h1>
  </div>

  <div class="stub" data-check="stub">
    <svg class="clip" viewBox="0 0 40 120" aria-hidden="true"><path d="M12 112 V20 a8 8 0 0 1 16 0 V96 a4 4 0 0 1 -8 0 V30" fill="none" stroke="#8b9590" stroke-width="4.5" stroke-linecap="round"/><path d="M12 112 V20 a8 8 0 0 1 16 0 V96" fill="none" stroke="#c9d0cc" stroke-width="1.6" stroke-linecap="round" transform="translate(-1 -1)"/></svg>
    <div class="slip">
      <div class="perf"></div>
      <div class="who">${esc(stubName)}</div>
      <div class="amt mono">${esc(stubAmount)}</div>
      <div class="when">expected ${esc(stubDate)}</div>
      <div class="stamp mono">${esc(stampTop)}<br>${esc(stampBottom)}</div>
    </div>
  </div>

  <div class="panel">
    <div class="panel-label">Safe to spend now</div>
    <div class="big">${esc(dollars)}<span>${esc(cents)}</span></div>
  </div>
  <div class="tape">
    <div class="slot"></div>
    <div class="paper" data-check="receipt">
      <div class="paper-head">The working</div>
      ${lines.map(row).join("")}
      <div class="total"><b>${esc(total.label)}</b><b class="mono">${esc(total.amount)}</b></div>
    </div>
  </div>

  <p class="sub" data-check="sub">${esc(pin.sub)}</p>
  ${productLine()}`;

  const css = `
  .top{position:absolute;left:70px;right:70px;top:72px;height:270px}
  .top .eyebrow{color:${C.clay}}
  .top h1{font-size:100px;line-height:1;letter-spacing:-.025em;margin-top:16px;font-weight:500;color:${C.forest}}

  .panel{position:absolute;left:70px;right:70px;top:362px;height:236px;background:${C.forest};border-radius:36px 36px 14px 14px;padding:34px 46px;color:${C.ivory};box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 18px 30px -22px rgba(16,42,36,.6)}
  .panel-label{font:600 22px "Plex";letter-spacing:.18em;text-transform:uppercase;opacity:.62}
  .big{margin-top:10px;font:600 140px/1 "Plex";letter-spacing:-.05em;font-feature-settings:"tnum" 1}
  .big span{font-size:.5em;letter-spacing:-.02em;opacity:.55}

  .tape{position:absolute;left:96px;right:96px;top:588px;height:628px;filter:drop-shadow(0 22px 18px rgba(16,42,36,.2)) drop-shadow(0 1px 0 rgba(16,42,36,.06))}
  .slot{position:absolute;left:-14px;right:-14px;top:-9px;height:20px;border-radius:999px;background:#0c211b;box-shadow:inset 0 2px 0 rgba(255,255,255,.08);z-index:2}
  .paper{position:absolute;inset:0;background:${C.paper};padding:46px 46px 0;
    -webkit-mask:linear-gradient(#000 0 0) top/100% calc(100% - 14px) no-repeat,conic-gradient(from -45deg at bottom,#0000,#000 1deg 89deg,#0000 90deg) bottom/28px 14px repeat-x;
    mask:linear-gradient(#000 0 0) top/100% calc(100% - 14px) no-repeat,conic-gradient(from -45deg at bottom,#0000,#000 1deg 89deg,#0000 90deg) bottom/28px 14px repeat-x}
  .paper::before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(24,35,31,.018) 0 2px,transparent 2px 5px);pointer-events:none}
  .paper-head{font:600 20px "Plex";letter-spacing:.18em;text-transform:uppercase;color:${C.muted};padding-bottom:10px}
  .row{display:flex;align-items:baseline;gap:12px;padding:10px 0;font-size:25px;color:#2c3833}
  .row .sign{flex:none;width:20px;text-align:center;font:500 25px "Plex Mono";color:${C.muted2}}
  .row .sign.plus{color:${C.success};font-weight:600}
  .row .label{flex:none;line-height:1.2}
  .row .label small{display:block;font:500 22px "Plex Mono";color:${C.success};margin-top:4px}
  .row .lead{flex:1;min-width:20px;border-bottom:2.5px dotted ${C.lineStrong};transform:translateY(-6px)}
  .row .fig{flex:none;font:500 26px "Plex Mono";color:${C.ink};font-feature-settings:"tnum" 1}
  .row.arrived{margin:4px -16px;padding:10px 16px;background:${C.sagePale};border-radius:10px}
  .total{display:flex;justify-content:space-between;align-items:baseline;margin-top:12px;padding-top:16px;border-top:6px double ${C.ink};font-size:30px;color:${C.ink}}
  .total .mono{font-size:32px;font-weight:600}

  .stub{position:absolute;left:572px;top:318px;width:366px;height:236px;transform:rotate(4deg);z-index:3}
  .stub .slip{position:absolute;inset:0;background:${C.ivory};border:2.5px dashed #a7aea8;border-radius:8px;padding:18px 16px 0 46px;box-shadow:0 10px 18px -12px rgba(16,42,36,.35)}
  .stub .perf{position:absolute;left:16px;top:14px;bottom:14px;width:10px;background:radial-gradient(circle,${C.lineStrong} 4px,transparent 4.5px) center top/10px 18px repeat-y}
  .stub .who{font-size:25px;color:${C.muted2};font-weight:600}
  .stub .amt{font-size:40px;font-weight:600;color:${C.muted2};margin-top:2px;letter-spacing:-.02em}
  .stub .when{font-size:22px;color:${C.muted2};margin-top:2px}
  .stub .stamp{display:inline-block;margin-top:10px;font-size:22px;line-height:1.25;color:${C.muted};border:2px solid ${C.muted2};border-radius:5px;padding:5px 8px;transform:rotate(-3deg);letter-spacing:-.02em}
  .stub .clip{position:absolute;left:170px;top:-48px;width:30px;height:90px;z-index:4;transform:rotate(-4deg)}

  .sub{position:absolute;left:70px;right:70px;top:1250px;height:90px;font-size:32px;line-height:1.3;color:${C.ink};font-family:"Newsreader",serif}
  `;
  return { id: "pin-3.2-safe-to-spend-receipt", html: page(p, { body, css, paper: C.ivory, ink: C.ink, muted: C.muted }) };
}

/* ------------------------------------------------------------ held-back envelopes */

/** A sealed envelope seen from the back: flap down, side seams, kraft fibre. Its own 430 x 320 box. */
const sealedEnvelope = () => `
  <svg class="env-art" viewBox="0 0 430 320" aria-hidden="true">
    <rect width="430" height="320" rx="7" fill="${KRAFT.body}"/>
    <path d="M0 320 L215 168 L430 320 Z" fill="${KRAFT.inner}" opacity=".55"/>
    <path d="M2 318 L190 186 M428 318 L240 186" stroke="${KRAFT.seam}" stroke-width="2.5"/>
    <path d="M6 6 L215 196 L424 6" fill="none" stroke="rgba(60,40,20,.18)" stroke-width="10" filter="url(#blur6)"/>
    <path d="M0 0 H430 L215 188 Z" fill="${KRAFT.flap}" stroke="${KRAFT.edge}" stroke-width="3" stroke-linejoin="round"/>
    <rect width="430" height="320" rx="7" fill="#fff" filter="url(#fibre)"/>
  </svg>`;

/** An envelope seen from the back with its flap open upward: back wall, pocket flaps in front. 470 x 300 body, flap 170 above. */
const openEnvelope = (slip) => `
  <svg class="env-art" viewBox="0 -170 470 470" aria-hidden="true">
    <path d="M0 0 H470 L235 -166 Z" fill="${KRAFT.inner}" stroke="${KRAFT.edge}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M0 0 H470 L235 -166 Z" fill="#fff" filter="url(#fibre)"/>
    <rect y="0" width="470" height="300" rx="6" fill="#bfa27e"/>
  </svg>
  ${slip}
  <svg class="env-art front" viewBox="0 -170 470 470" aria-hidden="true">
    <path d="M0 6 L0 294 Q0 300 6 300 L235 300 L120 170 Z" fill="${KRAFT.body}"/>
    <path d="M470 6 L470 294 Q470 300 464 300 L235 300 L350 170 Z" fill="${KRAFT.body}"/>
    <path d="M0 300 L196 132 Q235 104 274 132 L470 300 Z" fill="${KRAFT.flap}" stroke="${KRAFT.seam}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M0 4 L120 170 L0 300 Z M470 4 L350 170 L470 300 Z" fill="${KRAFT.body}" stroke="${KRAFT.seam}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M0 4 L120 170 L0 300 Z M470 4 L350 170 L470 300 Z M0 300 L196 132 Q235 104 274 132 L470 300 Z" fill="#fff" filter="url(#fibre)"/>
  </svg>`;

/** A pencil lying on the table: forest body, clay ferrule, eraser. Drawn along +x, 380 long. */
const pencil = () => `
  <svg class="pencil" viewBox="0 0 400 40" aria-hidden="true">
    <path d="M60 4 H330 V36 H60 Z" fill="${C.forest800}"/>
    <path d="M60 4 H330 V15 H60 Z" fill="${C.forest700}"/>
    <path d="M60 26 H330 V36 H60 Z" fill="${C.forest950}"/>
    <path d="M60 4 L8 20 L60 36 Z" fill="#e8cfae"/>
    <path d="M60 4 L52 6.5 Q58 20 52 33.5 L60 36 Z" fill="#d9bb93"/>
    <path d="M24 15 L8 20 L24 25 Z" fill="${C.ink}"/>
    <rect x="330" y="2" width="34" height="36" rx="2" fill="${C.clay}"/>
    <path d="M338 2 V38 M346 2 V38 M354 2 V38" stroke="#9a5a3a" stroke-width="2"/>
    <rect x="364" y="3" width="30" height="34" rx="7" fill="#e7b9a4"/>
  </svg>`;

/** A mug of tea seen from above, handle to the right. Its own 280 x 240 box. */
const mug = () => `
  <svg class="mug" viewBox="0 0 280 240" aria-hidden="true">
    <rect x="186" y="98" width="82" height="44" rx="22" fill="${C.forest950}"/>
    <rect x="200" y="110" width="50" height="20" rx="10" fill="${C.ivory}"/>
    <circle cx="120" cy="120" r="106" fill="${C.forest800}"/>
    <circle cx="120" cy="120" r="106" fill="none" stroke="${C.forest700}" stroke-width="5"/>
    <circle cx="120" cy="120" r="88" fill="${C.forest950}"/>
    <circle cx="120" cy="120" r="84" fill="#8a5236"/>
    <circle cx="120" cy="120" r="84" fill="none" stroke="#6f3f28" stroke-width="5"/>
    <ellipse cx="96" cy="94" rx="40" ry="18" transform="rotate(-30 96 94)" fill="#c58b66" opacity=".45"/>
    <path d="M44 84 A84 84 0 0 1 84 42" fill="none" stroke="${C.sage}" stroke-width="5" stroke-linecap="round" opacity=".6"/>
  </svg>`;

function envelopes() {
  const pin = plan("mmr/pin-10.1");
  const items = pin.content.items;
  const sealed = items.filter((s) => s.startsWith("Sealed: ")).map((s) => {
    const [, label, amount, due] = must(s.match(/^Sealed: (.+?) (\$[\d,.]+), (.+)$/), s);
    return { label, amount, due };
  });
  const [, bandLabel, bandAmount] = must(items.find((s) => s.startsWith("Band: "))?.match(/^Band: (.+?) (\$[\d,.]+)$/), "the band");
  const [, openLabel, openAmount] = must(items.find((s) => s.startsWith("Open envelope: "))?.match(/^Open envelope: (.+?) (\$[\d,.]+)$/), "the open envelope");
  if (sealed.length !== 2) throw new Error("the envelope bundle is drawn for two sealed bills");

  const sticker = (e) => `
      <div class="sticker">
        <div class="name hand">${esc(e.label)}</div>
        <div class="amt mono">${esc(e.amount)}</div>
        <div class="due">Due ${esc(e.due)}</div>
      </div>`;

  const body = `
  ${FIBRE}
  <svg width="0" height="0" style="position:absolute"><defs><filter id="blur6"><feGaussianBlur stdDeviation="6"/></filter></defs></svg>
  <div class="top" data-check="headline">
    <div class="eyebrow">Protect what must be paid</div>
    <h1 class="serif">${esc(pin.headline)}</h1>
    <p>${esc(pin.sub)}</p>
  </div>

  <div class="scene" data-check="envelopes">
    <div class="bundle">
      <div class="env env-a">${sealedEnvelope()}${sticker(sealed[0])}</div>
      <div class="env env-b">${sealedEnvelope()}${sticker(sealed[1])}</div>
      <div class="band">
        <span class="band-label">${esc(bandLabel)}</span>
        <span class="band-amt mono">${esc(bandAmount)}</span>
      </div>
    </div>

    <div class="open">
      ${openEnvelope(`<div class="slip"><div class="slip-label">${esc(openLabel)}</div><div class="slip-amt mono">${esc(openAmount)}</div></div>`)}
    </div>

    ${mug()}
    ${pencil()}
  </div>
  ${productLine()}`;

  const css = `
  .top{position:absolute;left:70px;right:70px;top:76px;height:420px}
  .top .eyebrow{color:${C.clay}}
  .top h1{font-size:76px;line-height:1.02;letter-spacing:-.02em;margin-top:18px;font-weight:500;color:${C.forest}}
  .top p{font-size:29px;line-height:1.38;color:${C.muted};margin-top:22px;max-width:820px}

  .scene{position:absolute;left:0;right:0;top:490px;height:830px}
  .env-art{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
  .env{position:absolute;width:430px;height:320px;filter:drop-shadow(0 16px 14px rgba(70,48,25,.22)) drop-shadow(0 2px 2px rgba(70,48,25,.12))}
  .bundle{position:absolute;left:70px;top:20px;width:860px;height:380px;transform:rotate(-2.5deg)}
  .env-a{left:0;top:18px;transform:rotate(-2deg)}
  .env-b{left:418px;top:0;transform:rotate(2.5deg)}
  .sticker{position:absolute;left:92px;top:78px;width:246px;height:150px;background:${C.paper};border-radius:12px;padding:12px 16px 0;text-align:center;box-shadow:0 2px 0 rgba(0,0,0,.05),0 6px 10px -6px rgba(70,48,25,.4)}
  .sticker .name{white-space:nowrap;font-size:42px;line-height:1;font-weight:700;color:${C.forest}}
  .sticker .amt{font-size:32px;font-weight:600;color:${C.ink};margin-top:8px}
  .sticker .due{font-size:22px;color:${C.muted};margin-top:4px}
  .band{position:absolute;left:-18px;right:-18px;top:268px;height:76px;background:${C.clay};display:flex;align-items:center;justify-content:center;gap:22px;color:${C.paper};
    box-shadow:0 8px 12px -8px rgba(70,40,20,.5),inset 0 2px 0 rgba(255,255,255,.12),inset 0 -2px 0 rgba(0,0,0,.08);transform:rotate(.6deg)}
  .band::before,.band::after{content:"";position:absolute;top:0;bottom:0;width:18px;background:#8f5236}
  .band::before{left:0;border-radius:4px 0 0 4px}.band::after{right:0;border-radius:0 4px 4px 0}
  .band-label{font:600 25px "Plex";letter-spacing:.01em}
  .band-amt{font-size:30px;font-weight:600}

  .open{position:absolute;left:120px;top:380px;width:470px;height:470px;transform:scale(.9) rotate(3deg);transform-origin:0 0;filter:drop-shadow(0 18px 16px rgba(70,48,25,.24)) drop-shadow(0 2px 2px rgba(70,48,25,.12))}
  .open .env-art{position:absolute;left:0;top:0;width:470px;height:470px}
  .slip{position:absolute;left:62px;top:40px;width:346px;height:300px;background:${C.paper};border-radius:4px;padding:30px 30px 0;box-shadow:0 4px 10px -4px rgba(70,48,25,.35);transform:rotate(-2deg)}
  .slip-label{font:600 22px "Plex";letter-spacing:.16em;text-transform:uppercase;color:${C.muted}}
  .slip-amt{font-size:72px;font-weight:600;color:${C.forest};letter-spacing:-.03em;margin-top:8px}

  .mug{position:absolute;left:660px;top:540px;width:280px;height:240px;filter:drop-shadow(0 14px 12px rgba(70,48,25,.25))}
  .pencil{position:absolute;left:600px;top:450px;width:360px;height:36px;transform:rotate(-14deg);filter:drop-shadow(0 8px 6px rgba(70,48,25,.25))}
  `;
  return { id: "pin-10.1-held-back-envelopes", html: page(p, { body, css, paper: C.ivory, ink: C.ink, muted: C.muted }) };
}

export const pins = [receipt(), envelopes()];
