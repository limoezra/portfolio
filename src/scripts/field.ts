// Pure maths for the rain maps: seeded noise fields, block averaging, colour ramps.
// Grid = the SEWAA cGAN domain: 352 × 384 cells at 0.1°, row 0 = north.

export const W = 352;
export const H = 384;

export const RAIN = ['#bdf3ff', '#3fd0f0', '#2a7de1', '#5b4fe0', '#8b5cf6', '#e879f9'];
export const HAZARD = ['#fff3b0', '#ffd23f', '#ff9f1c', '#f25c2a', '#c81d25'];

/** mulberry32: small, fast, seeded. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(x: number, y: number, s: number) {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(s, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const smooth = (t: number) => t * t * (3 - 2 * t);

/** Value noise on a lattice that wraps every `px` cells in x. */
function noise(x: number, y: number, px: number, s: number) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = smooth(x - x0);
  const fy = smooth(y - y0);
  const xa = ((x0 % px) + px) % px;
  const xb = (xa + 1) % px;
  const a = hash(xa, y0, s);
  const b = hash(xb, y0, s);
  const c = hash(xa, y0 + 1, s);
  const d = hash(xb, y0 + 1, s);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}

/**
 * A rain-like field in [0,1]: mostly dry, a few heavy cells, wrapping in x.
 * `raw` returns the smooth noise before the dry threshold (used by tests).
 */
export function rainField(seed: number, w = W, h = H, raw = false) {
  const out = new Float32Array(w * h);
  const base = 5; // lattice cells across the width at the coarsest octave
  const cell = w / base;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = 0;
      let amp = 0.55;
      let f = 1;
      for (let o = 0; o < 5; o++, amp *= 0.5, f *= 2) {
        v += amp * noise((x / cell) * f, (y / cell) * f, base * f, seed + o * 101);
      }
      out[y * w + x] = raw ? v : Math.min(1, Math.max(0, (v - 0.5) / 0.35) ** 1.4);
    }
  }
  return out;
}

/** Replace each k×k block with its mean (edge blocks may be smaller). */
export function blockAverage(src: Float32Array, w: number, h: number, k: number) {
  if (k <= 1) return Float32Array.from(src);
  const out = new Float32Array(w * h);
  for (let by = 0; by < h; by += k) {
    for (let bx = 0; bx < w; bx += k) {
      const ye = Math.min(by + k, h);
      const xe = Math.min(bx + k, w);
      let s = 0;
      for (let y = by; y < ye; y++) for (let x = bx; x < xe; x++) s += src[y * w + x];
      const m = s / ((ye - by) * (xe - bx));
      for (let y = by; y < ye; y++) out.fill(m, y * w + bx, y * w + xe);
    }
  }
  return out;
}

/** 256-entry RGBA lookup. Index 0 (dry) is transparent; light rain is see-through. */
export function makeRamp(stops: string[]) {
  const rgb = stops.map((c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)));
  const lut = new Uint8ClampedArray(256 * 4);
  for (let i = 1; i < 256; i++) {
    const t = ((i - 1) / 254) * (rgb.length - 1);
    const j = Math.min(rgb.length - 2, Math.floor(t));
    const f = t - j;
    for (let c = 0; c < 3; c++) lut[i * 4 + c] = rgb[j][c] + (rgb[j + 1][c] - rgb[j][c]) * f;
    lut[i * 4 + 3] = Math.min(255, 90 + i * 1.4);
  }
  return lut;
}
