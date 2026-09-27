'use strict';

/**
 * Newton's method on f(z) = z^3 - 1. Ported from newton.ts (open PR #92
 * on solendil/FractalJS, not merged) — WITH A REAL SIMPLIFICATION, not a
 * faithful port:
 *
 * The original is a convergence fractal, not an escape-time one: nearly
 * every point converges to one of 3 roots, and the 2D picture's color
 * comes from WHICH root (encoded as root*iterMax + step, a value up to
 * ~150 for iterMax=50) — a totally different scale than this tool's
 * 0..iterMax height model expects, and not something a single height
 * channel can represent without inventing a new encoding.
 *
 * This version keeps only the convergence STEP COUNT and drops which
 * root it landed on. That fits the height model directly, but it means
 * the three-basin color structure the original 2D fractal shows is gone
 * here — you'd see convergence speed as relief, not basin boundaries as
 * color regions. A truer port (e.g. basin as a second data channel
 * driving something other than height) is possible but not done here.
 */

const roots = [
  { x: 1, y: 0 },
  { x: -0.5, y: Math.sqrt(3) / 2 },
  { x: -0.5, y: -Math.sqrt(3) / 2 }
];
const convergenceEps = 1e-12;
const derivativeEps = 1e-14;

function iterate(cx, cy, c, iterMax) {
  // c is unused — the original formula has no free parameter (it's
  // Newton's method on a fixed polynomial). Kept in the signature only
  // so this plugin matches the shared interface.
  let x = cx, y = cy, i = 0, converged = false;
  for (; i < iterMax; i++) {
    const x2 = x * x - y * y, y2 = 2 * x * y;
    const x3 = x2 * x - y2 * y, y3 = x2 * y + y2 * x;
    const nx = x3 - 1, ny = y3;
    const dx = 3 * x2, dy = 3 * y2;
    const denom = dx * dx + dy * dy;
    if (denom < derivativeEps) break;
    const px = (nx * dx + ny * dy) / denom;
    const py = (ny * dx - nx * dy) / denom;
    x -= px; y -= py;
    for (let r = 0; r < roots.length; r++) {
      const ddx = x - roots[r].x, ddy = y - roots[r].y;
      if (ddx * ddx + ddy * ddy < convergenceEps) { converged = true; break; }
    }
    if (converged) break;
  }
  return i;
}

module.exports = {
  name: 'newton-simplified',
  description: 'Newton on z^3-1, convergence speed only (basin/root distinction dropped — see file comment)',
  category: 'Simplified (convergence, not escape-time)',
  defaultC: [0, 0],
  defaultDomainHalf: 2,
  iterate
};
