/**
 * Personal Finance Companion, v3 test pins: two of the seven archetypes in
 * pinterest/strategy/personal-finance-companion.json, drawn from the
 * product's own world (a binder of ruled register pages, kept in order).
 *
 * - pfc/pin-9.2, workbook fan: six real pages of the 81-page Printable
 *   Finance Companion, spread so each title reads. Titles, eyebrows,
 *   column headers, reminders, folios and each section's colour are copied
 *   from the workbook PDF itself
 *   (printables/printableFinanceCompanionLetter.base64.ts, pp 22, 26, 38,
 *   42, 46, 54). Fact chips from the binder guide's closing paragraph.
 * - pfc/pin-10.3, sinking-fund jars: four of the five rows of the
 *   sinking-funds-explained guide's example table (src/content/guides.ts),
 *   each jar filled in proportion to its monthly amount, with the cost it
 *   comes from and the months it is divided by, as the guide works it.
 */
import { product, page, foot, esc } from "../kit.mjs";

const p = product("personal-finance-companion");
const STRATEGY = (await import("../../strategy/personal-finance-companion.json", { with: { type: "json" } })).default;
const plan = (id) => {
  const pin = STRATEGY.pins.find((x) => x.id === id);
  if (!pin) throw new Error(`no ${id} in the personal finance strategy`);
  return pin;
};
const need = (pin, text) => {
  if (!pin.content.items.includes(text)) throw new Error(`${pin.id}: "${text}" is not in its strategy items`);
  return text;
};

/* ------------------------------------------------------------ workbook fan */

/**
 * The workbook's own section colours and header tints, read from the PDF's
 * content streams (the cover's seven bars and each section's pages).
 */
const SECTION = {
  bills: { ink: "#37536c", tint: "#dfe5ec", name: "Bills" },
  subscriptions: { ink: "#494a72", tint: "#e0dfec", name: "Subscriptions" },
  debt: { ink: "#9c5a3c", tint: "#efdfd6", name: "Debt" },
  savings: { ink: "#87682c", tint: "#efe7d2", name: "Savings goals and sinking funds" },
  picture: { ink: "#24402f", tint: "#dbe4dd", name: "Financial picture" },
  review: { ink: "#7a4a34", tint: "#ece2d8", name: "Monthly review" },
};

const rows = (n, h = 27) => Array.from({ length: n }, () => `<div class="r" style="height:${h}px"></div>`).join("");
const table = (heads, n, h, cols) => `<div class="tb"><div class="th" style="grid-template-columns:${cols}">${heads.map((x) => `<span>${esc(x)}</span>`).join("")}</div>${rows(n, h)}</div>`;
const field = (label) => `<div class="fd"><span>${esc(label)}</span></div>`;
const reminder = (text) => `<div class="rm"><b>Draftpace reminder</b><span>${esc(text)}</span></div>`;

