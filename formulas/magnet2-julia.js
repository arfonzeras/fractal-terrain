'use strict';

/**
 * Magnet Type II — cubic/quadratic version of Magnet I.
 * Ported from magnet2.ts (open PR #97 on solendil/FractalJS, not merged).
 * ADAPTED, same reasoning as tricorn-julia.js: pixel=z0 (varies), c=this
 * tool's tunable parameter, default (0,0) matching the original's fixed
 * pixel-independent z0=0.
 */

function iterate(cx, cy, c, iterMax) {
  let x = cx, y = cy, i = 0;
  const upperBailout2 = 900, lowerTol2 = 6.4e-11;
  const threeAx = 3 * (c[0] - 1), threeAy = 3 * c[1];
  const threeBx = 3 * (c[0] - 2), threeBy = 3 * c[1];
  const abx = (c[0] - 1) * (c[0] - 2) - c[1] * c[1];
  const aby = (c[0] - 1) * c[1] + c[1] * (c[0] - 2);
  for (; i < iterMax; i++) {
    const zzx = x * x - y * y, zzy = 2 * x * y;
    const z3x = zzx * x - zzy * y, z3y = zzx * y + zzy * x;
    const threeAzx = threeAx * x - threeAy * y, threeAzy = threeAy * x + threeAx * y;
    const numx = z3x + threeAzx + abx, numy = z3y + threeAzy + aby;
    const threeBzx = threeBx * x - threeBy * y, threeBzy = threeBy * x + threeBx * y;
    const denx = 3 * zzx + threeBzx + abx + 1, deny = 3 * zzy + threeBzy + aby;
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
  name: 'magnet2-julia',
  description: 'Magnet Type II mean-field map, Julia dual (pixel=z0, c fixed — see file comment)',
  defaultC: [0, 0],
  defaultDomainHalf: 10,  // tuned in Node — smaller windows were mostly
                          // converged/flat (ratio 0.66-0.67)
  iterate
};
