/**
 * The Home Base explainer's machine, drawn with the Anatomy kit
 * (../anatomy-kit, MIT): a care calendar you can watch work.
 *
 * - A drum turns one month at a time. Each care job has a lane, and a pin
 *   in its lane for every month homeKnowledge.ts says it belongs to.
 * - A pin passing the top lifts that lane's push-rod. When the job comes
 *   due, a token rises out of the beam above: a base, and a stack whose
 *   height is the score Home ranks by (consequence x 2.5 + intervals late
 *   - effort x 0.5), with the urgency line marked on the gauge at 2.5.
 * - Tokens slide down the chute to the rack. The front row is Home's
 *   first four, highest first; the row behind is what waits under "Show
 *   all". Done jobs leave for the bin. When nothing is due, the flag goes up.
 *
 * Everything static is drawn once; frame(state) draws only what moves,
 * and returns one SVG body in painter's order.
 */
import * as k from "../anatomy-kit/iso-kit.mjs";
import * as G from "../anatomy-kit/lathe.mjs";

export const WIDTH = 1700;
export const HEIGHT = 820;

// World layout, in units of about 1 px of the real thing: x along the machine, y toward the viewer, z up.
const PLATE = { x: -272, y: -58, w: 448, d: 96, r: 10 };
const DRUM = { x0: -236, x1: -150, y: -6, z: 64, r: 34 };
const CHEEK = { x: -256, y: -36, w: 12, d: 60, r: 2 };
const BEAM = { x: -258, y: -14, w: 140, d: 16, r: 2, z: 112, h: 8 };
export const BEAM_TOP = BEAM.z + BEAM.h;
const POST = { x: -142, y: -48, w: 8, d: 8, r: 1.5 };
const CHUTE = { x0: -118, z0: BEAM_TOP, x1: -56, z1: 18, y0: -16, y1: 4 };
const TRAY = { x: -66, y: -32, w: 160, d: 56, r: 4, h: 14 };
const BIN = { x: 100, y: -30, w: 52, d: 52, r: 4 };
const MAST = [162, -42];
export const LANES = [0, 1, 2, 3, 4, 5].map((i) => DRUM.x0 + 9.5 + 13.4 * i);
export const ROWS = { front: 11, back: -21, corridor: -5 };
export const SLOTS_X = [-36, -6, 24, 54];
export const BIN_SPOTS = [[111, -19], [126, -19], [141, -19], [111, -4], [126, -4], [141, -4]];
export const TOKEN = { r: 7, base: 3, stackR: 6.2, perPoint: 5.2 };
const TRAY_TOP = TRAY.h;
const BIN_FLOOR = 4;
export const FLOORS = { tray: TRAY_TOP, bin: BIN_FLOOR };
export const CHUTE_LINE = CHUTE;

export const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -18, 0),
    [BEAM.x, BEAM.y, BEAM_TOP + 34], [BEAM.x + BEAM.w, BEAM.y + BEAM.d, BEAM_TOP + 34],
    [MAST[0] + 26, MAST[1], 98], [DRUM.x1 + 10, DRUM.y + DRUM.r + 8, DRUM.z],
  ],
  WIDTH, HEIGHT, { pad: 34, azimuth: 52, elevation: 30 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const flat = (x, y) => k.depthOf([x, y, 0], P);
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const pts = (list) => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

// The drum turns about x. Angle 0 is the top; positive angles lean toward the viewer (+y).
const DRUM_F = G.frameOf([DRUM.x0, DRUM.y, DRUM.z], [1, 0, 0], [0, 0, 1], [0, 1, 0]);
const FACE_S = DRUM.x1 - DRUM.x0;
const radial = (phi) => [0, Math.sin(phi), Math.cos(phi)];
const onDrum = (x, phi, r) => [x, DRUM.y + r * Math.sin(phi), DRUM.z + r * Math.cos(phi)];

/* ---------------------------------------------------------------- static */

function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -18, 18, P)}"/>`];
  const feet = k.corners(PLATE, 26).sort((a, b) => flat(...a) - flat(...b));
  for (const [x, y] of feet) {
    out.push(S(k.cylinder(x, y, 8, -18, 1.8, P, 32), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 6, -16.2, 4.2, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -12, 12, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 6), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 11);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.4, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.6 }));
  // Name plate on the base, the one engraved label.
  const plate = { x: -132, y: 18, w: 46, d: 11, r: 1.2 };
  out.push(S(k.slabOf(plate, 0, 0.8, P, 3, 0.4), { tone: "lo", crease: "none" }));
  out.push(k.faceTextSvg(k.topMatrix([plate.x + plate.w / 2, plate.y + 6.8], 0.8, P, "x"), "HOME BASE", { size: 4.2, tone: "mid", anchor: "middle" }));
  out.push(D([at([plate.x + 2.2, plate.y + 5.5, 0.8]), at([plate.x + plate.w - 2.2, plate.y + 5.5, 0.8])], { size: 0.5 }));
  return out.join("");
}

