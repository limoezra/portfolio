# Portfolio + Profile README Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Ezra's animated "Noise → Forecast" portfolio to `limoezra.github.io/portfolio/` and an animated profile README, both through PRs reviewed by bravomesh.

**Architecture:** Static Astro site. All copy in `src/data/site.ts`. A pure, tested module (`field.ts`) generates seeded rain fields, block-averages them and maps values to colours; a canvas module (`rain.ts`) animates them inside a Horn of Africa outline computed at build time (`horn.ts`, d3-geo + world-atlas, nothing heavy shipped to the browser). GSAP + Lenis handle scroll motion.

**Tech Stack:** Astro 7.4, GSAP 3.15 (ScrollTrigger, ScrambleTextPlugin), Lenis 1.3, d3-geo 3.1, topojson-client 3.1, world-atlas 2.0 (50m), Fontsource (Bricolage Grotesque Variable, IBM Plex Sans, IBM Plex Mono), Node 26 `node --test` (native TS).

**Spec:** `docs/superpowers/specs/2026-10-30-portfolio-design.md`

## Global Constraints

- `astro.config.mjs`: `site: 'https://limoezra.github.io'`, `base: '/portfolio'`. Internal links use `import.meta.env.BASE_URL`.
- Rain-field grid = the cGAN domain: `W = 352` columns, `H = 384` rows, `0.1°` cells, lon `19.15 → 54.25`, lat `24.65 → -13.65` (row 0 = north).
- ICPAC countries: ISO numeric `108, 231, 232, 262, 404, 646, 706, 728, 729, 800, 834` plus the feature named `Somaliland` (no id in world-atlas).
- Colours: rain ramp cyan `#3fd0f0` → blue → violet `#8b5cf6`; hazard ramp yellow → orange → red only in the vulnerability section.
- Fonts: Bricolage Grotesque Variable (display), IBM Plex Sans (body), IBM Plex Mono (labels).
- Not on the site: phone number, references, CV PDF.
- `prefers-reduced-motion: reduce` → no Lenis, no pin, no scramble, no canvas animation; final states shown.
- `localStorage` access wrapped in try/catch.
- Commits: author `Ezra Kiplimo Kipruto <ezralimo548@gmail.com>` (repo-local config, already set), message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- `main` is protected: work on `feat/site` (portfolio) and `feat/readme` (limoezra); open PRs; bravomesh approves.

---

## File structure

```
portfolio/
  astro.config.mjs, package.json, tsconfig.json
  .github/workflows/deploy.yml
  public/favicon.svg                 EK monogram on a rain pixel
  src/
    data/site.ts                     all copy and facts
    data/horn.ts                     build-time outline paths (grid coords)
    layouts/Base.astro               head, fonts, theme bootstrap, grid texture
    pages/index.astro                composes sections, passes outline data
    components/Nav.astro Hero.astro About.astro Downscale.astro
               Vulnerability.astro Work.astro Publications.astro
               Experience.astro Toolbox.astro Contact.astro Footer.astro
    scripts/field.ts                 pure maths (tested)
    scripts/rain.ts                  canvas renderers
    scripts/motion.ts                Lenis, scramble, reveals, counters, stack, drops
    styles/global.css                tokens for both themes, base, utilities
    assets/ezra.jpg                  from ~/Downloads/ezyy/passport 2.jpg
    assets/somalia-exposure.png      cropped + resized from old site
  test/field.test.ts, test/horn.test.ts
limoezra/
  README.md
  assets/banner.svg                  generated, animated pixel rain → name
  scripts/banner.mjs                 generator for banner.svg
```

---

