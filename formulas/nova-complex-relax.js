'use strict';

/**
 * Nova with a complex relaxation factor R=1+i instead of R=1.
 * Ported from novacomplex.ts (open PR #98 on solendil/FractalJS, not
 * merged). ADAPTED, same reasoning as tricorn-julia.js: pixel=z0 (varies),
 * c=this tool's tunable parameter, default (0,0).
 */

const Rx = 1.0, Ry = 1.0;

function iterate(cx, cy, c, iterMax) {
  let x = cx, y = cy, i = 0;
  const tol2 = 1e-12, bigBailout2 = 1e8;
  for (; i < iterMax; i++) {
    const x2 = x * x - y * y, y2 = 2 * x * y;
    const x3 = x2 * x - y2 * y, y3 = x2 * y + y2 * x;
    const numx = x3 - 1, numy = y3;
    const denx = 3 * x2, deny = 3 * y2;
    const denom = denx * denx + deny * deny;
    if (denom < 1e-18) break;
    const stepx = (numx * denx + numy * deny) / denom;
    const stepy = (numy * denx - numx * deny) / denom;
    const rstepx = Rx * stepx - Ry * stepy;
    const rstepy = Rx * stepy + Ry * stepx;
    const nx = x - rstepx + c[0], ny = y - rstepy + c[1];
    const dx = nx - x, dy = ny - y;
    x = nx; y = ny;
    if (dx * dx + dy * dy < tol2) break;
    if (x * x + y * y > bigBailout2) break;
  }
  return i;
}

module.exports = {
  name: 'nova-complex-relax',
  description: 'Nova with complex relaxation R=1+i, Julia dual (pixel=z0, c fixed — see file comment)',
  defaultC: [0.5, 0],   // NOT (0,0): checked in Node first — at c=(0,0) this
                         // is degenerate, 100% of the sampled domain
                         // converges within iterMax (a dead-flat terrain).
                         // (0.5, 0) actually varies (mean/max ratio ~0.5).
  defaultDomainHalf: 4,
  iterate
};
