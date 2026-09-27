'use strict';

/**
 * Burning Ship — like Mandelbrot but |Re(z)|,|Im(z)| are taken before
 * squaring each step. Ported from burningship.ts (base fork content).
 * ADAPTED: original is Mandelbrot convention (pixel=c, z0=0); here
 * pixel=z0, c=this tool's tunable parameter (placeholder default below —
 * see README for the value actually picked after testing in Node).
 */

const escape = 4;

function iterate(cx, cy, c, iterMax) {
  let zx = cx, zy = cy, sqx = zx*zx, sqy = zy*zy, i = 0;
  const cyF = -c[1]; // original negates cy before the loop ("usually drawn upside down")
  while (true) {
    const zny = (zx + zx) * zy + cyF;
    const znx = sqx - sqy + c[0];
    zx = Math.abs(znx);
    zy = Math.abs(zny);
    if (++i >= iterMax) break;
    sqx = zx * zx; sqy = zy * zy;
    if (sqx + sqy > escape) break;
  }
  return i;
}

module.exports = {
  name: 'burning-ship-julia',
  description: 'Burning Ship, Julia dual (pixel=z0, c fixed — see file comment)',
  category: 'Adapted from Mandelbrot',
  defaultC: [-0.75, 0.11],
  defaultDomainHalf: 3,
  iterate
};
