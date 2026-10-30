import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rng, rainField, blockAverage, makeRamp, RAIN, W, H } from '../src/scripts/field.ts';

test('rng is deterministic and in [0,1)', () => {
  const a = rng(7);
  const b = rng(7);
  for (let i = 0; i < 100; i++) {
    const x = a();
    assert.equal(x, b());
    assert.ok(x >= 0 && x < 1);
  }
});

test('rainField: size, range, dry and wet cells, deterministic', () => {
  const f = rainField(42);
  assert.equal(f.length, W * H);
  let dry = 0;
  let wet = 0;
  for (const v of f) {
    assert.ok(v >= 0 && v <= 1);
    if (v === 0) dry++;
    if (v > 0.5) wet++;
  }
  assert.ok(dry > f.length * 0.2, 'mostly dry like real rain');
  assert.ok(wet > 0, 'some heavy rain');
  assert.deepEqual(rainField(42).slice(0, 50), f.slice(0, 50));
  assert.notDeepEqual(rainField(43).slice(0, 2000), f.slice(0, 2000));
});

test('rainField wraps in x, so it can drift seamlessly', () => {
  const w = 120;
  const h = 120;
  // Use the raw (pre-threshold) field so dry zeros don't hide a seam.
  const f = rainField(5, w, h, true);
  let inner = 0;
  let seam = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w - 1; x++) inner += Math.abs(f[y * w + x] - f[y * w + x + 1]);
    seam += Math.abs(f[y * w + w - 1] - f[y * w]);
  }
  inner /= h * (w - 1);
  seam /= h;
  assert.ok(seam < inner * 2.5, `seam ${seam.toFixed(3)} vs neighbours ${inner.toFixed(3)}`);
});

test('blockAverage replaces each k×k block with its mean', () => {
  const src = Float32Array.from([1, 3, 0, 0, 5, 7, 0, 4, 2, 2, 1, 1, 2, 2, 1, 1]);
  const out = blockAverage(src, 4, 4, 2);
  assert.deepEqual([...out], [4, 4, 1, 1, 4, 4, 1, 1, 2, 2, 1, 1, 2, 2, 1, 1]);
  assert.deepEqual([...blockAverage(src, 4, 4, 1)], [...src]);
});

test('blockAverage handles ragged edges', () => {
  const out = blockAverage(Float32Array.from([2, 4, 6]), 3, 1, 2);
  assert.deepEqual([...out], [3, 3, 6]);
});

test('makeRamp: 256 RGBA entries, dry is transparent, ends on the last stop', () => {
  const r = makeRamp(RAIN);
  assert.equal(r.length, 256 * 4);
  assert.equal(r[3], 0);
  const last = RAIN[RAIN.length - 1];
  const rgb = [1, 3, 5].map((i) => parseInt(last.slice(i, i + 2), 16));
  assert.deepEqual([...r.slice(255 * 4, 255 * 4 + 3)], rgb);
  assert.equal(r[255 * 4 + 3], 255);
});
