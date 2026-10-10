#!/usr/bin/env node
/**
 * Draftpace's own sound-effect kit, synthesized from code rather than
 * downloaded: every sound here is ours outright, reproducible, and tunable
 * (one parameter change regenerates the whole kit consistently).
 *
 *   node scripts/synth-sfx.mjs        writes public/audio/kit/*.wav
 *
 * 48 kHz, 16-bit stereo. Deterministic: a seeded noise source, so the same
 * script always writes byte-identical files. The palette is deliberately
 * soft and warm (Draftpace's "calm" motion personality): rounded
 * transients, no harsh highs, short reverb tails, nothing that reads as an
 * alarm or a notification ding.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SR = 48000;
const OUT = path.resolve(process.cwd(), "public/audio/kit");

// ---------- primitives ----------

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const buf = (seconds) => new Float32Array(Math.round(seconds * SR));

/** Pink-ish noise (Paul Kellet's economy filter over white). */
function pinkNoise(n, seed) {
  const r = rng(seed);
  const out = new Float32Array(n);
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < n; i++) {
    const w = r() * 2 - 1;
    b0 = 0.99765 * b0 + w * 0.099046;
    b1 = 0.963 * b1 + w * 0.2965164;
    b2 = 0.57 * b2 + w * 1.0526913;
    out[i] = (b0 + b1 + b2 + w * 0.1848) * 0.2;
  }
  return out;
}

/** RBJ biquad, coefficients recomputed per sample from a frequency curve, so filters can sweep. */
function biquad(x, type, freqAt, q = 0.8) {
  const y = new Float32Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const f = Math.min(SR * 0.45, Math.max(20, freqAt(i / x.length)));
    const w0 = (2 * Math.PI * f) / SR;
    const cos = Math.cos(w0), alpha = Math.sin(w0) / (2 * q);
    let b0, b1, b2;
    if (type === "lp") { b0 = (1 - cos) / 2; b1 = 1 - cos; b2 = (1 - cos) / 2; }
    else if (type === "hp") { b0 = (1 + cos) / 2; b1 = -(1 + cos); b2 = (1 + cos) / 2; }
    else { b0 = alpha; b1 = 0; b2 = -alpha; } // band-pass, 0 dB peak
    const a0 = 1 + alpha, a1 = -2 * cos, a2 = 1 - alpha;
    const out = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = out;
    y[i] = out;
  }
  return y;
}

/** Sine with a pitch curve (Hz as a function of 0..1 progress). */
function sine(n, hzAt, phase0 = 0) {
  const out = new Float32Array(n);
  let ph = phase0;
  for (let i = 0; i < n; i++) {
    ph += (2 * Math.PI * hzAt(i / n)) / SR;
    out[i] = Math.sin(ph);
  }
  return out;
}

/** Attack/decay envelope, exponential decay, applied in place. */
function env(x, attackS, decayS, curve = 4) {
  const a = Math.max(1, attackS * SR);
  for (let i = 0; i < x.length; i++) {
    const g = i < a ? Math.sin((i / a) * (Math.PI / 2)) : Math.exp((-curve * (i - a)) / (decayS * SR));
    x[i] *= g;
  }
  return x;
}

/** A bell-shaped swell envelope peaking at `peak` (0..1 of the length). */
function swell(x, peak = 0.6, sharp = 2) {
  for (let i = 0; i < x.length; i++) {
    const t = i / x.length;
    const g = t < peak ? Math.pow(t / peak, sharp) : Math.pow(1 - (t - peak) / (1 - peak), sharp * 0.8);
    x[i] *= g;
  }
  return x;
}

const mix = (...layers) => {
  const n = Math.max(...layers.map(([l]) => l.length));
  const out = new Float32Array(n);
  for (const [l, g, offsetS = 0] of layers) {
    const o = Math.round(offsetS * SR);
    for (let i = 0; i < l.length && i + o < n; i++) out[i + o] += l[i] * g;
  }
  return out;
};