function post() {
  const out = [];
  out.push(S(k.slabOf({ x: POST.x - 4, y: POST.y - 4, w: POST.w + 8, d: POST.d + 8, r: 2 }, 0, 4, P, 3, 0.5), { tone: "mid" }));
  out.push(D(k.corners({ x: POST.x - 4, y: POST.y - 4, w: POST.w + 8, d: POST.d + 8, r: 2 }, 2).map(([x, y]) => at([x, y, 4])), { size: 0.45 }));
  out.push(S(k.slabOf(POST, 4, BEAM.z - 4, P, 3, 0.4), { tone: "mid" }));
  out.push(L([30, 60, 90].map((z) => k.sideSeam(POST, z, P, 3)).join(""), { tone: "faint" }));
  return out.join("");
}

function arm() {
  const plan = { x: POST.x, y: POST.y, w: POST.w, d: BEAM.y - POST.y, r: 1.5 };
  return S(k.slabOf(plan, BEAM.z, BEAM.h, P, 3, 0.5), { tone: "mid" }) + D([at([POST.x + 4, POST.y + 4, BEAM_TOP]), at([POST.x + 4, BEAM.y - 5, BEAM_TOP])], { size: 0.45 });
}

function cheek() {
  const out = [];
  const flange = { x: CHEEK.x - 6, y: CHEEK.y - 6, w: CHEEK.w + 12, d: CHEEK.d + 12, r: 3 };
  out.push(S(k.slabOf(flange, 0, 5, P, 4, 0.6), { tone: "mid" }));
  out.push(D(k.corners(flange, 3).map(([x, y]) => at([x, y, 5])), { size: 0.5 }));
  out.push(S(k.slabOf(CHEEK, 5, BEAM.z - 5, P, 3, 0.6), { tone: "mid", inner: L([k.sideSeam(CHEEK, 40, P, 3), k.sideSeam(CHEEK, 88, P, 3)].join(""), { tone: "faint" }) }));
  // Bearing housing on the cheek's inner face, with its bolt circle, and the axle collar into the drum.
  const housing = G.frameOf([CHEEK.x + CHEEK.w, DRUM.y, DRUM.z], [1, 0, 0], [0, 0, 1], [0, 1, 0]);
  out.push(S(G.disc(0, 5, 15, housing, P, { bevel: 0.6 }), { tone: "mid" }));
  out.push(D(G.dotsOf(housing, 5, 11.5, 8, P, { all: true }), { size: 0.55 }));
  out.push(S(G.disc(5, DRUM.x0 - CHEEK.x - CHEEK.w, 8, housing, P), { tone: "mid" }));
  return out.join("");
}

function drum() {
  const profile = [[0, DRUM.r - 2.2], [2.2, DRUM.r], [FACE_S - 2.2, DRUM.r], [FACE_S, DRUM.r - 2.2]];
  const paths = G.solidOf(profile, DRUM_F, P, { bevel: 0.6 });
  // A groove between every lane, and the face's own rings.
  const grooves = [2.2, ...LANES.slice(1).map((x, i) => (x + LANES[i]) / 2 - DRUM.x0), FACE_S - 2.2].map((s) => G.arcOf(DRUM_F, s, DRUM.r, P)).join("");
  const inner = L(grooves, { tone: "faint" });
  const face = [L(G.circleOf(DRUM_F, FACE_S, DRUM.r - 6.5, P), { tone: "lo" }), L(G.circleOf(DRUM_F, FACE_S, DRUM.r - 11.5, P), { tone: "faint" })].join("");
  return S(paths, { tone: "hi", crease: "lo", inner }) + face;
}

