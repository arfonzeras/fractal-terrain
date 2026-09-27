'use strict';

/**
 * Magnet Type I — z(n+1) = ((z^2+c-1)/(2z+c-2))^2.
 * Ported from magnet1.ts (open PR #95 on solendil/FractalJS, not merged).
 * ADAPTED, same reasoning as tricorn-julia.js: pixel=z0 here (varies),
 * c=this tool's tunable parameter, default (0,0) matches the original's
 * fixed pixel-independent z0=0.
 */

function iterate(cx, cy, c, iterMax) {
  let x = cx, y = cy, i = 0;
  const upperBailout2 = 900, lowerTol2 = 6.4e-11;
  for (; i < iterMax; i++) {
    const zzx = x * x - y * y, zzy = 2 * x * y;
    const numx = zzx + c[0] - 1, numy = zzy + c[1];
    const denx = 2 * x + c[0] - 2, deny = 2 * y + c[1];
    const den2 = denx * denx + deny * deny;
    if (den2 < 1e-18) break;
    const rx = (numx * denx + numy * deny) / den2;
    const ry = (numy * denx - numx * deny) / den2;
    const nx = rx * rx - ry * ry, ny = 2 * rx * ry;
    const dx = nx - x, dy = ny - y;
    x = nx; y = ny;
    if (dx * dx + dy * dy < lowerTol2) break;
    if (x * x + y * y > upperBailout2) break;
  }
  return i;
}

module.exports = {
  name: 'magnet1-julia',
  description: 'Magnet Type I mean-field map, Julia dual (pixel=z0, c fixed — see file comment)',
  defaultC: [0, 0],
  defaultDomainHalf: 6,  // tuned in Node — smaller windows were mostly
                         // converged/flat (ratio 0.72-0.94)
  iterate
};
