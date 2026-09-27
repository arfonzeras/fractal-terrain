'use strict';

/**
 * Tippetts fractal — a swapped-order variant of z^2+c (the real part is
 * updated using the NEW imaginary part's role reversed vs. Mandelbrot;
 * see the exact step below, ported as-is from tippetts.ts, base fork
 * content). ADAPTED: original is Mandelbrot convention (pixel=c, z0=0);
 * here pixel=z0, c=this tool's tunable parameter. Source only implements
 * the plain (non-smooth) iteration, so that's all this ports.
 */

const escape = 4;

function iterate(cx, cy, c, iterMax) {
  let zx = cx, zy = cy, sqx = zx*zx, sqy = zy*zy, i = 0;
  for (; i < iterMax && sqx + sqy <= escape; i++) {
    zx = sqx - sqy + c[0];
    zy = (zx + zx) * zy + c[1];
    sqx = zx * zx;
    sqy = zy * zy;
  }
  return i;
}

module.exports = {
  name: 'tippetts-julia',
  description: 'Swapped-order z^2+c variant, Julia dual of Tippetts (pixel=z0, c fixed — see file comment)',
  category: 'Adapted from Mandelbrot',
  defaultC: [0.285, 0.01],
  defaultDomainHalf: 2,
  iterate
};