function hub() {
  const F = G.frameOf([DRUM.x1, DRUM.y, DRUM.z], [1, 0, 0], [0, 0, 1], [0, 1, 0]);
  const out = [];
  out.push(S(G.disc(0, 2.5, 9.5, F, P, { bevel: 0.5 }), { tone: "mid" }));
  out.push(D(G.dotsOf(F, 2.5, 7.4, 6, P, { all: true }), { size: 0.45 }));
  out.push(S(G.disc(2.5, 9, 5.6, F, P, { bevel: 0.4 }), { tone: "mid", inner: k.fadedSvg(G.ribsOf(F, 2.8, 8.7, 5.6, 30, P, { fade: [0.05, 0.45] }), { tone: "lo" }) }));
  return out.join("");
}

function beam() {
  const out = [];
  for (const x of LANES) out.push(S(k.cylinder(x, DRUM.y, 3.6, BEAM.z - 4.5, 4.5, P, 24, 0.3), { tone: "mid" }));
  out.push(S(k.slabOf(BEAM, BEAM.z, BEAM.h, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(BEAM, BEAM.z + 3, P, 3), { tone: "faint" }) }));
  for (const x of LANES) {
    out.push(L(k.ring(x, DRUM.y, TOKEN.r + 0.9, BEAM_TOP, P, 40), { tone: "lo" }));
    out.push(L(k.ring(x, DRUM.y, TOKEN.r + 0.2, BEAM_TOP, P, 40), { tone: "faint" }));
  }
  out.push(D([BEAM.x + 5, BEAM.x + 22, BEAM.x + BEAM.w - 8].flatMap((x) => [at([x, BEAM.y + 3, BEAM_TOP]), at([x, BEAM.y + BEAM.d - 3, BEAM_TOP])]), { size: 0.45 }));
  // The month index: a hanger at the face's twelve o'clock, its tip lit.
  const hanger = { x: DRUM.x1 + 1.2, y: DRUM.y - 3, w: 4, d: 6, r: 1 };
  out.push(S(k.slabOf(hanger, DRUM.z + DRUM.r + 5, BEAM.z - DRUM.z - DRUM.r - 5, P, 2, 0.3), { tone: "mid" }));
  out.push(L(k.segment([DRUM.x1 + 1.4, DRUM.y, DRUM.z + DRUM.r + 5], [DRUM.x1 + 1.4, DRUM.y, DRUM.z + DRUM.r - 3.5], P), { tone: "lit", free: "end" }).replace("<path", '<path style="stroke-width:2"'));
  return out.join("");
}

