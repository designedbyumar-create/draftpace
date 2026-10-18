/**
 * The Home Base explainer, second by second: which month the drum shows,
 * where every token is, what the camera looks at, and which of the
 * product's own lines is on screen. Every date, score, order and detail
 * line comes from truth.ts, which ran Home Base's own code.
 */
import * as k from "../anatomy-kit/iso-kit.mjs";
import * as M from "./machine.mjs";

export const FPS = 30;
export const DURATION = 56;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (v) => { const x = clamp01(v); return x * x * (3 - 2 * x); };
const inOut = (v) => { const x = clamp01(v); return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2; };
const lerp = (a, b, f) => a + (b - a) * f;
const lerp3 = (a, b, f) => [lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f)];
const DAY = 86_400_000;
const ms = (iso) => Date.parse(`${iso}T12:00:00Z`);
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** Film time → story date. The drum's month follows the date: the 1st of a month is that month at the top. */
const DATES = [
  [0, "2026-08-24"], [4.4, "2026-08-24"], [7.0, "2026-09-02"], [14.0, "2026-09-02"], [16.5, "2026-10-02"],
  [26.0, "2026-10-02"], [27.6, "2026-10-20"], [30.0, "2026-10-20"], [30.4, "2026-10-21"], [31.8, "2026-10-21"], [33.5, "2026-11-02"],
  [38.0, "2026-11-02"], [39.4, "2026-11-14"], [43.4, "2026-11-14"], [45.6, "2026-12-01"], [DURATION, "2026-12-01"],
];
function dateAt(t) {
  for (let i = 1; i < DATES.length; i++) {
    const [t0, d0] = DATES[i - 1], [t1, d1] = DATES[i];
    if (t <= t1) return ms(d0) + (ms(d1) - ms(d0)) * inOut((t - t0) / Math.max(t1 - t0, 1e-6));
  }
  return ms(DATES[DATES.length - 1][1]);
}
function monthOf(when) {
  const d = new Date(when);
  const days = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  return d.getUTCMonth() + 1 + (d.getUTCDate() - 1 + d.getUTCHours() / 24 - 0.5) / days;
}
const dateLabel = (when) => { const d = new Date(when); return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };

