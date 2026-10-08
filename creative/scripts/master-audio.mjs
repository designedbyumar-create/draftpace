/**
 * Masters a rendered video's soundtrack to social-platform loudness.
 *
 * Remotion mixes the bed and the effects at the levels the composition
 * asks for, which keeps their balance right but leaves the whole mix far
 * quieter than Reels/TikTok/Shorts play everything else at, and simply
 * turning the composition up would clip the loud moments. So, after the
 * render:
 *
 *  1. decode the soundtrack to PCM;
 *  2. measure its loudness (RMS of the non-silent part, a close stand-in
 *     for integrated loudness on this kind of material) and gain it to
 *     TARGET_DB;
 *  3. run a look-ahead peak limiter so nothing passes CEILING_DB: gain
 *     reduction starts LOOKAHEAD before a peak arrives and releases
 *     smoothly, so it is inaudible rather than a clamp;
 *  4. remux, copying the video stream untouched.
 *
 * Uses the ffmpeg that ships with @remotion/compositor (no system ffmpeg).
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, renameSync, rmSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const TARGET_DB = -15;
const CEILING_DB = -1;
const SR = 48000;
const LOOKAHEAD = Math.round(0.005 * SR);
const RELEASE = 1 - Math.exp(-1 / (0.08 * SR)); // ~80 ms

function ffmpeg() {
  const require = createRequire(import.meta.url);
  const dir = path.dirname(require.resolve("@remotion/compositor-linux-x64-gnu/package.json"));
  return { bin: path.join(dir, "ffmpeg"), env: { ...process.env, LD_LIBRARY_PATH: dir } };
}

function readPcm(file) {
  const b = readFileSync(file);
  let o = 12;
  while (b.toString("ascii", o, o + 4) !== "data") o += 8 + b.readUInt32LE(o + 4);
  const start = o + 8;
  const n = Math.floor((b.length - start) / 4);
  const L = new Float32Array(n), R = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    L[i] = b.readInt16LE(start + i * 4) / 32768;
    R[i] = b.readInt16LE(start + i * 4 + 2) / 32768;
  }
  return { L, R };
}

function writePcm(file, L, R) {
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
  writeFileSync(file, b);
}

/** RMS in dB over 100 ms blocks louder than -50 dB (a simple gate, so silence doesn't drag the measure down). */
export function loudnessDb(L, R) {
  const block = Math.round(0.1 * SR);
  let sum = 0, count = 0;
  for (let s = 0; s + block <= L.length; s += block) {
    let e = 0;
    for (let i = s; i < s + block; i++) e += (L[i] * L[i] + R[i] * R[i]) / 2;
    const ms = e / block;
    if (10 * Math.log10(ms + 1e-12) > -50) { sum += ms; count++; }
  }
  return count ? 10 * Math.log10(sum / count) : -Infinity;
}

export function master(L, R) {
  const before = loudnessDb(L, R);
  const gain = Math.pow(10, (TARGET_DB - before) / 20);
  const ceiling = Math.pow(10, CEILING_DB / 20);
  const n = L.length;
  // Gain each sample needs so it stays under the ceiling...
  const need = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const p = Math.max(Math.abs(L[i]), Math.abs(R[i])) * gain;
    need[i] = p > ceiling ? ceiling / p : 1;
  }
  // ...taken as a minimum over the look-ahead window, so reduction is
  // already in place when the peak arrives, then released smoothly.
  let g = 1;
  const outL = new Float32Array(n), outR = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let m = 1;
    for (let j = i; j < Math.min(n, i + LOOKAHEAD); j++) if (need[j] < m) m = need[j];
    g = m < g ? m : g + (m - g) * RELEASE;
    outL[i] = L[i] * gain * g;
    outR[i] = R[i] * gain * g;
  }
  return { L: outL, R: outR, before, after: loudnessDb(outL, outR) };
}

/** Masters `video` in place. Returns the loudness before and after, in dB. */
export function masterVideo(video) {
  const { bin, env } = ffmpeg();
  const raw = `${video}.raw.wav`, mastered = `${video}.master.wav`, out = `${video}.mastered.mp4`;
  try {
    execFileSync(bin, ["-y", "-loglevel", "error", "-i", video, "-vn", "-ac", "2", "-ar", String(SR), "-c:a", "pcm_s16le", raw], { env });
    const { L, R } = readPcm(raw);
    const m = master(L, R);
    writePcm(mastered, m.L, m.R);
    execFileSync(bin, ["-y", "-loglevel", "error", "-i", video, "-i", mastered, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", out], { env });
    renameSync(out, video);
    return { before: m.before, after: m.after };
  } finally {
    for (const f of [raw, mastered, out]) rmSync(f, { force: true });
  }
}