/** Small Schroeder reverb (4 combs + 2 allpasses), returns a wet/dry stereo pair. */
function reverb(x, { wet = 0.18, room = 0.82, tailS = 0.9 } = {}) {
  const n = x.length + Math.round(tailS * SR);
  const src = new Float32Array(n); src.set(x);
  const run = (spread) => {
    const combs = [1557, 1617, 1491, 1422].map((d) => ({ d: d + spread, b: new Float32Array(d + spread), i: 0, f: 0 }));
    const aps = [225, 556].map((d) => ({ d: d + spread, b: new Float32Array(d + spread), i: 0 }));
    const out = new Float32Array(n);
    for (let k = 0; k < n; k++) {
      let s = 0;
      for (const c of combs) {
        const y = c.b[c.i];
        c.f = y * 0.75 + c.f * 0.25; // damping: keeps the tail warm, no fizz
        c.b[c.i] = src[k] * 0.015 + c.f * room;
        c.i = (c.i + 1) % c.d;
        s += y;
      }
      for (const a of aps) {
        const bo = a.b[a.i];
        const y = -s + bo;
        a.b[a.i] = s + bo * 0.5;
        a.i = (a.i + 1) % a.d;
        s = y;
      }
      out[k] = src[k] * (1 - wet) + s * wet * 4;
    }
    return out;
  };
  return [run(0), run(23)];
}

/** Equal-power pan over time: panAt(t) in -1..1. Returns [L, R]. */
function pan([l, r], panAt) {
  const L = new Float32Array(l.length), R = new Float32Array(r.length);
  for (let i = 0; i < l.length; i++) {
    const p = (panAt(i / l.length) + 1) / 4 * Math.PI;
    L[i] = l[i] * Math.cos(p); R[i] = r[i] * Math.sin(p);
  }
  return [L, R];
}

function normalize([L, R], peakDb = -3) {
  let peak = 0;
  for (let i = 0; i < L.length; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const g = peak > 0 ? Math.pow(10, peakDb / 20) / peak : 1;
  // A sub-millisecond fade in (long enough to stop a click, short enough
  // to keep a transient's attack) and a cosine fade over the last quarter,
  // so a reverb tail dies away rather than stopping at the buffer's end.
  const fin = Math.round(0.0006 * SR);
  const fout = Math.round(L.length * 0.25);
  for (let i = 0; i < L.length; i++) {
    const tail = L.length - 1 - i;
    const edge = Math.min(1, i / fin) * (tail < fout ? 0.5 - 0.5 * Math.cos((Math.PI * tail) / fout) : 1);
    L[i] *= g * edge; R[i] *= g * edge;
  }
  return [L, R];
}

function wav([L, R]) {
  const n = L.length;
  const b = Buffer.alloc(44 + n * 4);
  b.write("RIFF", 0); b.writeUInt32LE(36 + n * 4, 4); b.write("WAVE", 8);
  b.write("fmt ", 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22);
  b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34);
  b.write("data", 36); b.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i])) * 32767), 44 + i * 4);
    b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i])) * 32767), 46 + i * 4);
  }
  return b;
}

// ---------- the kit ----------