/** Each page's body, copied from the workbook PDF page it names. */
const PAGES = {
  22: {
    sec: "bills",
    eyebrow: "Bills",
    title: "Variable bills worksheet",
    desc: "Use this page for bills that change from month to month. Write the range you normally see, then choose the amount or range you want to enter after checking the latest statement.",
    body: () => `
      <div class="fields">${field("Bill name")}${field("Typical low amount")}${field("Typical high amount")}</div>
      <div class="q">What makes this bill change?</div>${rows(3, 18)}
      <div class="box"><div class="q">Recent examples</div>${table(["Month or statement", "Amount", "Why it was higher or lower"], 3, 18, "1.1fr .8fr 2fr")}</div>
      <div class="q">Decision to enter in Draftpace</div>
      <div class="ticks"><span><i></i>Use a single usual amount.</span><span><i></i>Use a range.</span><span><i></i>Check the latest statement first.</span></div>`,
    reminder: "Add confirmed due dates and funding choices in Draftpace to keep upcoming obligations current.",
  },
  26: {
    sec: "subscriptions",
    eyebrow: "Subscriptions",
    title: "Subscription inventory",
    desc: "List active and questionable subscriptions. Keep the decision column honest, even if the decision is still review.",
    body: () => table(["Subscription", "Amount", "Frequency", "Renewal date", "Decision", "Cancellation notes"], 10, 29, "1.3fr .85fr .95fr 1fr .85fr 1.35fr"),
    reminder: "Draftpace tracks subscription decisions; it does not cancel subscriptions on your behalf.",
  },
  38: {
    sec: "debt",
    eyebrow: "Debt",
    title: "Debt payoff method comparison",
    desc: "Two common ways to order debt payoff. Avalanche pays the highest interest rate first and usually costs the least. Snowball clears the smallest balance first and gives quicker wins.",
    compact: true,
    body: () => `
      <div class="two">${[["Avalanche", "Highest rate first"], ["Snowball", "Smallest balance first"]].map(([a, b]) => `<div><div class="mh"><b>${a}</b><span>${b}</span></div>${[1, 2, 3, 4, 5, 6].map((n) => `<div class="nl"><em>${n}</em><i></i></div>`).join("")}</div>`).join("")}</div>
      <div class="q">Payoff ladder <span class="note">Work your chosen order from the bottom rung up. Shade each rung as it is cleared.</span></div>
      <div class="ladder">${[5, 4, 3, 2, 1].map((n) => `<div class="rung"><em>${n}</em><span>Debt</span><span>Balance</span><span>Rate / min</span></div>`).join("")}</div>`,
    reminder: "This comparison is a way to think, not a recommendation. Current balances, rates, and minimums live in Draftpace.",
  },
  42: {
    sec: "savings",
    eyebrow: "Savings goals and sinking funds",
    title: "Sinking funds worksheet",
    desc: "Use this for costs you can see coming, even if they are not monthly.",
    body: () => table(["Future cost", "Due month or date", "Target", "Saved snapshot", "Funding source", "Next step"], 11, 30, "1.2fr 1.1fr .7fr 1fr 1fr .8fr"),
  },
  46: {
    sec: "picture",
    eyebrow: "Financial picture",
    title: "Net worth snapshot",
    desc: "A point in time snapshot: everything you own, less everything you owe. Write today's figures, not live balances, and date it.",
    body: () => `
      <div class="two">${table(["What I own", "Value"], 5, 20, "1.6fr 1fr")}${table(["What I owe", "Balance"], 5, 20, "1.6fr 1fr")}</div>
      <div class="two tot"><span>Total owned (A)</span><span>Total owed (B)</span></div>
      <div class="snap"><b>Snapshot net worth</b><span>Owned minus owed (A minus B)</span></div>`,
    reminder: "This snapshot is not a live balance. When Draftpace adds a net worth view, use it instead.",
  },
  54: {
    sec: "review",
    eyebrow: "Monthly review",
    title: "January: review",
    desc: "Start by checking your current Draftpace overview. Then note what changed this month, area by area.",
    body: () => `
      <div class="fields two-f">${field("Review date")}${field("Main focus this month")}</div>
      <div class="q">Accounts and income</div>${table(["Area", "What changed", "Update needed?"], 2, 18, "1fr 1.5fr .9fr")}
      <div class="q">Bills and subscriptions</div>${table(["Item", "Amount or date change", "Update needed?"], 2, 18, "1fr 1.5fr .9fr")}
      <div class="q">Debt and savings</div>${table(["Area", "Snapshot or change", "Update needed?"], 2, 18, "1fr 1.5fr .9fr")}`,
    reminder: "Start each monthly review by checking your current Draftpace overview.",
  },
};

/** One workbook page, as printed: running head, eyebrow, title, rule, body, reminder, folio. */
function workbookPage(folio, title, place) {
  const pg = PAGES[folio];
  if (pg.title !== title) throw new Error(`workbook p${folio} is "${pg.title}", not "${title}"`);
  const s = SECTION[pg.sec];
  return `
  <div class="wb" style="--sec:${s.ink};--tint:${s.tint};left:${place.x}px;top:${place.y}px;transform:rotate(${place.r}deg);z-index:${place.z}">
    <div class="rh"><span>Draftpace</span><span>Printable Finance Companion</span></div>
    <div class="ey">${esc(pg.eyebrow)}</div>
    <div class="ti">${esc(pg.title)}</div>
    <div class="ul"></div>
    <p class="ds${pg.compact ? " tight" : ""}">${esc(pg.desc)}</p>
    <div class="bd">${pg.body()}</div>
    ${pg.reminder ? reminder(pg.reminder) : ""}
    <div class="fo"><span>${esc(s.name)}</span><span>&bull; ${folio}</span></div>
    <div class="edge"></div>
  </div>`;
}

