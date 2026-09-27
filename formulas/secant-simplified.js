'use strict';

/**
 * Secant method on f(z) = z^3 - 1. Ported from secant.ts (open PR #96 on
 * solendil/FractalJS, not merged) — same simplification as
 * newton-simplified.js: keeps only the convergence step count, drops
 * which of the 3 roots it landed on (the original encodes that via a
 * lookup-table offset, a different scale than this tool's height model).
 * See newton-simplified.js for the full reasoning.
 */

const roots = [
  { x: 1, y: 0 },
  { x: -0.5, y: Math.sqrt(3) / 2 },
  { x: -0.5, y: -Math.sqrt(3) / 2 }
];
const convergenceEps = 1e-12;
const degenerateEps = 1e-20;
const divergeBailout2 = 1e12;

function iterate(cx, cy, c, iterMax) {
  // c is unused, same reason as newton-simplified.js.
  let x0 = 0, y0 = 0, x1 = cx, y1 = cy, i = 0, done = false;
  let xx0 = x0 * x0 - y0 * y0, yy0 = 2 * x0 * y0;
  let f0x = xx0 * x0 - yy0 * y0 - 1, f0y = xx0 * y0 + yy0 * x0;
  for (; i < iterMax; i++) {
    const xx1 = x1 * x1 - y1 * y1, yy1 = 2 * x1 * y1;
    const f1x = xx1 * x1 - yy1 * y1 - 1, f1y = xx1 * y1 + yy1 * x1;
    const denx = f1x - f0x, deny = f1y - f0y;
    const denom = denx * denx + deny * deny;
    if (denom < degenerateEps) break;
    const dzx = x1 - x0, dzy = y1 - y0;
    const numx = f1x * dzx - f1y * dzy, numy = f1x * dzy + f1y * dzx;
    const stepx = (numx * denx + numy * deny) / denom;
    const stepy = (numy * denx - numx * deny) / denom;
    const nx = x1 - stepx, ny = y1 - stepy;
    x0 = x1; y0 = y1; f0x = f1x; f0y = f1y;
    x1 = nx; y1 = ny;
    for (let r = 0; r < roots.length; r++) {
      const ddx = x1 - roots[r].x, ddy = y1 - roots[r].y;
      if (ddx * ddx + ddy * ddy < convergenceEps) { done = true; break; }
    }
    if (done) break;
    if (x1 * x1 + y1 * y1 > divergeBailout2) break;
  }
  return i;
}

module.exports = {
  name: 'secant-simplified',
  description: 'Secant method on z^3-1, convergence speed only (basin/root distinction dropped — see file comment)',
  defaultC: [0, 0],
  defaultDomainHalf: 2,
  iterate
};
