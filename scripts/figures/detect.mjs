// Finds the "card" in a flattened pin PNG: the tallest band of rows in which
// most of the width differs from the gradient background at the row's edges.
// Prints JSON {left,top,width,height} in source pixels, or null.
import sharp from "sharp";

const F = 4;
export async function detectCard(file) {
  // White cards on near-white gradients need a lower threshold than dark ones.
  for (const threshold of [14, 9, 6]) {
    const r = await detectAt(file, threshold);
    if (r) return r;
  }
  return null;
}

async function detectAt(file, T) {
  const meta = await sharp(file).metadata();
  const { data, info } = await sharp(file).resize(Math.round(meta.width / F)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const px = (x, y, c) => data[(y * W + x) * 3 + c];
  const dev = (x, y, ref) => Math.max(Math.abs(px(x, y, 0) - ref[0]), Math.abs(px(x, y, 1) - ref[1]), Math.abs(px(x, y, 2) - ref[2]));
  const x0 = Math.round(W * 0.09), x1 = Math.round(W * 0.91);
  const rowOn = [];
  const refs = [];
  for (let y = 0; y < H; y++) {
    const ref = [0, 1, 2].map((c) => (px(1, y, c) + px(W - 2, y, c)) / 2);
    refs.push(ref);
    let n = 0;
    for (let x = x0; x < x1; x++) if (dev(x, y, ref) > T) n++;
    rowOn.push(n / (x1 - x0) > 0.7);
  }
  let best = null, s = -1;
  for (let y = 0; y <= H; y++) {
    if (y < H && rowOn[y]) { if (s < 0) s = y; }
    else if (s >= 0) { if (!best || y - s > best[1] - best[0]) best = [s, y]; s = -1; }
  }
  if (!best || best[1] - best[0] < H * 0.1) return null;
  const [t, b] = best;
  let l = W, r = 0;
  for (let x = 0; x < W; x++) {
    let n = 0;
    for (let y = t; y < b; y++) if (dev(x, y, refs[y]) > T) n++;
    if (n / (b - t) > 0.7) { l = Math.min(l, x); r = Math.max(r, x); }
  }
  if (r <= l) return null;
  const pad = 2;
  return { left: Math.max(0, (l - pad) * F), top: Math.max(0, (t - pad) * F), width: Math.min(meta.width, (r - l + 1 + 2 * pad) * F), height: Math.min(meta.height, (b - t + 2 * pad) * F) };
}
