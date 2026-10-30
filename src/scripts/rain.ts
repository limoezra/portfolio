// Canvas renderers for the three maps: hero (animated), downscaling (stages), vulnerability (layers).
import { rainField, blockAverage, makeRamp, rng, RAIN, HAZARD, W, H } from './field';

const N = W * H;
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.trim().slice(i, i + 2), 16) || 0);
const cssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const easeOut = (t: number) => 1 - (1 - t) ** 3;

let land: Path2D | null = null;
/** All country outlines as one Path2D (data embedded by the page in #horn). */
export function getLand() {
  if (land) return land;
  land = new Path2D();
  const ds: string[] = JSON.parse(document.getElementById('horn')?.textContent || '[]');
  for (const d of ds) land.addPath(new Path2D(d));
  return land;
}

/** A W×H canvas we write pixels into, then scale up crisply. */
function makeBuffer() {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;
  return { c, ctx, img: ctx.createImageData(W, H) };
}

function paint(buf: ReturnType<typeof makeBuffer>, f: Float32Array, lut: Uint8ClampedArray) {
  const d = buf.img.data;
  for (let i = 0; i < N; i++) {
    const j = Math.round(Math.min(1, f[i]) * 255) * 4;
    d[i * 4] = lut[j];
    d[i * 4 + 1] = lut[j + 1];
    d[i * 4 + 2] = lut[j + 2];
    d[i * 4 + 3] = lut[j + 3];
  }
  buf.ctx.putImageData(buf.img, 0, 0);
  return buf.c;
}

/** Sizes a visible canvas to its CSS box and draws a buffer clipped to the land outline. */
function view(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  const shape = getLand();
  let s = 1;
  let dpr = 1;
  let colors = { land: '', border: '', fg: [0, 0, 0] };
  let last: HTMLCanvasElement | null = null;

  const readColors = () => {
    colors = { land: cssVar('--land'), border: cssVar('--border-map'), fg: hex(cssVar('--fg')) };
  };
  const draw = (buf: HTMLCanvasElement) => {
    last = buf;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(s, 0, 0, s, 0, 0);
    ctx.fillStyle = colors.land;
    ctx.fill(shape);
    ctx.save();
    ctx.clip(shape);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(buf, 0, 0);
    ctx.restore();
    ctx.lineWidth = (0.9 * dpr) / s;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = colors.border;
    ctx.stroke(shape);
  };
  const fit = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    const w = Math.round(canvas.clientWidth * dpr);
    if (!w || (w === canvas.width && s === w / W)) return;
    canvas.width = w;
    canvas.height = Math.round((w * H) / W);
    s = w / W;
    if (last) draw(last);
  };

  readColors();
  fit();
  new ResizeObserver(fit).observe(canvas);
  addEventListener('themechange', () => {
    readColors();
    if (last) draw(last);
  });
  return {
    draw,
    get fg() {
      return colors.fg;
    },
  };
}

const SEEDS = [7, 19, 31, 53, 89];

