'use strict';

/**
 * Nova Inverse — Newton's method on f(z) = cos(z) - 1, which simplifies to
 * z(n+1) = z(n) - tan(z(n)/2) + c. Ported from novatan.ts (open PR #99 on
 * solendil/FractalJS, not yet merged). Deliberately Julia-convention in
 * the original already (pixel = z0, c fixed) — the PR's own comment notes
 * that rendering it Mandelbrot-style instead barely shows any structure —
 * so no adaptation needed here, unlike the Mandelbrot-family formulas.
 */

function iterate(cx, cy, c, iterMax) {
  let x = cx, y = cy, i = 0;
  const tol2 = 1e-12, bigBailout2 = 1e8;
  for (; i < iterMax; i++) {
    const denomT = Math.cos(x) + Math.cosh(y);
    if (Math.abs(denomT) < 1e-14) break;
    const tx = Math.sin(x) / denomT, ty = Math.sinh(y) / denomT;
    const nx = x - tx + c[0], ny = y - ty + c[1];
    const dx = nx - x, dy = ny - y;
    x = nx; y = ny;
    if (dx * dx + dy * dy < tol2) break;
    if (x * x + y * y > bigBailout2) break;
  }
  return i;
}

module.exports = {
  name: 'nova-inverse',
  description: 'Newton on cos(z)-1 (= tan(z/2) step) + c — periodic, bead-like chain structure',
  defaultC: [0.3, 0.2],
  defaultDomainHalf: 10,
  iterate
};