const CHUTE_F = G.frameOf([CHUTE.x0, CHUTE.y0, CHUTE.z0], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
const RUN = [CHUTE.x1 - CHUTE.x0, CHUTE.z1 - CHUTE.z0];
export const chuteZ = (x) => CHUTE.z0 + ((x - CHUTE.x0) / RUN[0]) * RUN[1];

function chuteBack() {
  const out = [];
  const mid = (CHUTE.x0 + CHUTE.x1) / 2;
  const under = chuteZ(-88) - 4;
  out.push(S(k.cylinder(-88, DRUM.y, 6, 0, 3, P, 28, 0.4), { tone: "mid" }));
  out.push(S(k.cylinder(-88, DRUM.y, 2.6, 3, under - 3, P, 24), { tone: "mid", inner: L([20, 44].map((z) => k.sideArc(-88, DRUM.y, 2.6, z, P, 16)).join(""), { tone: "faint" }) }));
  out.push(S(k.slabOf({ x: -93, y: DRUM.y - 6, w: 10, d: 12, r: 1 }, under, 2, P, 2), { tone: "mid" }));
  out.push(S(G.prismOf(CHUTE_F, [[0, 0], [RUN[0], RUN[1]], [RUN[0], RUN[1] + 6], [0, 6]], 0, 2, P), { tone: "mid" }));
  void mid;
  return out.join("");
}

function chutePlate() {
  const plate = G.prismOf(CHUTE_F, [[0, 0], [RUN[0], RUN[1]], [RUN[0], RUN[1] - 3.5], [0, -3.5]], 0, CHUTE.y1 - CHUTE.y0, P);
  const ribs = [0.2, 0.4, 0.6, 0.8].map((f) => k.segment([CHUTE.x0 + RUN[0] * f, CHUTE.y0 + 2, CHUTE.z0 + RUN[1] * f], [CHUTE.x0 + RUN[0] * f, CHUTE.y1 - 2, CHUTE.z0 + RUN[1] * f], P)).join("");
  return S(plate, { tone: "mid" }) + L(ribs, { tone: "faint" });
}

function chuteFront() {
  const rail = G.prismOf(CHUTE_F, [[0, 0], [RUN[0], RUN[1]], [RUN[0], RUN[1] + 6], [0, 6]], CHUTE.y1 - CHUTE.y0 - 2, CHUTE.y1 - CHUTE.y0, P);
  const rivets = [0.15, 0.5, 0.85].map((f) => at([CHUTE.x0 + RUN[0] * f, CHUTE.y1, CHUTE.z0 + RUN[1] * f + 3]));
  return S(rail, { tone: "mid" }) + D(rivets, { size: 0.5 });
}

function trayBody() {
  const out = [`<path class="iso-halo" d="${k.haloOf(k.insetPlan(TRAY, 2), 0, 0.1, P)}" style="filter:blur(5px)"/>`];
  out.push(S(k.slabOf(TRAY, 0, TRAY.h, P, 5, 0.8), { tone: "mid", inner: L(k.sideSeam(TRAY, 4, P, 5), { tone: "faint" }) }));
  for (const x of SLOTS_X) {
    out.push(L(k.ring(x, ROWS.front, TOKEN.r + 1.4, TRAY_TOP, P, 40), { tone: "lo" }));
    out.push(L(k.ring(x, ROWS.back, TOKEN.r + 1.4, TRAY_TOP, P, 40), { tone: "faint" }));
  }
  // The corridor between the rows, where tokens travel.
  out.push(L(k.lineOnTop([TRAY.x + 3, ROWS.corridor - 8.5], [TRAY.x + TRAY.w - 3, ROWS.corridor - 8.5], TRAY_TOP, P) + k.lineOnTop([TRAY.x + 3, ROWS.corridor + 8.5], [TRAY.x + TRAY.w - 3, ROWS.corridor + 8.5], TRAY_TOP, P), { tone: "faint" }));
  // Back rim and left rim, behind everything on the tray.
  out.push(S(k.slabOf({ x: TRAY.x, y: TRAY.y, w: TRAY.w, d: 3, r: 1 }, TRAY_TOP, 5, P, 2, 0.3), { tone: "mid" }));
  out.push(S(k.slabOf({ x: TRAY.x, y: TRAY.y + 3, w: 3, d: TRAY.d - 6, r: 1 }, TRAY_TOP, 5, P, 2, 0.3), { tone: "mid" }));
  return out.join("");
}

/** The gauge: one tick per half point of score, a major per point, and the urgency line at 2.5 lit. */
function gauge() {
  const gx = TRAY.x + 7;
  const plan = { x: gx - 3, y: TRAY.y + 3, w: 6, d: 3, r: 0.8 };
  const z0 = TRAY_TOP + TOKEN.base;
  const out = [S(k.slabOf(plan, TRAY_TOP + 5, 32, P, 2, 0.3), { tone: "mid" })];
  const face = plan.y + plan.d;
  const ticks = [];
  for (let n = 0; n <= 10; n++) {
    const z = z0 + n * TOKEN.perPoint / 2;
    if (z > TRAY_TOP + 36.5) break;
    ticks.push({ z, major: n % 2 === 0 });
  }
  out.push(L(ticks.filter((t) => !t.major).map((t) => k.segment([gx - 3, face, t.z], [gx - 0.6, face, t.z], P)).join(""), { tone: "lo" }));
  out.push(L(ticks.filter((t) => t.major).map((t) => k.segment([gx - 3, face, t.z], [gx + 0.8, face, t.z], P)).join(""), { tone: "mid" }));
  const line = z0 + 2.5 * TOKEN.perPoint;
  out.push(L(k.segment([gx - 3, face, line], [gx + 3, face, line], P), { tone: "lit" }).replace("<path", '<path style="stroke-width:1.8"'));
  return out.join("");
}

function trayFront() {
  return S(k.slabOf({ x: TRAY.x, y: TRAY.y + TRAY.d - 3, w: TRAY.w, d: 3, r: 1 }, TRAY_TOP, 5, P, 2, 0.3), { tone: "mid" })
    + D(SLOTS_X.map((x) => at([x, TRAY.y + TRAY.d - 1.5, TRAY_TOP + 5])), { size: 0.45 });
}

function trayRight() {
  return S(k.slabOf({ x: TRAY.x + TRAY.w - 3, y: TRAY.y + 3, w: 3, d: TRAY.d - 6, r: 1 }, TRAY_TOP, 5, P, 2, 0.3), { tone: "mid" });
}

const WALL = 3, BIN_H = 26;
function binBack() {
  const out = [`<path class="iso-halo" d="${k.haloOf(k.insetPlan(BIN, 2), 0, 0.1, P)}" style="filter:blur(5px)"/>`];
  out.push(S(k.slabOf(BIN, 0, BIN_FLOOR, P, 5, 0.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(BIN, WALL + 2), BIN_FLOOR, P, 4), { tone: "faint" }));
  out.push(S(k.slabOf({ x: BIN.x, y: BIN.y, w: BIN.w, d: WALL, r: 1 }, BIN_FLOOR, BIN_H - BIN_FLOOR, P, 2, 0.4), { tone: "mid" }));
  out.push(S(k.slabOf({ x: BIN.x, y: BIN.y + WALL, w: WALL, d: BIN.d - 2 * WALL, r: 1 }, BIN_FLOOR, BIN_H - BIN_FLOOR, P, 2, 0.4), { tone: "mid" }));
  return out.join("");
}
function binFront() {
  const out = [];
  out.push(S(k.slabOf({ x: BIN.x + BIN.w - WALL, y: BIN.y + WALL, w: WALL, d: BIN.d - 2 * WALL, r: 1 }, BIN_FLOOR, BIN_H - BIN_FLOOR, P, 2, 0.4), { tone: "mid" }));
  const front = { x: BIN.x, y: BIN.y + BIN.d - WALL, w: BIN.w, d: WALL, r: 1 };
  out.push(S(k.slabOf(front, BIN_FLOOR, BIN_H - BIN_FLOOR, P, 2, 0.4), { tone: "mid", inner: L(k.sideSeam(front, 12, P, 2), { tone: "faint" }) }));
  out.push(D([BIN.x + 4, BIN.x + BIN.w - 4].map((x) => at([x, BIN.y + BIN.d - 1.5, BIN_H])), { size: 0.45 }));
  return out.join("");
}

function mast() {
  const [x, y] = MAST;
  return S(k.cylinder(x, y, 6, 0, 3, P, 28, 0.4), { tone: "mid" })
    + S(k.cylinder(x, y, 1.4, 3, 88, P, 16), { tone: "mid", crease: "none" })
    + S(G.sphereOf([x, y, 92.5], 2.4, P), { tone: "mid" });
}

/* ---------------------------------------------------------------- moving */

/** The pins at drum rotation `month` (the month at the top, 1-12, fractional between). */
function pins(jobs, month) {
  const back = [], front = [];
  const V = G.viewOf(P);
  for (const job of jobs) {
    for (const m of job.months) {
      let phi = ((m - month) / 12) * Math.PI * 2;
      phi = Math.atan2(Math.sin(phi), Math.cos(phi));
      const x = LANES[job.lane];
      const dir = radial(phi);
      const F = G.frameAlong(onDrum(x, phi, DRUM.r - 0.4), dir);
      const svg = S(G.disc(0, 4.2, 1.5, F, P), { tone: "mid", crease: "none" }) + S(G.disc(4.2, 6.4, 2.6, F, P, { bevel: 0.3 }), { tone: "hi" });
      (G.dot3(dir, V) < 0 ? back : front).push({ svg, key: G.dot3(onDrum(x, phi, DRUM.r), V) });
    }
  }
  const order = (list) => list.sort((a, b) => a.key - b.key).map((p) => p.svg).join("");
  return { back: order(back), front: order(front) };
}

/** How far each lane's rod is lifted: a pin under it raises it by up to the pin's height. */
export function lifts(jobs, month) {
  return LANES.map((_, lane) => {
    let lift = 0;
    for (const job of jobs.filter((j) => j.lane === lane)) for (const m of job.months) {
      let d = ((m - month) / 12) * 360;
      d = ((d + 540) % 360) - 180;
      const w = 11;
      if (Math.abs(d) < w) lift = Math.max(lift, 6.4 * Math.cos((d / w) * Math.PI / 2) ** 2);
    }
    return lift;
  });
}

function rods(liftList) {
  return LANES.map((x, i) => {
    const z0 = DRUM.z + DRUM.r + 0.2 + liftList[i];
    return S(k.cylinder(x, DRUM.y, 2.4, z0, 1.6, P, 20, 0.2), { tone: liftList[i] > 0.4 ? "hi" : "mid", lit: liftList[i] > 0.4 })
      + S(k.cylinder(x, DRUM.y, 1.5, z0 + 1.6, BEAM.z - 4.5 - z0 - 1.6 + 6, P, 16), { tone: "mid", crease: "none" });
  }).join("");
}

/** The month face: twelve ticks and the month initials, turning with the drum. */
function face(month) {
  const out = [];
  const V = G.viewOf(P);
  const ticks = [];
  for (let m = 1; m <= 12; m++) {
    const phi = ((m - month) / 12) * Math.PI * 2;
    const a = G.pointOf(DRUM_F, FACE_S, DRUM.r - 6.8, phi);
    const b = G.pointOf(DRUM_F, FACE_S, DRUM.r - 3.4, phi);
    ticks.push(k.segment(a, b, P));
    // Half-month ticks between.
    const h = phi + Math.PI / 12;
    ticks.push(k.segment(G.pointOf(DRUM_F, FACE_S, DRUM.r - 5.2, h), G.pointOf(DRUM_F, FACE_S, DRUM.r - 3.4, h), P));
    // The initial, upright along its radius, laid in the face's plane.
    const c = G.pointOf(DRUM_F, FACE_S + 0.05, DRUM.r - 9.2, phi);
    const up = radial(phi);
    // Seen from +x, a letter's right is -y at the top of the face, turning with it.
    const right = [0, -Math.cos(phi), Math.sin(phi)];
    const o = at(c);
    const r1 = at([c[0] + right[0], c[1] + right[1], c[2] + right[2]]);
    const d1 = at([c[0] - up[0], c[1] - up[1], c[2] - up[2]]);
    const matrix = `matrix(${(r1[0] - o[0]).toFixed(3)} ${(r1[1] - o[1]).toFixed(3)} ${(d1[0] - o[0]).toFixed(3)} ${(d1[1] - o[1]).toFixed(3)} ${o[0].toFixed(2)} ${o[1].toFixed(2)})`;
    const current = Math.abs(((m - month + 18) % 12) - 6) < 0.5;
    out.push(`<text class="iso-face-text" data-tone="${current ? "hi" : "mid"}" transform="${matrix}" font-size="5.4" text-anchor="middle" dominant-baseline="central" ${current ? 'style="font-weight:600"' : ""}>${"JFMAMJJASOND"[m - 1]}</text>`);
  }
  void V;
  out.unshift(L(ticks.join(""), { tone: "mid" }));
  out.push(D(G.dotsOf(DRUM_F, FACE_S, DRUM.r - 15, 8, P, { all: true, phase: -((month - 1) / 12) * Math.PI * 2 + Math.PI / 8 }), { size: 0.5 }));
  return out.join("");
}

/** One token: a base and a stack as tall as its score, with a line every half point and its score on top. */
export function token([x, y, z], score, { lit = false, label = true } = {}) {
  const h = Math.max(0, score) * TOKEN.perPoint;
  const out = [];
  out.push(S(k.cylinder(x, y, TOKEN.r, z, TOKEN.base, P, 36, 0.4), { tone: "mid", className: lit ? "hb-lit hb-base" : undefined }));
  const z1 = z + TOKEN.base;
  if (h > 0.05) {
    const lines = [];
    for (let s = 0.5; s * TOKEN.perPoint < h - 0.4; s += 0.5) lines.push(k.sideArc(x, y, TOKEN.stackR, z1 + s * TOKEN.perPoint, P, 24));
    out.push(S(k.cylinder(x, y, TOKEN.stackR, z1, h, P, 36, 0.5), { tone: "hi", crease: "lo", className: lit ? "hb-lit" : undefined, inner: L(lines.join(""), { tone: "faint" }) }));
  }
  const top = z1 + h;
  if (label) out.push(k.faceTextSvg(k.topMatrix([x, y + 1.6], top, P, "x"), score.toFixed(1), { size: 3.6, tone: lit ? "hi" : "mid", anchor: "middle" }));
  return out.join("");
}

/** The part of a token above the beam top, while it rises out of its slot. */
function emerging(x, y, svg) {
  const [vx, vy] = k.towardViewer(P);
  const facing = Math.atan2(vy, vx);
  const r = TOKEN.r + 0.25;
  const arc = [];
  for (let i = 0; i <= 24; i++) {
    const a = facing - Math.PI / 2 + (Math.PI * i) / 24;
    arc.push(at([x + r * Math.cos(a), y + r * Math.sin(a), BEAM_TOP]));
  }
  const up = (p) => [p[0], p[1] - 400];
  const poly = [...arc, up(arc[arc.length - 1]), up(arc[0])];
  const id = `em${Math.round(x * 10)}`;
  return `<clipPath id="${id}"><polygon points="${pts(poly)}"/></clipPath><g clip-path="url(#${id})">${svg}</g>`;
}

function pennant(rise) {
  const [x, y] = MAST;
  // Furled at the foot of the mast until it goes up; it opens as it rises.
  const z = 6 + rise * 74;
  const open = 1.4 + 22.6 * rise;
  const tip = [x + open, y, z + 6], top = [x + 1.4, y, z + 12], low = [x + 1.4, y, z];
  return `<path class="hb-flag" d="M${at(top).join(" ")}L${at(tip).join(" ")}L${at(low).join(" ")}Z"/>`
    + L(k.segment(low, top, P), { tone: "mid" });
}

/* ---------------------------------------------------------------- frame */

const STATIC = {
  base: base(), post: post(), cheek: cheek(), drum: drum(), hub: hub(), arm: arm(), beam: beam(),
  chuteBack: chuteBack(), chutePlate: chutePlate(), chuteFront: chuteFront(),
  trayBody: trayBody(), gauge: gauge(), trayFront: trayFront(), trayRight: trayRight(),
  binBack: binBack(), binFront: binFront(), mast: mast(),
};

/**
 * One frame. `state` = { month, tokens: [{ at:[x,y,z], score, zone, lit }], flag }.
 * A token's zone says which part of the machine it is in, and so where it paints:
 * "slot" (rising out of the beam), "beam", "chute", "tray", "leaving" (over the tray's right rim), "bin".
 */
export function frame(jobs, state) {
  const { back, front } = pins(jobs, state.month);
  const lift = lifts(jobs, state.month);
  const tok = (zone) => state.tokens.filter((t) => t.zone === zone).sort((a, b) => flat(a.at[0], a.at[1]) - flat(b.at[0], b.at[1]) || a.at[2] - b.at[2]);
  const draw = (t) => token(t.at, t.score, { lit: t.lit });
  return [
    STATIC.base,
    STATIC.post, STATIC.cheek, back, STATIC.drum, face(state.month), front, STATIC.hub, rods(lift), STATIC.arm, STATIC.beam,
    tok("slot").map((t) => emerging(t.at[0], t.at[1], draw(t))).join(""),
    tok("beam").map(draw).join(""),
    STATIC.trayBody, STATIC.gauge,
    STATIC.chuteBack, STATIC.chutePlate, tok("chute").map(draw).join(""), STATIC.chuteFront,
    tok("tray").map(draw).join(""),
    STATIC.trayFront, STATIC.trayRight,
    tok("leaving").map(draw).join(""),
    STATIC.mast, pennant(state.flag ?? 0),
    STATIC.binBack, tok("bin").map(draw).join(""), STATIC.binFront,
  ].join("");
}

export const LABEL = "A care calendar machine. A drum turns month by month; each care job has a lane with a pin in every month it belongs to. A pin at the top lifts its push-rod, and when the job is due a token rises from the beam, as tall as its score, and slides down the chute to a rack whose front row holds Home's first four, highest first, with the rest behind. Done jobs go to the bin; when nothing is due, the flag goes up.";
export { dist };
