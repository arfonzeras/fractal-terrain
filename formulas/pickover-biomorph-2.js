'use strict';

/**
 * Pickover Biomorph II — z -> sin(z) + z^2 + c, same AND bailout as the
 * first biomorph. Ported from pickover2.ts (open PR #93 on solendil/
 * FractalJS at the time this was written — not yet merged).
 * Julia convention already (pixel = z0, c fixed) — no adaptation needed.
 */

const A = 10;

function iterate(cx, cy, c, iterMax) {
  let x = cx, y = cy, i = 0;
  for (; i < iterMax; i++) {
    const ey = Math.exp(y), emy = 1 / ey;
    const coshy = (ey + emy) * 0.5, sinhy = (ey - emy) * 0.5;
    const zx2 = x * x - y * y, zy2 = 2 * x * y;
    const nx = Math.sin(x) * coshy + zx2 + c[0];
    const ny = Math.cos(x) * sinhy + zy2 + c[1];
    x = nx; y = ny;
    if (Math.abs(x) > A && Math.abs(y) > A) break;
  }
  return i;
}

module.exports = {
  name: 'pickover-biomorph-2',
  description: 'sin(z) + z^2 + c, AND bailout — denser "bract" clustering than the first biomorph',
  category: 'Julia-native',
  defaultC: [-1.0, -1.0],
  defaultDomainHalf: 8,
  iterate
};
