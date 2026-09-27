'use strict';

/**
 * Burning Bird — like Burning Ship but only |Im(z)| is taken before
 * squaring, not |Re(z)|. Ported from burningbird.ts (base fork content).
 * ADAPTED: original is Mandelbrot convention (pixel=c, z0=0); here
 * pixel=z0, c=this tool's tunable parameter.
 */

const escape = 4;

function iterate(cx, cy, c, iterMax) {
  let zx = cx, zy = cy, sqx = zx*zx, sqy = zy*zy, i = 0;
  const cyF = -c[1];
  while (true) {
    const zny = (zx + zx) * zy + cyF;
    const znx = sqx - sqy + c[0];
    zx = znx;
    zy = Math.abs(zny);
    if (++i >= iterMax) break;
    sqx = zx * zx; sqy = zy * zy;
    if (sqx + sqy > escape) break;
  }
  return i;
}

module.exports = {
  name: 'burning-bird-julia',
  description: 'Burning Bird, Julia dual (pixel=z0, c fixed — see file comment)',
  category: 'Adapted from Mandelbrot',
  defaultC: [-0.7269, 0.1889],
  defaultDomainHalf: 1.5,
  iterate
};
