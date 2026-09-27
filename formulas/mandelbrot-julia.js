'use strict';

/**
 * z^2 + c. Ported from mandelbrot.ts (base fork content). ADAPTED: the
 * original is Mandelbrot convention (pixel=c, z0=0). Here pixel=z0
 * (varies across the terrain), c=this tool's tunable parameter. Default
 * c reuses julia.ts's own choice (0.285, 0.01) — a known well-formed
 * Julia set for this exact map, rather than the degenerate plain circle
 * you get at c=(0,0).
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
  name: 'mandelbrot-julia',
  description: 'z^2 + c, Julia dual of Mandelbrot (pixel=z0, c fixed — see file comment)',
  category: 'Adapted from Mandelbrot',
  defaultC: [0.355, 0.355],
  defaultDomainHalf: 1.5,
  iterate
};
