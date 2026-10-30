// Build-time only: outlines of the 11 ICPAC countries as SVG paths in grid
// coordinates (x 0..352, y 0..384, 0.1° per unit). Nothing here ships to the browser.
import { geoEquirectangular, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import world from 'world-atlas/countries-50m.json' with { type: 'json' };

const IDS = new Set(['108', '231', '232', '262', '404', '646', '706', '728', '729', '800', '834']);
const LON0 = 19.15; // west edge of the grid
const LAT1 = 24.65; // north edge of the grid

export function hornPaths() {
  const topo = world as any;
  const all = (feature(topo, topo.objects.countries) as any).features as any[];
  // world-atlas leaves Somaliland without an id; draw it as part of Somalia.
  const picked = all.filter((f) => IDS.has(f.id) || f.properties.name === 'Somaliland');
  const proj = geoEquirectangular()
    .scale(1800 / Math.PI) // 10 units per degree
    .translate([-LON0 * 10, LAT1 * 10]);
  const path = geoPath(proj).digits(1);
  return picked.map((f) => ({
    name: f.properties.name === 'Somaliland' ? 'Somalia' : (f.properties.name as string),
    d: path(f) ?? '',
  }));
}