/** The workbook's pencil: butter-yellow hexagonal body, ferrule, pink eraser, sharpened tip. */
const PENCIL = `
  <svg class="pencil" viewBox="-10 -20 460 80" aria-hidden="true">
    <defs><filter id="pshadow" x="-10%" y="-80%" width="120%" height="260%"><feGaussianBlur stdDeviation="5"/></filter></defs>
    <path d="M6 30 H384 L438 22 L384 12 Z" transform="translate(4 12)" fill="#1e2a24" opacity=".22" filter="url(#pshadow)"/>
    <rect x="0" y="4" width="34" height="26" rx="7" fill="#f2a7c0"/>
    <rect x="30" y="3" width="26" height="28" rx="2" fill="#b9bdb8"/>
    ${[36, 43, 50].map((x) => `<line x1="${x}" y1="3" x2="${x}" y2="31" stroke="#8e938d" stroke-width="2"/>`).join("")}
    <rect x="56" y="4" width="326" height="26" fill="#f2d16b"/>
    <rect x="56" y="4" width="326" height="7" fill="#f7e19a"/>
    <rect x="56" y="22" width="326" height="8" fill="#e2bb4c"/>
    <path d="M382 4 L428 15 Q432 17 428 19 L382 30 Z" fill="#ecd2a8"/>
    <path d="M382 4 L392 9 L382 13 L392 17 L382 21 L392 25 L382 30 Z" fill="#f2d16b"/>
    <path d="M414 11.5 L430 16 Q433 17 430 18 L414 22.5 Z" fill="#3a3d3b"/>
  </svg>`;