### Task 1: Scaffold, theme tokens, deploy pipeline

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.github/workflows/deploy.yml`, `src/layouts/Base.astro`, `src/styles/global.css`, `src/pages/index.astro`, `public/favicon.svg`

**Interfaces:**
- Produces: CSS custom properties used by every later task: `--bg --bg-2 --fg --muted --line --accent --accent-2 --land --border-map --f-display --f-body --f-mono --gutter --radius`. `html[data-theme]` is `dark` | `light`. A `themechange` CustomEvent is dispatched on `window` when the toggle flips (detail: `'dark' | 'light'`).

- [ ] **Step 1:** `npm init -y`, then `npm i astro@7.4.4 gsap@3.15.0 lenis@1.3.27 d3-geo@3.1.1 topojson-client@3.1.0 world-atlas@2.0.2 @fontsource-variable/bricolage-grotesque @fontsource/ibm-plex-sans @fontsource/ibm-plex-mono sharp` and `npm i -D @types/d3-geo @types/topojson-client`. Set `"type": "module"` and scripts:

```json
{ "dev": "astro dev", "build": "astro build", "preview": "astro preview", "test": "node --test test/" }
```

- [ ] **Step 2:** Config files.

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
export default defineConfig({ site: 'https://limoezra.github.io', base: '/portfolio' });
```

```json
// tsconfig.json
{ "extends": "astro/tsconfigs/strict", "include": [".astro/types.d.ts", "**/*"], "exclude": ["dist"] }
```

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push: { branches: [main] }
  workflow_dispatch:
permissions: { contents: read, pages: write, id-token: write }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: withastro/action@v6
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: '${{ steps.deployment.outputs.page_url }}' }
    steps:
      - id: deployment
        uses: actions/deploy-pages@v5
