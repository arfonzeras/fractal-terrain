'use strict';

/**
 * Pickover Biomorph — z -> sin(z) + e^z + c, escape-time with an AND bailout
 * (|Re(z)| > A AND |Im(z)| > A, not OR — that's what gives the filamentous
 * look rather than a blob).
 *
 * This is the exact formula used in the terreno-3d-jungla project, ported
 * from the pickover.ts implementation contributed to FractalJS
 * (github.com/arfonzeras/FractalJS).
 */

const A = 10;

function iterate(cx, cy, c, iterMax) {
  let x = cx, y = cy, i = 0;
  for (; i < iterMax; i++) {
    const ey = Math.exp(y), emy = 1 / ey;
    const coshy = (ey + emy) * 0.5, sinhy = (ey - emy) * 0.5;
    const ex = Math.exp(x);
    const nx = Math.sin(x) * coshy + ex * Math.cos(y) + c[0];
    const ny = Math.cos(x) * sinhy + ex * Math.sin(y) + c[1];
    x = nx; y = ny;
    if (Math.abs(x) > A && Math.abs(y) > A) break;
  }
  return i;
}

module.exports = {
  name: 'pickover-biomorph',
  description: 'sin(z) + e^z + c, AND bailout — filamentous biomorph structure',
  category: 'Julia-native',
  defaultC: [0.2, 0.3],
  // A reasonable default view window in the complex plane. Not universal —
  // different c values can shift where the interesting structure sits.
  defaultDomainHalf: 3,
  iterate
};
