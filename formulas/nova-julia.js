'use strict';

/**
 * Nova — Newton's method on z^3-1 with a perturbation c added each step:
 * z(n+1) = z(n) - (z(n)^3-1)/(3*z(n)^2) + c.
 * Ported from nova.ts (open PR #94 on solendil/FractalJS, not merged).
 *
 * ADAPTED, same reasoning as tricorn-julia.js: the original is Mandelbrot
 * convention (pixel = c, z0 fixed at (1,0)). Here pixel = z0 (varies
 * across the terrain), c = this tool's tunable parameter. At c=(0,0)
 * this reduces to plain Newton's method on z^3-1, started from every
 * terrain point instead of one fixed root — still returns a bounded
 * convergence-step count (0..iterMax), unlike newton.ts's own root-offset
 * encoding, so it fits this tool's height model directly.
 */

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
    const px = (numx * denx + numy * deny) / denom;
    const py = (numy * denx - numx * deny) / denom;
    const nx = x - px + c[0], ny = y - py + c[1];
    const dx = nx - x, dy = ny - y;
    x = nx; y = ny;
    if (dx * dx + dy * dy < tol2) break;
    if (x * x + y * y > bigBailout2) break;
  }
  return i;
}

module.exports = {
  name: 'nova-julia',
  description: 'Newton on z^3-1 + c, Julia dual of Nova (pixel=z0, c fixed — see file comment)',
  category: 'Adapted from Mandelbrot',
  defaultC: [0, 0],
  defaultDomainHalf: 2,
  iterate
};