```

- [ ] **Step 3:** `global.css` with tokens. Dark (default):

```css
:root{--f-display:'Bricolage Grotesque Variable',system-ui,sans-serif;--f-body:'IBM Plex Sans',system-ui,sans-serif;--f-mono:'IBM Plex Mono',ui-monospace,monospace;
--gutter:clamp(16px,4vw,56px);--radius:14px;color-scheme:dark;
--bg:#090c1c;--bg-2:#0f1428;--fg:#e8ecf6;--muted:#97a0b8;--line:rgba(232,236,246,.1);
--accent:#3fd0f0;--accent-2:#8b5cf6;--land:#161c36;--border-map:rgba(232,236,246,.22)}
:root[data-theme=light]{color-scheme:light;--bg:#f2f5fa;--bg-2:#e6ebf3;--fg:#0e1326;--muted:#4e5874;--line:rgba(14,19,38,.12);
--accent:#0b7fa6;--accent-2:#6d3fd6;--land:#d8deea;--border-map:rgba(14,19,38,.25)}
```

Body background draws the 0.1° grid texture with two `repeating-linear-gradient`s at `var(--line)` opacity ~0.35.

- [ ] **Step 4:** `Base.astro`: imports fonts + `global.css`; inline head script sets `data-theme` from `localStorage.theme` (try/catch) else `prefers-color-scheme`; `<title>Ezra Kiplimo · ML Scientist, GIS & Statistics</title>`, description, OG tags, `favicon.svg`. Slot for page.

- [ ] **Step 5:** `index.astro` renders `<Base><main><h1>Ezra Kiplimo</h1></main></Base>`. Run `npm run build`. Expected: `dist/index.html` exists, exit 0.

- [ ] **Step 6:** Commit `chore: scaffold Astro site, theme tokens and Pages workflow`.

---

### Task 2: Rain-field maths (`field.ts`, TDD)

**Files:**
- Create: `src/scripts/field.ts`, `test/field.test.ts`

**Interfaces:**
- Produces:
  - `export const W = 352, H = 384;`
  - `export function rng(seed: number): () => number` (mulberry32, values in [0,1))
  - `export function rainField(seed: number, w = W, h = H): Float32Array` (values in [0,1], periodic in x so it can drift with modular indexing, many exact zeros = dry)
  - `export function blockAverage(src: Float32Array, w: number, h: number, k: number): Float32Array`
  - `export function makeRamp(stops: string[]): Uint8ClampedArray` (256 RGBA entries; index 0 alpha = 0)
  - `export const RAIN: string[]`, `export const HAZARD: string[]`

- [ ] **Step 1: Write the failing tests**

```ts
// test/field.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rng, rainField, blockAverage, makeRamp, RAIN, W, H } from '../src/scripts/field.ts';

test('rng is deterministic and in [0,1)', () => {
  const a = rng(7), b = rng(7);
  for (let i = 0; i < 100; i++) { const x = a(); assert.equal(x, b()); assert.ok(x >= 0 && x < 1); }
});

test('rainField: size, range, dry and wet cells, deterministic', () => {
  const f = rainField(42);
  assert.equal(f.length, W * H);
  let dry = 0, wet = 0;
  for (const v of f) { assert.ok(v >= 0 && v <= 1); if (v === 0) dry++; if (v > 0.5) wet++; }
  assert.ok(dry > f.length * 0.2, 'mostly dry like real rain');
  assert.ok(wet > 0, 'some heavy rain');
  assert.deepEqual(rainField(42).slice(0, 50), f.slice(0, 50));
  assert.notDeepEqual(rainField(43).slice(0, 2000), f.slice(0, 2000));
});

test('rainField is periodic in x (seamless drift)', () => {
  const f = rainField(5, 64, 8);
  for (let y = 0; y < 8; y++) assert.ok(Math.abs(f[y * 64] - f[y * 64 + 63]) < 0.2);
});

test('blockAverage replaces each k×k block with its mean', () => {
  const src = Float32Array.from([1, 3, 0, 0,  5, 7, 0, 4,  2, 2, 1, 1,  2, 2, 1, 1]);
  const out = blockAverage(src, 4, 4, 2);
  assert.deepEqual([...out], [4, 4, 1, 1,  4, 4, 1, 1,  2, 2, 1, 1,  2, 2, 1, 1]);
  assert.deepEqual([...blockAverage(src, 4, 4, 1)], [...src]);
});

test('blockAverage handles ragged edges', () => {
  const out = blockAverage(Float32Array.from([2, 4, 6]), 3, 1, 2);
  assert.deepEqual([...out], [3, 3, 6]);
});

test('makeRamp: 256 RGBA entries, dry is transparent, ends on last stop', () => {
  const r = makeRamp(RAIN);
  assert.equal(r.length, 256 * 4);
  assert.equal(r[3], 0);
  const last = RAIN[RAIN.length - 1];
  assert.deepEqual([...r.slice(255 * 4, 255 * 4 + 3)], [1, 3, 5].map((i) => parseInt(last.slice(i, i + 2), 16)));
});
```

- [ ] **Step 2:** `npm test`. Expected: FAIL (module not found).

- [ ] **Step 3: Implement**

```ts
// src/scripts/field.ts
export const W = 352, H = 384;
export const RAIN = ['#bdf3ff', '#3fd0f0', '#2a7de1', '#5b4fe0', '#8b5cf6', '#e879f9'];
export const HAZARD = ['#fff3b0', '#ffd23f', '#ff9f1c', '#f25c2a', '#c81d25'];

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hash = (x: number, y: number, s: number) => {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(s, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
const smooth = (t: number) => t * t * (3 - 2 * t);

/** Value noise on a lattice that wraps every `px` cells in x. */
function noise(x: number, y: number, px: number, s: number) {
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const fx = smooth(x - x0), fy = smooth(y - y0);
  const xa = ((x0 % px) + px) % px, xb = (xa + 1) % px;
  const a = hash(xa, y0, s), b = hash(xb, y0, s), c = hash(xa, y0 + 1, s), d = hash(xb, y0 + 1, s);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}

export function rainField(seed: number, w = W, h = H) {
  const out = new Float32Array(w * h);
  const base = 5; // lattice cells across the width at octave 0
  const cell = w / base;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let v = 0, amp = 0.55, f = 1;
      for (let o = 0; o < 5; o++, amp *= 0.5, f *= 2) v += amp * noise((x / cell) * f, (y / cell) * f, base * f, seed + o * 101);
      // Rain is skewed: most cells dry, a few very wet.
      const r = Math.max(0, (v - 0.5) / 0.35);
      out[y * w + x] = Math.min(1, r ** 1.4);
    }
  return out;
}

export function blockAverage(src: Float32Array, w: number, h: number, k: number) {
  if (k <= 1) return Float32Array.from(src);
  const out = new Float32Array(w * h);
  for (let by = 0; by < h; by += k)
    for (let bx = 0; bx < w; bx += k) {
      const ye = Math.min(by + k, h), xe = Math.min(bx + k, w);
      let s = 0;
      for (let y = by; y < ye; y++) for (let x = bx; x < xe; x++) s += src[y * w + x];
      const m = s / ((ye - by) * (xe - bx));
      for (let y = by; y < ye; y++) out.fill(m, y * w + bx, y * w + xe);
    }
  return out;
}

export function makeRamp(stops: string[]) {
  const rgb = stops.map((c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)));
  const lut = new Uint8ClampedArray(256 * 4);
  for (let i = 1; i < 256; i++) {
    const t = ((i - 1) / 254) * (rgb.length - 1);
    const j = Math.min(rgb.length - 2, Math.floor(t)), f = t - j;
    for (let c = 0; c < 3; c++) lut[i * 4 + c] = rgb[j][c] + (rgb[j + 1][c] - rgb[j][c]) * f;
    lut[i * 4 + 3] = Math.min(255, 90 + i * 1.4); // light rain is see-through
  }
  return lut;
}
```

- [ ] **Step 4:** `npm test`. Expected: all 6 PASS. If the dry/wet thresholds fail, tune the `0.5 / 0.35` constants in `rainField`, not the test.

- [ ] **Step 5:** Commit `feat: seeded rain field, block averaging and colour ramps`.

---

### Task 3: Horn of Africa outline (`horn.ts`)

**Files:**
- Create: `src/data/horn.ts`, `test/horn.test.ts`

**Interfaces:**
- Consumes: `W`, `H` from `src/scripts/field.ts`.
- Produces: `export function hornPaths(): { name: string; d: string }[]` — SVG path strings in grid coordinates (x 0..352, y 0..384), one per country, Somaliland merged under Somalia's name.

- [ ] **Step 1: Failing test**

```ts
// test/horn.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hornPaths } from '../src/data/horn.ts';

test('hornPaths returns the ICPAC countries inside the grid', () => {
  const p = hornPaths();
  const names = new Set(p.map((c) => c.name));
  for (const n of ['Kenya', 'Ethiopia', 'Somalia', 'S. Sudan', 'Tanzania', 'Djibouti']) assert.ok(names.has(n), n);
  const kenya = p.find((c) => c.name === 'Kenya')!.d;
  const nums = kenya.match(/-?\d+(\.\d+)?/g)!.map(Number);
  const xs = nums.filter((_, i) => i % 2 === 0), ys = nums.filter((_, i) => i % 2 === 1);
  // Kenya: lon ~34–42 → x ~148–229; lat ~5 to −5 → y ~197–297
  assert.ok(Math.min(...xs) > 140 && Math.max(...xs) < 235);
  assert.ok(Math.min(...ys) > 190 && Math.max(...ys) < 305);
});
```

- [ ] **Step 2:** `npm test`. Expected: FAIL (module not found).

- [ ] **Step 3: Implement**

```ts
// src/data/horn.ts
import { geoEquirectangular, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import world from 'world-atlas/countries-50m.json' with { type: 'json' };

const IDS = new Set(['108', '231', '232', '262', '404', '646', '706', '728', '729', '800', '834']);
const LON0 = 19.15, LAT1 = 24.65; // grid origin (north-west corner), 0.1° cells

export function hornPaths() {
  const all = (feature(world as any, (world as any).objects.countries) as any).features as any[];
  const picked = all.filter((f) => IDS.has(f.id) || f.properties.name === 'Somaliland');
  const proj = geoEquirectangular().scale(1800 / Math.PI).translate([-LON0 * 10, LAT1 * 10]);
  const path = geoPath(proj).digits(1);
  return picked.map((f) => ({ name: f.properties.name === 'Somaliland' ? 'Somalia' : f.properties.name, d: path(f) ?? '' }));
}
```

- [ ] **Step 4:** `npm test`. Expected: PASS. If Vite rejects the `with { type: 'json' }` attribute during `npm run build`, read the file with `fs.readFileSync(new URL(import.meta.resolve('world-atlas/countries-50m.json')))` instead and re-run both.

- [ ] **Step 5:** Commit `feat: build-time Horn of Africa outlines in grid coordinates`.

---

### Task 4: Content, nav, hero rain canvas, about

**Files:**
- Create: `src/data/site.ts`, `src/scripts/rain.ts`, `src/components/Nav.astro`, `Hero.astro`, `About.astro`, `src/assets/ezra.jpg`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `rainField`, `blockAverage`, `makeRamp`, `RAIN`, `W`, `H` (Task 2); `hornPaths()` (Task 3); CSS tokens (Task 1).
- Produces:
  - `site` object: `profile {name, role, pitch, location, org, email, linkedin, github}`, `stats[] {value:number, suffix, label}`, `about {paragraphs[], facts[]}`, `cgan {...}`, `vuln {...}`, `projects[]`, `publications[]`, `experience[] {role, org, place, start, end, points[]}`, `education[]`, `certifications[]`, `toolbox[] {group, items[]}`.
  - `rain.ts`: `export function mountHero(canvas: HTMLCanvasElement, paths: {d: string}[], opts: { reduced: boolean }): { resample(): number }` (returns the new sample number 1–5) and `export function mountDownscale(canvas, paths, seed): { setStage(i: 0|1|2|3): void }`, `export function mountLayers(canvases: HTMLCanvasElement[], paths): void`.
  - Pages pass outline data via `<script type="application/json" id="horn">` (one copy per page).

- [ ] **Step 1:** Copy the photo: `sips -Z 900 "/Users/mesh/Downloads/ezyy/passport 2.jpg" --out src/assets/ezra.jpg`.
- [ ] **Step 2:** Write `site.ts` with every fact from the spec's page structure (copy verbatim from the spec; pitch: "I teach models to turn noise into rainfall forecasts for the Greater Horn of Africa, and map who is most at risk when the rain fails or floods.").
- [ ] **Step 3:** `rain.ts` hero renderer:
  - Offscreen canvas `W×H`; `ImageData` buffer; `lut = makeRamp(RAIN)`.
  - State: `field` (current sample), `start` (Float32Array grey noise from `rng`), `delay` (per-cell 0–0.9 s), `boost` (pointer rain), `t0`.
  - Frame: for each cell `v = mix(start[i], field[(x - shift) mod W + y*W] + boost[i], ease((t - delay[i]) / 0.8))`; noise phase drawn grey, rain phase via `lut[round(v*255)]`. `boost[i] *= 0.965`. `shift = floor(t * 3)` cells/s after intro.
  - Draw: clear; fill land with `--land`; `clip(Path2D)` of all country paths (scaled to canvas); `imageSmoothingEnabled = false`; `drawImage(offscreen)`; stroke paths with `--border-map`.
  - Pointer: map client coords to grid; add a Gaussian bump (radius 10 cells, peak 0.6) to `boost`.
  - Pause when not intersecting or `document.hidden`. Re-read colours on `themechange`.
  - `reduced`: draw the final field once, no loop, no pointer.
  - `resample()`: cycle seeds `[7, 19, 31, 53, 89]`, restart intro from fresh noise.
- [ ] **Step 4:** `Hero.astro`: two-column (stacked < 900px). Left: mono eyebrow `IGAD-ICPAC · NAIROBI · 1.29°S 36.82°E`, `<h1>` name, role line, pitch, two CTAs, three stats with `data-count`. Right: `<canvas aria-label="Animated rainfall map of the Greater Horn of Africa">`, caption `ensemble member n/5 · 0.1° grid`, button **New sample**.
- [ ] **Step 5:** `Nav.astro`: monogram `EK`, links (#work, #research, #experience, #contact), theme toggle button (`aria-label`, sun/moon inline SVG), sticky with blur.
- [ ] **Step 6:** `About.astro`: `<Image src={ezra} widths={[320, 640]} alt="Ezra Kiplimo">`, paragraphs, facts list.
- [ ] **Step 7:** `npm run build && npm run preview`; open `http://localhost:4321/portfolio/` in Chrome: noise settles into rain inside the outline; pointer adds rain; New sample works; toggle switches theme and canvas colours.
- [ ] **Step 8:** Commit `feat: hero rain canvas, nav, about and site content`.

---

### Task 5: Downscaling section

**Files:**
- Create: `src/components/Downscale.astro`
- Modify: `src/scripts/rain.ts` (add `mountDownscale`), `src/pages/index.astro`

- [ ] **Step 1:** `mountDownscale`: precompute `blockAverage(field, W, H, k)` for `k = [10, 5, 2, 1]`; `setStage(i)` redraws that stage (same clip + stroke as hero).
- [ ] **Step 2:** Section markup: left text (SEWAA story, model facts from `site.cgan`, repo link), right sticky canvas with stage chips `1.0° · ~110 km`, `0.5° · ~55 km`, `0.2° · ~22 km`, `0.1° · ~11 km` (buttons, `aria-pressed`), labels "coarse forecast" → "cGAN sample".
- [ ] **Step 3:** ScrollTrigger on the section: progress → stage index. `matchMedia('(min-width: 900px)')` → `pin: true`, `end: '+=150%'`; smaller screens → no pin, progress across the section. Chips always clickable. Reduced motion: chips only.
- [ ] **Step 4:** Preview: scrolling steps through 4 stages; chips work; mobile width does not pin.
- [ ] **Step 5:** Commit `feat: scroll-driven downscaling section`.

---

### Task 6: Vulnerability stack

**Files:**
- Create: `src/components/Vulnerability.astro`, `src/assets/somalia-exposure.png`
- Modify: `src/scripts/rain.ts` (add `mountLayers`), `src/scripts/motion.ts`, `src/pages/index.astro`

- [ ] **Step 1:** Crop + resize the old site's Somalia exposure map: download `images/exosure_som.png` from `limoezra/limoezra.github.io`, `sips -c 9300 7700 --cropOffset 2200 2800`, then `sips -Z 1000`; check visually that the whole map is kept.
- [ ] **Step 2:** `mountLayers`: E = `rainField(101)`, S = `rainField(202)`, R = `rainField(303)`, V = clamp((E + S − R + 0.3) / 1.6); each drawn with `makeRamp(HAZARD)` into its canvas (clip + stroke).
- [ ] **Step 3:** Markup: 4 stacked canvases in a `.stack` with `transform: rotateX(58deg) rotateZ(-40deg)` and `translateZ` per layer; labels Exposure / Susceptibility / Resilience / Vulnerability; caption "illustrative data". Text: method, data sources, tools (from `site.vuln`), UNU-EHS publication link-out; real Somalia map in a figure.
- [ ] **Step 4:** `motion.ts`: ScrollTrigger scrub: layers start spread (`z = 0, 70, 140`), collapse to 0 while V fades in; labels follow. Mobile: smaller spread, no pin. Reduced: show V flat plus the three small layers in a row.
- [ ] **Step 5:** Preview check, then commit `feat: vulnerability layer stack with real Somalia exposure map`.

---

### Task 7: Remaining sections and motion polish

**Files:**
- Create: `Work.astro`, `Publications.astro`, `Experience.astro`, `Toolbox.astro`, `Contact.astro`, `Footer.astro`, `src/scripts/motion.ts` (if not yet created)
- Modify: `src/pages/index.astro`

- [ ] **Step 1:** Sections from `site.ts`. Experience: vertical line with drop-shaped markers; Toolbox: four groups as chips; Contact: big heading "Let's forecast something together", copy-email button (Clipboard API, falls back to mailto), LinkedIn, GitHub; Footer: © year, "Built with Astro · rain made of noise", back to top.
- [ ] **Step 2:** `motion.ts`: Lenis (lerp 0.1) + ScrollTrigger sync; `[data-scramble]` headings → `scrambleText` once on enter (chars `'░▒▓▖▗▘▙01'`), heading keeps `aria-label` = final text; `[data-reveal]` fade/slide; `[data-count]` count-up; experience drops `from {y:-60, opacity:0}` with `bounce.out` + CSS ripple. All skipped when reduced.
- [ ] **Step 3:** Chrome check at 1440 px and 360 px, both themes, reduced motion (DevTools rendering emulation): no horizontal scroll, keyboard focus visible, console clean.
- [ ] **Step 4:** `npm test && npm run build` both pass. Commit `feat: work, publications, experience, toolbox, contact and motion`.

---

### Task 8: Ship the portfolio PR

- [ ] **Step 1:** `git push -u origin feat/site`.
- [ ] **Step 2:** Enable Pages with Actions: `gh api -X POST repos/limoezra/portfolio/pages -f build_type=workflow` (ignore "already enabled").
- [ ] **Step 3:** `gh pr create --base main --head feat/site --title "Animated portfolio: Noise → Forecast" --body <summary + checklist + "🤖 Generated with [Claude Code](https://claude.com/claude-code)">`; confirm bravomesh is requested (`gh pr view --json reviewRequests`); add `--reviewer bravomesh` if CODEOWNERS didn't.

---

### Task 9: Profile README (`limoezra/limoezra`)

**Files:**
- Create: `scripts/banner.mjs`, `assets/banner.svg`, `README.md`

- [ ] **Step 1:** `git checkout -b feat/readme`.
- [ ] **Step 2:** `banner.mjs`: 5×7 pixel font for `E Z R A K I P L M O`; outputs a 1200×300 SVG with dark rounded background `#090c1c`, faint grid, ~40 looping background drops, name pixels as `<rect>`s that fall from `y=-20` to their spot with staggered `animation-delay` (fill-mode `both`), coloured along the rain ramp left → right; subtitle `MACHINE LEARNING SCIENTIST · GIS · STATISTICIAN` in `ui-monospace`, fades in after; `@media (prefers-reduced-motion: reduce)` disables animation. Run `node scripts/banner.mjs > assets/banner.svg`; open in Chrome to check.
- [ ] **Step 3:** `README.md`: banner; badges (Portfolio → `https://limoezra.github.io/portfolio/`, LinkedIn, Email) via shields.io in rain-ramp colours; **Now** (4 bullets); **Featured work** table (SEWAA-forecasts-RFE2, SEWAA-forecasts, vulnerability profiles, EOPF notebook competition fork omitted unless confirmed); **Publications** (2); **Toolbox** badges grouped ML / Geospatial / Data / Viz.
- [ ] **Step 4:** Commit, push, `gh pr create` with reviewer bravomesh.

---

### Task 10: After merge

- [ ] **Step 1:** When bravomesh approves and the PR is merged, watch the deploy: `gh run watch -R limoezra/portfolio`. Open `https://limoezra.github.io/portfolio/` and check it renders.
- [ ] **Step 2:** In `limoezra/limoezra.github.io`, replace `index.html` with a redirect (canonical link + `meta refresh` + visible link to `https://limoezra.github.io/portfolio/`); commit + push to its default branch; check the old URL lands on the new site.
- [ ] **Step 3:** Remind Ezra: `gh auth logout -h github.com -u limoezra` and `brew uninstall gh`; the per-repo credential helper lines can stay (they do nothing without gh) or be removed with `git config --unset-all credential.helper`.
