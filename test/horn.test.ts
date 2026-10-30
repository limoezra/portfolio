import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hornPaths } from '../src/data/horn.ts';

test('hornPaths returns the ICPAC countries inside the grid', () => {
  const p = hornPaths();
  const names = new Set(p.map((c) => c.name));
  for (const n of ['Kenya', 'Ethiopia', 'Somalia', 'S. Sudan', 'Sudan', 'Tanzania', 'Uganda', 'Djibouti', 'Eritrea', 'Rwanda', 'Burundi']) {
    assert.ok(names.has(n), n);
  }
  assert.equal(p.length, 12, '11 countries + Somaliland drawn as Somalia');
  const kenya = p.find((c) => c.name === 'Kenya')!.d;
  const nums = kenya.match(/-?\d+(\.\d+)?/g)!.map(Number);
  const xs = nums.filter((_, i) => i % 2 === 0);
  const ys = nums.filter((_, i) => i % 2 === 1);
  // Kenya spans lon ~33.9–41.9 → x ~148–228, lat ~5.0 to −4.7 → y ~196–294
  assert.ok(Math.min(...xs) > 140 && Math.max(...xs) < 235, `x ${Math.min(...xs)}–${Math.max(...xs)}`);
  assert.ok(Math.min(...ys) > 190 && Math.max(...ys) < 305, `y ${Math.min(...ys)}–${Math.max(...ys)}`);
});
