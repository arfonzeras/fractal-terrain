'use strict';

/**
 * Tricorn (Mandelbar) — z(n+1) = conj(z(n))^2 + c.
 * Ported from tricorn.ts (open PR #91 on solendil/FractalJS, not merged).
 *
 * ADAPTED, not a direct port: the original renders in Mandelbrot
 * convention (pixel = c, z0 fixed at 0). This tool needs "the terrain
 * sample point" to be the thing that varies across the plane, so this
 * version runs the Julia dual instead: pixel = z0 (varies across the
 * terrain), c = a fixed constant (now exposed as this tool's tunable
 * parameter, defaulting to 0 — the original's fixed z0 value). This is a
 * deliberate, disclosed reinterpretation, not the same picture the
 * original PR renders.
 */

const escape = 4;

function iterate(cx, cy, c, iterMax) {
  let znx = cx, zny = cy, i = 0;
  let sqx = znx * znx, sqy = zny * zny;
  for (; i < iterMax && sqx + sqy <= escape; i++) {
    zny = -(znx + znx) * zny + c[1];
    znx = sqx - sqy + c[0];
    sqx = znx * znx;
    sqy = zny * zny;
  }
  return i;
}

module.exports = {
  name: 'tricorn-julia',
  description: 'conj(z)^2 + c, Julia dual of Tricorn/Mandelbar (pixel=z0, c fixed — see file comment)',
  category: 'Adapted from Mandelbrot',
  defaultC: [0, 0],
  defaultDomainHalf: 1.8, // tuned in Node: the Mandelbrot preset's w=3.5
                          // showed almost no structure once reinterpreted
                          // as a Julia set — 1.8 is where mean/max lands
                          // near the middle of its range (~0.46)
  iterate
};
