'use strict';

/**
 * Phoenix fractal — a second-order recurrence (uses the PREVIOUS step's z
 * as well as the current one): x(n+1) = x^2 - y^2 + c.x + c.y*x(n-1),
 * y(n+1) = 2xy + c.y*y(n-1). Ported from phoenix.ts in arfonzeras/
 * FractalJS (base fork content). Already maps the pixel into the starting
 * z0 (via a 90-degree coordinate swap the original source itself does:
 * x0=-cy, y0=cx) with c fixed — Julia-native, no Mandelbrot-convention
 * adaptation needed, unlike burning-ship/burning-bird/mandelbrot below.
 */

const escape = 4;

function iterate(cx, cy, c, iterMax) {
  let x = -cy, y = cx, xm1 = 0, ym1 = 0;
  let sx = 0, sy = 0, i = 0;
  for (; i < iterMax && sx + sy <= escape; i++) {
    const xp1 = x * x - y * y + c[0] + c[1] * xm1;
    const yp1 = 2 * x * y + c[1] * ym1;
    sx = xp1 * xp1;
    sy = yp1 * yp1;
    xm1 = x; ym1 = y;
    x = xp1; y = yp1;
  }
  return i;
}

module.exports = {
  name: 'phoenix',
  description: 'Second-order recurrence with memory of the previous step — Julia-native (pixel maps to z0 via a coordinate swap)',
  category: 'Julia-native',
  defaultC: [0.5667, -0.5],
  defaultDomainHalf: 1.6,
  iterate
};