/** Hero: static settles into rain, the rain drifts east, the pointer adds rain. */
export function mountHero(canvas: HTMLCanvasElement, opts: { reduced: boolean }) {
  const v = view(canvas);
  const buf = makeBuffer();
  const lut = makeRamp(RAIN);
  const start = new Float32Array(N);
  const delay = new Float32Array(N);
  const boost = new Float32Array(N);
  let n = 0;
  let field = rainField(SEEDS[0]);
  let t0 = performance.now();
  let raf = 0;
  let visible = true;
  let lastDraw = 0;

  const seedNoise = () => {
    const r = rng(SEEDS[n] * 13 + 1);
    for (let i = 0; i < N; i++) {
      start[i] = r();
      // Settles roughly north to south, like a band of rain moving in.
      delay[i] = 0.15 + 0.7 * (Math.floor(i / W) / H) + 0.45 * r();
    }
  };

  const frame = (now: number) => {
    raf = 0;
    const t = (now - t0) / 1000;
    const intro = t < 2.2;
    // After the intro, 30 fps is plenty for slow drift.
    if (intro || now - lastDraw > 33) {
      lastDraw = now;
      const shift = Math.floor(Math.max(0, t - 2) * 2.5);
      const d = buf.img.data;
      const [fr, fg, fb] = v.fg;
      for (let y = 0, i = 0; y < H; y++) {
        const row = y * W;
        for (let x = 0; x < W; x++, i++) {
          const val = Math.min(1, field[row + ((((x - shift) % W) + W) % W)] + boost[i]);
          boost[i] *= 0.975;
          const j = Math.round(val * 255) * 4;
          const p = (t - delay[i]) / 0.7;
          const o = i * 4;
          if (p >= 1) {
            d[o] = lut[j];
            d[o + 1] = lut[j + 1];
            d[o + 2] = lut[j + 2];
            d[o + 3] = lut[j + 3];
          } else {
            const e = p <= 0 ? 0 : easeOut(p);
            const a = start[i] * 150;
            d[o] = fr + (lut[j] - fr) * e;
            d[o + 1] = fg + (lut[j + 1] - fg) * e;
            d[o + 2] = fb + (lut[j + 2] - fb) * e;
            d[o + 3] = a + (lut[j + 3] - a) * e;
          }
        }
      }
      buf.ctx.putImageData(buf.img, 0, 0);
      v.draw(buf.c);
    }
    if (!opts.reduced && visible && !document.hidden) raf = requestAnimationFrame(frame);
  };
  const play = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };

  seedNoise();
  if (opts.reduced) {
    t0 = -1e9; // everything already settled
    frame(performance.now());
  } else {
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) play();
    }).observe(canvas);
    document.addEventListener('visibilitychange', play);
    addEventListener('themechange', play);
    canvas.addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      const gx = Math.round(((e.clientX - r.left) / r.width) * W);
      const gy = Math.round(((e.clientY - r.top) / r.height) * H);
      const R = 10;
      for (let dy = -R; dy <= R; dy++) {
        const y = gy + dy;
        if (y < 0 || y >= H) continue;
        for (let dx = -R; dx <= R; dx++) {
          const x = gx + dx;
          if (x < 0 || x >= W) continue;
          const i = y * W + x;
          boost[i] = Math.min(1.2, boost[i] + 0.09 * Math.exp(-(dx * dx + dy * dy) / 32));
        }
      }
      play();
    });
    play();
  }

  return {
    /** Next ensemble member (1–5). */
    resample() {
      n = (n + 1) % SEEDS.length;
      field = rainField(SEEDS[n]);
      seedNoise();
      boost.fill(0);
      t0 = opts.reduced ? -1e9 : performance.now();
      if (opts.reduced) frame(performance.now());
      else play();
      return n + 1;
    },
  };
}

/** Downscaling: the same field block-averaged at each stage's block size. */
export function mountDownscale(canvas: HTMLCanvasElement, ks: number[], seed = 31) {
  const v = view(canvas);
  const field = rainField(seed);
  const lut = makeRamp(RAIN);
  const bufs = ks.map((k) => paint(makeBuffer(), blockAverage(field, W, H, k), lut));
  let cur = -1;
  const setStage = (i: number) => {
    if (i === cur) return;
    cur = i;
    v.draw(bufs[i]);
  };
  setStage(0);
  return { setStage };
}

const normalize = (f: Float32Array) => {
  let lo = Infinity;
  let hi = -Infinity;
  for (const x of f) {
    if (x < lo) lo = x;
    if (x > hi) hi = x;
  }
  return f.map((x) => (x - lo) / (hi - lo || 1));
};

/** Vulnerability: Exposure, Susceptibility, Resilience, and the combined index. Illustrative data. */
export function mountLayers(canvases: HTMLCanvasElement[]) {
  const E = normalize(rainField(101, W, H, true));
  const S = normalize(rainField(202, W, H, true));
  const R = normalize(rainField(303, W, H, true));
  const V = normalize(E.map((e, i) => e + S[i] - R[i]));
  const hazard = makeRamp(HAZARD);
  const cope = makeRamp(['#d9f7ef', '#7fdcc0', '#2fae8c', '#1b7a64']);
  // Keep every land cell visibly coloured (index 0 is transparent).
  const lift = (f: Float32Array) => f.map((x) => 0.04 + x * 0.96);
  [E, S, R, V].forEach((f, i) => {
    if (!canvases[i]) return;
    view(canvases[i]).draw(paint(makeBuffer(), lift(f), i === 2 ? cope : hazard));
  });
}
