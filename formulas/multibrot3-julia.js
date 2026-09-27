'use strict';

/**
 * z^3 + c (Multibrot power 3). Ported from mandelbrot3.ts (base fork
 * content). ADAPTED: original is Mandelbrot convention (pixel=c, z0=0);
 * here pixel=z0, c=this tool's tunable parameter.
 */

const escape = 4;

function iterate(cx, cy, c, iterMax) {
  let zx = cx, zy = cy, sqx = zx*zx, sqy = zy*zy, i = 0;
  while (true) {
    const znx = sqx*zx - 3*zx*sqy + c[0];
    const zny = 3*sqx*zy - sqy*zy + c[1];
    zx = znx; zy = zny;
    if (++i >= iterMax) break;
    sqx = zx*zx; sqy = zy*zy;
    if (sqx + sqy > escape) break;
  }
  return i;
}

module.exports = {
  name: 'multibrot3-julia',
  description: 'z^3 + c, Julia dual of Multibrot*3 (pixel=z0, c fixed — see file comment)',
  category: 'Adapted from Mandelbrot',
  defaultC: [-0.4, 0.6],
  defaultDomainHalf: 1.5,
  iterate
};