function workbookFan() {
  const pin = plan("pfc/pin-9.2");
  // Six real pages in two splayed stacks, back to front, so every title reads.
  const spread = [
    [22, "Variable bills worksheet", { x: 48, y: 16, r: -4, z: 1 }],
    [42, "Sinking funds worksheet", { x: 42, y: 140, r: -2.5, z: 2 }],
    [26, "Subscription inventory", { x: 36, y: 264, r: -1, z: 3 }],
    [46, "Net worth snapshot", { x: 522, y: 16, r: 4, z: 4 }],
    [54, "January: review", { x: 528, y: 140, r: 2.5, z: 5 }],
    [38, "Debt payoff method comparison", { x: 534, y: 264, r: 1, z: 6 }],
  ];
  const facts = ["81 pages", "US Letter and A4", "Twelve monthly reviews"].map((f) => need(pin, f));
  const body = `
  <div class="top" data-check="headline">
    <div class="eyebrow">Printable Finance Companion</div>
    <h1 class="serif">${esc(pin.headline)}</h1>
  </div>
  <div class="desk" data-check="workbook">
    ${spread.map(([folio, title, place]) => workbookPage(folio, need(pin, title), place)).join("")}
    ${PENCIL}
  </div>
  <ul class="facts" data-check="facts">${facts.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
  <p class="sub" data-check="sub">${esc(pin.sub)}</p>
  ${foot(p, { cta: "price" })}`;
  const css = `
  .top{position:absolute;left:64px;right:64px;top:64px;height:290px}
  .top h1{font-size:62px;line-height:1.05;letter-spacing:-.015em;margin-top:16px;font-weight:500;color:var(--strong)}
  .desk{position:absolute;left:0;top:336px;width:1000px;height:842px}
  .wb{position:absolute;width:430px;height:556px;background:#fbfaf6;color:#232220;padding:22px 24px 0;transform-origin:50% 100%;
      box-shadow:0 0 0 1px rgba(35,34,32,.06),0 2px 3px rgba(35,34,32,.06),0 22px 38px -16px rgba(24,40,32,.42)}
  .wb .rh{display:flex;justify-content:space-between;font-size:10px;color:#6e6b63;padding-bottom:7px;border-bottom:1px solid #c8c4b8}
  .wb .ey{margin-top:12px;font:600 11px "Plex";letter-spacing:.2em;text-transform:uppercase;color:var(--sec)}
  .wb .ti{margin-top:8px;font:600 27.5px/1.08 "Newsreader",serif;letter-spacing:-.01em;white-space:nowrap}
  .wb .ul{width:30px;height:2.5px;background:var(--sec);margin-top:7px}
  .wb .ds{margin-top:10px;font-size:10.5px;line-height:1.42;color:#514f49}
  .wb .bd{margin-top:12px}
  .wb .ds.tight{font-size:9.6px;line-height:1.36}
  .wb .tb{margin-top:4px}
  .wb .th{display:grid;gap:4px;background:var(--tint);border-top:1.4px solid #232220;padding:7px 6px;font:600 8.6px "Plex";color:#232220;white-space:nowrap}
  .wb .th span{overflow:hidden}
  .wb .r{border-bottom:1px solid #c8c4b8}
  .wb .q{margin-top:12px;font:600 10.5px "Plex"}
  .wb .q .note{font-weight:400;font-size:8.6px;color:#6e6b63;margin-left:6px}
  .wb .fields{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
  .wb .fields.two-f{grid-template-columns:1fr 1fr;gap:22px}
  .wb .fd{height:24px;border-bottom:1px solid #a29e93;font-size:8.6px;color:#6e6b63;padding-top:4px}
  .wb .box{margin-top:12px;background:#f4f2ec;padding:2px 8px 8px}
  .wb .box .q{margin-top:8px}
  .wb .ticks{display:flex;gap:16px;margin-top:10px;font-size:8.6px;color:#514f49}
  .wb .ticks i{display:inline-block;width:8px;height:8px;border:1px solid #514f49;border-radius:2px;margin-right:4px;vertical-align:-1px}
  .wb .two{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .wb .mh{display:flex;justify-content:space-between;align-items:baseline;background:var(--tint);padding:6px 8px;font-size:10.5px;border-radius:2px}
  .wb .mh span{font-size:8px;color:#6e6b63}
  .wb .nl{display:flex;gap:8px;align-items:flex-end;height:16px}
  .wb .nl em{font:normal 600 9px "Plex";color:var(--sec);width:8px}
  .wb .nl i{flex:1;border-bottom:1px solid #c8c4b8}
  .wb .ladder{margin-top:6px;border:1px solid #c8c4b8}
  .wb .rung{display:grid;grid-template-columns:20px 1.6fr 1fr 1fr;gap:8px;align-items:center;height:19px;padding:0 6px;font-size:7.6px;color:#6e6b63;border-bottom:1px solid #e3e0d8}
  .wb .rung:nth-child(even){background:#f4f2ec}
  .wb .rung em{font:normal 600 8px/13px "Plex";width:13px;height:13px;border-radius:2px;background:var(--sec);color:#fff;text-align:center}
  .wb .tot{margin-top:8px;font-size:8.6px;color:#6e6b63}
  .wb .snap{margin-top:12px;background:var(--tint);border-left:3px solid var(--sec);padding:8px 10px;display:flex;flex-direction:column;gap:3px}
  .wb .snap b{font-size:10.5px}.wb .snap span{font-size:8px;color:#6e6b63}
  .wb .rm{position:absolute;left:24px;right:24px;bottom:42px;display:flex;gap:14px;background:#f4f2ec;border-left:3px solid var(--sec);padding:9px 10px;font-size:7.8px;color:#6e6b63;line-height:1.35}
  .wb .rm b{flex:none;color:#232220;font-weight:600}
  .wb .fo{position:absolute;left:24px;right:24px;bottom:14px;display:flex;justify-content:space-between;border-top:1px solid #c8c4b8;padding-top:6px;font-size:8.6px;color:#6e6b63}
  .wb .edge{position:absolute;right:0;top:47%;width:4px;height:30px;background:var(--sec)}
  .pencil{position:absolute;left:58px;top:590px;width:400px;height:70px;transform:rotate(-13deg);z-index:9}
  .facts{position:absolute;left:64px;right:64px;top:1196px;height:60px;list-style:none;display:flex;gap:14px}
  .facts li{display:flex;align-items:center;padding:0 24px;border-radius:999px;background:var(--soft);color:var(--strong);font-weight:600;font-size:25px;white-space:nowrap}
  .sub{position:absolute;left:64px;right:64px;top:1284px;height:44px;font-size:28px;line-height:1.35;color:var(--muted)}
  `;
  return { id: "pin-9.2-workbook-fan", html: page(p, { body, css, paper: "#eef1ec", muted: "#56605a" }) };
}