export function makeFilm(T) {
  const jobs = new Map(T.jobs.map((j) => [j.id, j]));
  /** The score Home ranks a due job by on this date (truth.ts checked this formula against the product). */
  const scoreOn = (id, when) => {
    const j = jobs.get(id);
    const late = Math.min(Math.max((when - ms(T.due[id])) / DAY / j.intervalDays, 0), 2);
    return j.consequence * 2.5 + late - j.effort * 0.5;
  };
  const visit = (date) => T.visits.find((v) => v.date === date);
  const shown = (date, id) => visit(date).due.find((s) => s.id === id);

  /* ---------------------------------------------------------- itineraries */
  const routes = new Map(); // id -> [{ t, p, zone }]
  const lit = new Map(); // id -> [[t0, t1]]
  const landings = []; // for the sound
  const push = (id, t, p, zone) => { if (!routes.has(id)) routes.set(id, []); routes.get(id).push({ t, p, zone }); };
  const last = (id) => routes.get(id)[routes.get(id).length - 1];
  const glow = (id, t0, t1) => { if (!lit.has(id)) lit.set(id, []); lit.get(id).push([t0, t1]); };
  const front = (i) => [M.SLOTS_X[i], M.ROWS.front, M.FLOORS.tray];
  const back = (i) => [M.SLOTS_X[i], M.ROWS.back, M.FLOORS.tray];
  const corridor = (x) => [x, M.ROWS.corridor, M.FLOORS.tray];
  const CORRIDOR_SPEED = 120;
  const heightOf = (id, t) => M.TOKEN.base + Math.max(0, scoreOn(id, dateAt(t))) * M.TOKEN.perPoint;

  /** Raised by its pin, out of the beam, along it, down the chute, along the corridor and into its place. */
  function deliver(id, t0, place) {
    const x = M.LANES[jobs.get(id).lane];
    const h = heightOf(id, t0);
    push(id, t0, [x, -6, M.BEAM_TOP - h - 1], "slot");
    let t = t0 + 0.65; push(id, t, [x, -6, M.BEAM_TOP + 4], "slot");
    t += 0.12; push(id, t, [x, -6, M.BEAM_TOP], "beam");
    t += 0.15; push(id, t, [x, -6, M.BEAM_TOP], "beam");
    const end = M.CHUTE_LINE.x0 - 2;
    t += (end - x) / 170; push(id, t, [end, -6, M.BEAM_TOP], "beam");
    t += 0.06; push(id, t, [M.CHUTE_LINE.x0 + 1, -6, M.chuteZ(M.CHUTE_LINE.x0 + 1)], "chute");
    t += 0.42; push(id, t, [M.CHUTE_LINE.x1, -6, M.CHUTE_LINE.z1], "chute");
    t += 0.12; push(id, t, corridor(-50), "tray");
    t += Math.abs(place[0] + 50) / CORRIDOR_SPEED; push(id, t, corridor(place[0]), "tray");
    t += 0.32; push(id, t, place, "tray");
    landings.push(t);
    glow(id, t0, t + 1.6);
    return t;
  }
  /** Along its own row, one or more places. */
  function shift(id, t0, to, dur = 0.55) {
    const from = last(id).p;
    push(id, t0, from, "tray");
    push(id, t0 + dur, to, "tray");
    return t0 + dur;
  }
  /** Out of its row, along the corridor, into another place. */
  function move(id, t0, to) {
    const from = last(id).p;
    push(id, t0, from, "tray");
    let t = t0 + 0.3; push(id, t, corridor(from[0]), "tray");
    t += Math.abs(to[0] - from[0]) / CORRIDOR_SPEED; push(id, t, corridor(to[0]), "tray");
    t += 0.3; push(id, t, to, "tray");
    landings.push(t);
    glow(id, t0, t + 0.6);
    return t;
  }
  /** Done: along the corridor, over the rim and into the bin. */
  function leave(id, t0, spot) {
    const from = last(id).p;
    push(id, t0, from, "tray");
    let t = t0 + 0.3; push(id, t, corridor(from[0]), "tray");
    t += (86 - from[0]) / CORRIDOR_SPEED; push(id, t, corridor(86), "tray");
    t += 0.22; push(id, t, [97, M.ROWS.corridor, 34], "leaving");
    const [sx, sy] = M.BIN_SPOTS[spot];
    t += 0.3; push(id, t, [sx, sy, 34], "bin");
    t += 0.28; push(id, t, [sx, sy, M.FLOORS.bin], "bin");
    landings.push(t);
    glow(id, t0, t);
    return t;
  }

  // September: the chimney and the furnace come due on the 1st.
  deliver("chimney.sweep", 7.0, front(0));
  deliver("furnace.tune-up", 8.1, front(1));
  // October: irrigation, the outdoor faucet and the humidifier. Home's order: faucet, chimney, irrigation, furnace; the humidifier fifth.
  shift("furnace.tune-up", 17.9, front(2));
  deliver("irrigation.blowout", 16.6, front(1));
  shift("furnace.tune-up", 19.55, front(3));
  shift("irrigation.blowout", 19.4, front(2));
  shift("chimney.sweep", 19.25, front(1));
  deliver("hose-bib.winterize", 17.75, front(0));
  deliver("humidifier.pad", 19.4, back(0));
  // 20 October: the chimney and the irrigation are done.
  leave("chimney.sweep", 28.0, 0);
  leave("irrigation.blowout", 28.55, 1);
  shift("furnace.tune-up", 30.2, front(1), 0.8);
  move("humidifier.pad", 30.5, front(2));
  // November: the gutters come due.
  shift("humidifier.pad", 34.9, front(3));
  deliver("gutter.clean", 33.6, front(2));
  // 14 November: everything else is done.
  leave("hose-bib.winterize", 39.6, 2);
  leave("furnace.tune-up", 40.35, 3);
  leave("gutter.clean", 41.1, 4);
  leave("humidifier.pad", 41.85, 5);
  for (const list of routes.values()) list.sort((a, b) => a.t - b.t);

  const tokenAt = (id, t) => {
    const list = routes.get(id);
    if (!list || t < list[0].t) return null;
    let p = list[list.length - 1].p, zone = list[list.length - 1].zone;
    for (let i = 1; i < list.length; i++) {
      if (t <= list[i].t) {
        const a = list[i - 1], b = list[i];
        const f = b.t - a.t < 1e-6 ? 1 : (t - a.t) / (b.t - a.t);
        p = lerp3(a.p, b.p, a.zone === "chute" ? f * f * 0.4 + f * 0.6 : smooth(f));
        zone = a.zone === "slot" && b.zone === "beam" ? "beam" : a.zone === "beam" && b.zone === "chute" ? "chute" : a.zone === "tray" && b.zone === "leaving" ? "leaving" : a.zone === "leaving" ? "bin" : a.zone;
        break;
      }
    }
    const done = T.doneInFilm.find((d) => d.jobs.includes(id));
    const whenDone = done ? ms(done.date) : Infinity;
    const when = Math.min(dateAt(t), whenDone);
    const glowing = (lit.get(id) ?? []).some(([a, b]) => t >= a && t <= b);
    return { at: p, zone, score: Math.max(0, scoreOn(id, when)), lit: glowing };
  };

  /* ---------------------------------------------------------- words */
  const formula = (id, date) => {
    const j = jobs.get(id), s = shown(date, id);
    return `consequence ${j.consequence} × 2.5 − effort ${j.effort} × 0.5 = ${s.score.toFixed(1)} · ${s.urgency === "soon" ? "soon" : "can wait"}`;
  };
  const read = (id, date) => ({ title: `${jobs.get(id).task} <span>· ${jobs.get(id).item}</span>`, detail: shown(date, id).detail, math: formula(id, date) });
  const READS = [
    [7.4, 9.9, read("chimney.sweep", "2026-09-02")],
    [9.9, 13.6, read("furnace.tune-up", "2026-09-02")],
    [17.0, 19.0, read("irrigation.blowout", "2026-10-02")],
    [19.0, 20.6, read("hose-bib.winterize", "2026-10-02")],
    [20.6, 25.8, { ...read("humidifier.pad", "2026-10-02"), math: `${formula("humidifier.pad", "2026-10-02")} · fifth` }],
    [27.8, 30.0, { title: "Inspect and sweep, Blow out the lines", detail: "Done on 20 October", math: "off the list until next season" }],
    [30.0, 32.4, { title: "Home, 21 October", detail: visit("2026-10-21").due.map((s) => jobs.get(s.id).item).join(", "), math: "in order of what it would cost to leave" }],
    [33.9, 37.8, read("gutter.clean", "2026-11-02")],
    [39.4, 43.6, { title: "Shut off and drain, Book a tune-up, Clear the gutters, Replace the pad", detail: "Done on 14 November", math: "off the list until next season" }],
    [45.8, 51.4, { title: "Home, 1 December", detail: "Nothing is due", math: "" }],
  ];
  const SAYS = [
    [0.4, 4.2, "Home Base remembers your home so you do not have to."],
    [4.5, 9.6, "A hand-built care schedule covering 122 kinds of thing, including seasonal jobs.", "Each job has a lane on the drum, and a pin in every month it belongs to."],
    [9.8, 14.4, "Seasonal work raised in the month it actually belongs to."],
    [16.7, 21.4, "Ranked by what it would cost you to leave it.", "Each token is as tall as its score. Consequence counts most."],
    [21.6, 25.9, "It shows the few things worth your attention.", "Home lists the first four. Under them: “1 more, when you get to it.”"],
    [26.1, 32.4, "The boring, expensive jobs raised before they become repairs, not after."],
    [32.6, 38.0, "Every row states the fact that put it there."],
    [38.2, 45.2, "It knows what needs doing and when, and it stays quiet the rest of the time."],
    [45.8, 51.4, "Nothing needs you today.", "One page that answers whether anything needs you this week, in a sentence, instead of a dashboard to interpret."],
  ];
  const window = (list, t, fade = 0.35) => {
    for (const [t0, t1, ...rest] of list) if (t >= t0 - fade && t <= t1 + fade) return { alpha: Math.min(smooth((t - t0 + fade) / fade), smooth((t1 + fade - t) / fade)), value: rest, key: String(t0) };
    return { alpha: 0, value: null, key: "" };
  };

  /* ---------------------------------------------------------- camera */
  const DRUM_SHOT = [-196, -6, 92], RACK_SHOT = [26, -5, 22], MID_SHOT = [-104, -6, 60], WIDE = [-52, -10, 52];
  const SHOTS = [
    [0, WIDE, 1.12], [3.6, WIDE, 1.12], [5.2, DRUM_SHOT, 2.0], [8.0, DRUM_SHOT, 2.0], [9.6, RACK_SHOT, 2.1], [13.4, RACK_SHOT, 2.1],
    [15.0, DRUM_SHOT, 1.9], [17.6, DRUM_SHOT, 1.9], [19.2, MID_SHOT, 1.3], [21.6, MID_SHOT, 1.3], [22.8, RACK_SHOT, 2.05], [26.0, RACK_SHOT, 2.05],
    [27.4, [52, -5, 22], 1.85], [32.0, [52, -5, 22], 1.85], [33.2, DRUM_SHOT, 1.8], [34.6, DRUM_SHOT, 1.8], [36.0, MID_SHOT, 1.35], [38.4, RACK_SHOT, 1.55],
    [43.4, [52, -5, 18], 1.55], [44.6, DRUM_SHOT, 1.8], [46.0, DRUM_SHOT, 1.8], [47.8, [-44, -10, 34], 1.12], [DURATION, [-44, -10, 34], 1.12],
  ];
  const cameraAt = (t) => {
    for (let i = 1; i < SHOTS.length; i++) {
      const [t0, p0, z0] = SHOTS[i - 1], [t1, p1, z1] = SHOTS[i];
      if (t <= t1) { const f = inOut((t - t0) / (t1 - t0)); return { focus: lerp3(p0, p1, f), zoom: lerp(z0, z1, f) }; }
    }
    const [, p, z] = SHOTS[SHOTS.length - 1];
    return { focus: p, zoom: z };
  };

  const FLAG = [46.2, 47.7];
  const ids = T.jobs.map((j) => j.id);

  function stateAt(t) {
    const when = dateAt(t);
    const tokens = ids.map((id) => tokenAt(id, t)).filter(Boolean);
    const body = M.frame(T.jobs, { month: monthOf(when), tokens, flag: inOut((t - FLAG[0]) / (FLAG[1] - FLAG[0])) });
    const cam = cameraAt(t);
    const [fx, fy] = k.iso(cam.focus, M.P);
    const svg = `<g transform="translate(960 430) scale(${cam.zoom.toFixed(4)}) translate(${(-fx).toFixed(2)} ${(-fy).toFixed(2)})">${body}</g>`;
    const say = window(SAYS, t);
    const r = window(READS, t, 0.25);
    const sayHtml = say.value ? `${say.value[0]}${say.value[1] ? `<small>${say.value[1]}</small>` : ""}` : "";
    const readHtml = r.value ? `<b>${r.value[0].title}</b>${r.value[0].detail}${r.value[0].math ? `<br><i>${r.value[0].math}</i>` : ""}` : "";
    const end = smooth((t - 51.6) / 0.8);
    return { svg, machine: 1 - end * 0.0, say: sayHtml, sayKey: say.key, sayAlpha: say.alpha * (1 - end), read: readHtml, readAlpha: r.alpha * (1 - end), date: dateLabel(when), end, intro: 1 - smooth(t / 0.6) };
  }

  /** The closest two tokens on the tray ever come, for the build to refuse a collision. */
  function closest() {
    let worst = { d: Infinity, t: 0, pair: "" };
    for (let f = 0; f <= DURATION * FPS; f++) {
      const t = f / FPS;
      const on = ids.map((id) => [id, tokenAt(id, t)]).filter(([, s]) => s && (s.zone === "tray" || s.zone === "leaving"));
      for (let i = 0; i < on.length; i++) for (let j = i + 1; j < on.length; j++) {
        const d = Math.hypot(on[i][1].at[0] - on[j][1].at[0], on[i][1].at[1] - on[j][1].at[1]);
        if (d < worst.d) worst = { d, t, pair: `${on[i][0]} / ${on[j][0]}` };
      }
    }
    return worst;
  }

  return { stateAt, closest, landings: [...landings].sort((a, b) => a - b), flagAt: FLAG[0] };
}
