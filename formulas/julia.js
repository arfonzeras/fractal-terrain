'use strict';

/**
 * Classic Julia set — z(n+1) = z(n)^2 + c. Ported from julia.ts in
 * arfonzeras/FractalJS (the base fork content, not one of his PRs).
 * Already Julia-native (pixel=z0, c fixed at 0.285+0.01i in the source) —
 * no adaptation needed, unlike the Mandelbrot-family formulas below.
 */

const escape = 4;

function iterate(cx, cy, c, iterMax) {
  let znx = cx, zny = cy, sqx = cx * cx, sqy = cy * cy, i = 0;
  for (; i < iterMax && sqx + sqy <= escape; i++) {
    zny = (znx + znx) * zny + c[1];
    znx = sqx - sqy + c[0];
    sqx = znx * znx;
    sqy = zny * zny;
  }
  return i;
}

module.exports = {
  name: 'julia',
  description: 'z^2 + c, the classic Julia set — Julia-native, no adaptation',
  category: 'Julia-native',
  defaultC: [0.285, 0.01],
  defaultDomainHalf: 1.6,
  iterate
};