/* ------------------------------------------------------------ sinking-fund jars */

/**
 * The guide's example rows: what the pin names (from the strategy's
 * items), the cost it comes from and the months that cost covers
 * (guides.ts, sinking-funds-explained, the same table).
 */
const FUNDS = [
  { item: "Car insurance, $90.00 a month", name: ["Car", "insurance"], cost: "$540 per six months", months: 6 },
  { item: "Car registration, $10.00 a month", name: ["Car", "registration"], cost: "$120", months: 12 },
  { item: "Holiday gifts, $37.50 a month", name: ["Holiday", "gifts"], cost: "$450", months: 12 },
  { item: "Annual subscription, $8.00 a month", name: ["Annual", "subscription"], cost: "$96", months: 12 },
];

/** One mason jar, base centred on (0, 0), filled to `level` (0 to 1) of its body. */
function jar(level, name, i) {
  const top = -300; // lid top
  const body = "M-74 -238 L-74 -224 Q-98 -214 -98 -186 L-98 -26 Q-98 0 -70 0 L70 0 Q98 0 98 -26 L98 -186 Q98 -214 74 -224 L74 -238 Z";
  const fillTop = -8 - level * 196;
  const ticks = Array.from({ length: 6 }, (_, k) => -30 - k * 30).map((y) => `<line x1="84" y1="${y}" x2="${y % 60 ? 76 : 70}" y2="${y}" stroke="#0d3b2e" stroke-opacity=".22" stroke-width="2"/>`).join("");
  return `
  <g>
    <ellipse cx="6" cy="2" rx="104" ry="10" fill="#4a3a24" opacity=".16" filter="url(#blur)"/>
    <clipPath id="jar${i}"><path d="${body}"/></clipPath>
    <path d="${body}" fill="#f7faf8" fill-opacity=".72"/>
    <g clip-path="url(#jar${i})">
      <rect x="-100" y="${fillTop}" width="200" height="${-fillTop + 2}" fill="url(#fund)"/>
      <ellipse cx="0" cy="${fillTop}" rx="100" ry="9" fill="#3c7a5f"/>
      <rect x="-100" y="-8" width="200" height="10" fill="#08281f" opacity=".25"/>
    </g>
    ${ticks}
    <path d="${body}" fill="none" stroke="#163028" stroke-opacity=".28" stroke-width="3"/>
    <rect x="-82" y="-196" width="13" height="164" rx="6.5" fill="#fff" opacity=".7"/>
    <rect x="-62" y="-196" width="5" height="120" rx="2.5" fill="#fff" opacity=".45"/>
    <rect x="66" y="-180" width="6" height="70" rx="3" fill="#fff" opacity=".5"/>
    <rect x="-80" y="${top + 38}" width="160" height="24" rx="4" fill="#0d3b2e"/>
    ${[0, 1, 2].map((k) => `<line x1="-80" y1="${top + 44 + k * 6}" x2="80" y2="${top + 44 + k * 6}" stroke="#08281f" stroke-width="2"/>`).join("")}
    <rect x="-76" y="${top + 24}" width="152" height="18" rx="6" fill="#256049"/>
    <rect x="-60" y="${top + 28}" width="70" height="4" rx="2" fill="#fff" opacity=".25"/>
    <g transform="rotate(${[-2, 1.5, -1, 2][i]} 0 -150)">
      <rect x="-82" y="-206" width="164" height="104" rx="8" fill="#fafbf9" stroke="#c8d6cd" stroke-width="2"/>
      <line x1="-66" y1="-120" x2="66" y2="-120" stroke="#c8d6cd" stroke-width="2"/>
      <text x="0" y="-166" text-anchor="middle" font-family="Hand" font-weight="700" font-size="32" fill="#161d1a">${esc(name[0])}</text>
      <text x="0" y="-128" text-anchor="middle" font-family="Hand" font-weight="700" font-size="32" fill="#161d1a">${esc(name[1])}</text>
    </g>
  </g>`;
}

