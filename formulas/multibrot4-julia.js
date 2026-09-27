'use strict';

/**
 * z^4 + c (Multibrot power 4). Ported from mandelbrot4.ts (base fork
 * content). ADAPTED: original is Mandelbrot convention (pixel=c, z0=0);
 * here pixel=z0, c=this tool's tunable parameter.
 */

const escape = 4;

function iterate(cx, cy, c, iterMax) {
  let zx = cx, zy = cy, sqx = zx*zx, sqy = zy*zy, i = 0;
  while (true) {
    const znx = sqx*sqx - 6*sqx*sqy + sqy*sqy + c[0];
    const zny = 4*sqx*zx*zy - 4*zx*sqy*zy + c[1];
    zx = znx; zy = zny;
    if (++i >= iterMax) break;
    sqx = zx*zx; sqy = zy*zy;
    if (sqx + sqy > escape) break;
  }
  return i;
}

module.exports = {
  name: 'multibrot4-julia',
  description: 'z^4 + c, Julia dual of Multibrot*4 (pixel=z0, c fixed — see file comment)',
  category: 'Adapted from Mandelbrot',
  defaultC: [-0.75, 0.11],
  defaultDomainHalf: 3,
  iterate
};
