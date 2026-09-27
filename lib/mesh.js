'use strict';

const DEFAULT_PALETTE = [
  [0.00, [6, 20, 11]],
  [0.35, [22, 110, 52]],
  [0.75, [58, 140, 68]],
  [1.00, [255, 251, 234]]
];

function paletteColor(stops, t) {
  t = Math.min(1, Math.max(0, t));
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i], b = stops[i + 1];
    if (t >= a[0] && t <= b[0]) {
      const f = (t - a[0]) / ((b[0] - a[0]) || 1);
      return [
        (a[1][0] + (b[1][0] - a[1][0]) * f) / 255,
        (a[1][1] + (b[1][1] - a[1][1]) * f) / 255,
        (a[1][2] + (b[1][2] - a[1][2]) * f) / 255
      ];
    }
  }
  const last = stops[stops.length - 1][1];
  return [last[0] / 255, last[1] / 255, last[2] / 255];
}

function boxBlur(src, w, h, passes) {
  let a = src, b = new Float64Array(src.length);
  for (let pass = 0; pass < passes; pass++) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let sum = 0, n = 0;
        for (let dy = -1; dy <= 1; dy++) {
          const yy = y + dy; if (yy < 0 || yy >= h) continue;
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx; if (xx < 0 || xx >= w) continue;
            sum += a[yy * w + xx]; n++;
          }
        }
        b[y * w + x] = sum / n;
      }
    }
    const tmp = a; a = b; b = tmp;
  }
  return a;
}

/**
 * Builds raw geometry arrays (positions, colors, indices) for a terrain
 * mesh from any formula plugin. This is an offline builder (run once,
 * not per-frame), so it uses a proper multi-pass box blur rather than the
 * cheaper neighbor-average a live shader would need.
 *
 * @param {object} opts
 * @param {function} opts.iterate  (cx, cy, c, iterMax) => iteration count
 * @param {number[]} opts.c
 * @param {number} [opts.iterMax=50]
 * @param {number} [opts.domainHalf=3]
 * @param {number} [opts.resolution=128]  grid segments per side
 * @param {number} opts.gamma              from calibrate()
 * @param {number} opts.fieldMax           from calibrate()
 * @param {number} [opts.heightScale=1.6]
 * @param {number} [opts.smoothPasses=2]
 * @param {Array}  [opts.palette]          [[0..1, [r,g,b 0..255]], ...]
 */
function buildMesh(opts) {
  const {
    iterate, c,
    iterMax = 50,
    domainHalf = 3,
    resolution = 128,
    gamma,
    fieldMax,
    heightScale = 1.6,
    smoothPasses = 2,
    palette = DEFAULT_PALETTE
  } = opts;

  if (gamma === undefined || fieldMax === undefined) {
    throw new Error('buildMesh requires gamma and fieldMax — run calibrate() first');
  }

  const res = resolution, gridX1 = res + 1;
  const step = (domainHalf * 2) / res;

  let field = new Float64Array(gridX1 * gridX1);
  let fi = 0;
  for (let iy = 0; iy <= res; iy++) {
    const cy = -domainHalf + iy * step;
    for (let ix = 0; ix <= res; ix++) {
      const cx = -domainHalf + ix * step;
      const it = iterate(cx, cy, c, iterMax);
      field[fi++] = Math.pow(it / iterMax, gamma);
    }
  }
  field = boxBlur(field, gridX1, gridX1, smoothPasses);

  const positions = new Float32Array(gridX1 * gridX1 * 3);
  const colors = new Float32Array(gridX1 * gridX1 * 3);
  let p = 0, cIdx = 0, f = 0;
  for (let iy = 0; iy <= res; iy++) {
    const cy = -domainHalf + iy * step;
    for (let ix = 0; ix <= res; ix++) {
      const cx = -domainHalf + ix * step;
      const tn = field[f++];
      positions[p++] = cx;
      positions[p++] = tn * heightScale;
      positions[p++] = -cy;

      const tColor = Math.min(1, tn / fieldMax);
      const col = paletteColor(palette, tColor);
      colors[cIdx++] = col[0];
      colors[cIdx++] = col[1];
      colors[cIdx++] = col[2];
    }
  }

  // Same winding as a stock PlaneGeometry built directly with Y-up axes
  // (x horizontal, z horizontal, y = height) — verified in the
  // terreno-3d-jungla project to give correctly-oriented (+Y) normals
  // without needing a post-hoc rotation.
  const indices = [];
  for (let gy = 0; gy < res; gy++) {
    for (let gx = 0; gx < res; gx++) {
      const a = gx + gridX1 * gy;
      const b = gx + gridX1 * (gy + 1);
      const cc = (gx + 1) + gridX1 * (gy + 1);
      const d = (gx + 1) + gridX1 * gy;
      indices.push(a, b, d, b, cc, d);
    }
  }

  return { positions, colors, indices, resolution: res, gridX1 };
}

module.exports = { buildMesh, paletteColor, boxBlur, DEFAULT_PALETTE };