function sinkingJars() {
  const pin = plan("pfc/pin-10.3");
  const funds = FUNDS.map((f) => {
    need(pin, f.item);
    const [, monthly] = f.item.match(/(\$[\d.,]+) a month$/);
    return { ...f, monthly, value: Number(monthly.slice(1)) };
  });
  const most = Math.max(...funds.map((f) => f.value));
  const xs = [140, 380, 620, 860];
  const shelfY = 420;
  const scene = `
  <svg class="scene" data-check="jars" viewBox="0 0 1000 480" aria-hidden="true">
    <defs>
      <filter id="blur"><feGaussianBlur stdDeviation="6"/></filter>
      <filter id="wall" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter>
      <linearGradient id="fund" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f6e53"/><stop offset="1" stop-color="#0d3b2e"/></linearGradient>
      <linearGradient id="plank" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8c3a0"/><stop offset="1" stop-color="#cdb48c"/></linearGradient>
    </defs>
    <rect x="26" y="${shelfY + 36}" width="948" height="22" rx="6" fill="#3b2f1e" opacity=".14" filter="url(#blur)"/>
    <rect x="20" y="${shelfY}" width="960" height="16" rx="3" fill="url(#plank)"/>
    <rect x="20" y="${shelfY + 14}" width="960" height="36" rx="3" fill="#c2a57b"/>
    <path d="M40 ${shelfY + 26} q300 -6 600 2 t320 -2" fill="none" stroke="#b39469" stroke-width="2" opacity=".6"/>
    ${xs.map((x) => `<rect x="${x - 96}" y="${shelfY - 300}" width="212" height="300" rx="40" fill="#1e3a2f" opacity=".07" filter="url(#wall)"/>`).join("")}
    ${funds.map((f, i) => `<g transform="translate(${xs[i]} ${shelfY + 4}) scale(1.1)">${jar(f.value / most * 0.8, f.name, i)}</g>`).join("")}
  </svg>`;
  const body = `
  <div class="top" data-check="headline">
    <div class="eyebrow">Sinking funds</div>
    <h1 class="serif">${esc(pin.headline)}</h1>
  </div>
  <p class="rule" data-check="rule">Each cost divided by the months it covers gives a monthly figure.</p>
  <span class="example tag">Example</span>
  ${scene}
  <ul class="funds" data-check="funds">${funds.map((f) => `
    <li><b class="mono">${esc(f.monthly)}</b><span>a month</span><em>${esc(f.cost)}<br><i>&divide; ${f.months} months</i></em></li>`).join("")}
  </ul>
  <p class="sub" data-check="sub">${esc(pin.sub)}</p>
  ${foot(p, { cta: "guide" })}`;
  const css = `
  .top{position:absolute;left:64px;right:64px;top:64px;height:290px}
  .top h1{font-size:76px;line-height:1.02;letter-spacing:-.02em;margin-top:16px;font-weight:500;color:var(--strong)}
  .rule{position:absolute;left:64px;right:64px;top:372px;height:52px;padding:4px 0 0 24px;border-left:6px solid var(--accent);font:italic 400 31px/1.3 "Newsreader",serif;color:var(--strong)}
  .tag{position:absolute;right:64px;top:476px}
  .scene{position:absolute;left:0;top:446px;width:1000px;height:480px}
  .funds{position:absolute;left:20px;right:20px;top:944px;height:200px;list-style:none;display:grid;grid-template-columns:repeat(4,1fr)}
  .funds li{display:flex;flex-direction:column;align-items:center;text-align:center}
  .funds b{font-size:40px;font-weight:600;color:var(--strong);letter-spacing:-.01em}
  .funds span{font-size:23px;color:var(--strong);margin-top:2px}
  .funds em i{font-style:normal;color:var(--accent);font-weight:600}
  .funds em{font-style:normal;font-size:22px;line-height:1.4;color:var(--muted);margin-top:14px;padding-top:12px;border-top:1.5px solid #c8d6cd;min-width:150px}
  .sub{position:absolute;left:64px;right:64px;top:1196px;height:120px;padding-top:30px;border-top:1.5px solid #c8d6cd;font-size:30px;line-height:1.35;color:var(--ink)}
  `;
  return { id: "pin-10.3-sinking-jars", html: page(p, { body, css, paper: "#eef4f1", ink: "#161d1a", muted: "#56605a" }) };
}

export const pins = [workbookFan(), sinkingJars()];