const KIT = {
  /** Transition whoosh: band-passed air sweeping up then settling, moving left to right. */
  whoosh() {
    const n = buf(0.75).length;
    const air = swell(biquad(pinkNoise(n, 11), "bp", (t) => 350 + 2600 * Math.sin(Math.PI * Math.min(1, t * 1.15)), 1.1), 0.55, 2.2);
    const body = swell(biquad(pinkNoise(n, 12), "lp", (t) => 300 + 900 * t), 0.5, 2);
    return normalize(pan(reverb(mix([air, 1], [body, 0.5]), { wet: 0.12, tailS: 0.4 }), (t) => -0.6 + 1.2 * t), -4);
  },
  /** A shorter, brighter whoosh for quick cuts and wipes. */
  swish() {
    const n = buf(0.38).length;
    const air = swell(biquad(pinkNoise(n, 21), "bp", (t) => 900 + 3800 * t, 1.4), 0.65, 2.5);
    return normalize(pan(reverb(air, { wet: 0.08, tailS: 0.25 }), (t) => 0.5 - t), -5);
  },
  /** Riser into a reveal: noise opening up plus a quiet rising tone. Ends exactly at its peak, so it lands on the cut. */
  riser() {
    const n = buf(1.4).length;
    const noise = biquad(pinkNoise(n, 31), "hp", (t) => 200 + 5000 * t * t, 0.7);
    const tone = mix([sine(n, (t) => 180 + 520 * t * t), 0.6], [sine(n, (t) => 270 + 780 * t * t), 0.3]);
    const out = biquad(mix([noise, 0.7], [tone, 0.3]), "lp", (t) => 2500 + 5500 * t, 0.7);
    const rel = Math.round(0.015 * SR); // a 15 ms release at the peak: lands on the cut without a click
    for (let i = 0; i < n; i++) out[i] *= Math.pow(i / n, 2.4) * Math.min(1, (n - 1 - i) / rel);
    return normalize(reverb(out, { wet: 0.15, tailS: 0.2 }), -5);
  },
  /** Soft impact for the product reveal: a round sub drop with a felt transient, not a cinematic boom. */
  impact() {
    const n = buf(1.6).length;
    const sub = env(sine(n, (t) => 48 + 50 * Math.exp(-t * 18)), 0.004, 0.9, 5);
    const thump = env(biquad(pinkNoise(n, 41), "lp", () => 420), 0.002, 0.12, 6);
    const air = env(biquad(pinkNoise(n, 42), "bp", () => 2400, 0.6), 0.003, 0.25, 6);
    return normalize(reverb(mix([sub, 1], [thump, 0.7], [air, 0.12]), { wet: 0.22, tailS: 1.8 }), -2.5);
  },
  /** Card appearing: a soft rounded pop. */
  pop() {
    const n = buf(0.32).length;
    const body = env(sine(n, (t) => 620 * Math.exp(-t * 4) + 260), 0.002, 0.09, 5);
    const click = env(biquad(pinkNoise(n, 51), "bp", () => 3200, 1), 0.0005, 0.012, 6);
    return normalize(reverb(mix([body, 1], [click, 0.25]), { wet: 0.05, room: 0.55, tailS: 0.2 }), -6);
  },
  /** A UI tap: what a finger on glass sounds like in a product film. */
  tap() {
    const n = buf(0.2).length;
    const body = env(sine(n, () => 1350), 0.0008, 0.035, 6);
    const click = env(biquad(pinkNoise(n, 61), "hp", () => 2600), 0.0003, 0.008, 6);
    return normalize(reverb(mix([body, 0.7], [click, 0.6]), { wet: 0.04, room: 0.5, tailS: 0.12 }), -8);
  },
  /** A barely-there tick for words or list items landing. Meant to be used quietly and sparingly. */
  tick() {
    const n = buf(0.09).length;
    const t = env(biquad(pinkNoise(n, 71), "bp", () => 4200, 2.2), 0.0004, 0.01, 6);
    return normalize([t, t.slice()], -12);
  },
  /** Wordmark shimmer: a warm bell chord (C major add 9), softly struck, long gentle tail. */
  shimmer() {
    const n = buf(2.2).length;
    const partials = [523.25, 659.25, 783.99, 1174.66, 1567.98].flatMap((f, k) => [
      [env(sine(n, () => f), 0.01 + k * 0.004, 1.6 - k * 0.15, 3.5), 1 / (k + 1.4), k * 0.035],
      [env(sine(n, () => f * 2.76), 0.004, 0.35, 5), 0.06 / (k + 1), k * 0.035],
    ]);
    return normalize(reverb(mix(...partials), { wet: 0.3, room: 0.86, tailS: 2.4 }), -6);
  },
  /** Page turn: paper. Two quick, filtered rustles and a soft landing, moving across the stereo field. */
  page() {
    const n = buf(0.55).length;
    const flutter = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const t = i / n;
      flutter[i] = Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.6)), 2) * (0.6 + 0.4 * Math.sin(t * 90));
    }
    const paper = biquad(pinkNoise(n, 81), "bp", (t) => 1800 + 2600 * t, 0.9).map((v, i) => v * flutter[i]);
    const land = env(biquad(pinkNoise(n, 82), "lp", () => 700), 0.003, 0.08, 6);
    return normalize(pan(reverb(mix([paper, 1], [land, 0.5, 0.36]), { wet: 0.1, room: 0.6, tailS: 0.25 }), (t) => -0.5 + t), -7);
  },
  /** Settle: a low, warm two-note confirmation for "done" moments and the end card. */
  settle() {
    const n = buf(1.2).length;
    const a = env(sine(n, () => 392), 0.006, 0.7, 4);
    const b = env(sine(n, () => 587.33), 0.006, 0.8, 4);
    const sub = env(sine(n, () => 98), 0.01, 0.5, 4);
    return normalize(reverb(mix([a, 0.7], [b, 0.6, 0.09], [sub, 0.4]), { wet: 0.25, tailS: 1.8 }), -6);
  },
};

await mkdir(OUT, { recursive: true });
for (const [name, make] of Object.entries(KIT)) {
  const file = path.join(OUT, `${name}.wav`);
  await writeFile(file, wav(make()));
  console.log(`wrote ${path.relative(process.cwd(), file)}`);
}
