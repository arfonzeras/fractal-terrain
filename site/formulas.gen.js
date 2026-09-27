// AUTO-GENERATED from /formulas/*.js by build-site.js — do not hand-edit.
window.FORMULAS = {};
window.FORMULAS["magnet1-julia"] = (function(){
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

return {
  name: 'magnet1-julia',
  description: 'Magnet Type I mean-field map, Julia dual (pixel=z0, c fixed — see file comment)',
  defaultC: [0, 0],
  defaultDomainHalf: 6,  // tuned in Node — smaller windows were mostly
                         // converged/flat (ratio 0.72-0.94)
  iterate
};
})();
window.FORMULAS["magnet2-julia"] = (function(){
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

return {
  name: 'magnet2-julia',
  description: 'Magnet Type II mean-field map, Julia dual (pixel=z0, c fixed — see file comment)',
  defaultC: [0, 0],
  defaultDomainHalf: 10,  // tuned in Node — smaller windows were mostly
                          // converged/flat (ratio 0.66-0.67)
  iterate
};
})();
window.FORMULAS["newton-simplified"] = (function(){
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

return {
  name: 'newton-simplified',
  description: 'Newton on z^3-1, convergence speed only (basin/root distinction dropped — see file comment)',
  defaultC: [0, 0],
  defaultDomainHalf: 2,
  iterate
};
})();
window.FORMULAS["nova-complex-relax"] = (function(){
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

return {
  name: 'nova-complex-relax',
  description: 'Nova with complex relaxation R=1+i, Julia dual (pixel=z0, c fixed — see file comment)',
  defaultC: [0.5, 0],   // NOT (0,0): checked in Node first — at c=(0,0) this
                         // is degenerate, 100% of the sampled domain
                         // converges within iterMax (a dead-flat terrain).
                         // (0.5, 0) actually varies (mean/max ratio ~0.5).
  defaultDomainHalf: 4,
  iterate
};
})();
window.FORMULAS["nova-inverse"] = (function(){
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

return {
  name: 'nova-inverse',
  description: 'Newton on cos(z)-1 (= tan(z/2) step) + c — periodic, bead-like chain structure',
  defaultC: [0.3, 0.2],
  defaultDomainHalf: 10,
  iterate
};
})();
window.FORMULAS["nova-julia"] = (function(){
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

return {
  name: 'nova-julia',
  description: 'Newton on z^3-1 + c, Julia dual of Nova (pixel=z0, c fixed — see file comment)',
  defaultC: [0, 0],
  defaultDomainHalf: 2,
  iterate
};
})();
window.FORMULAS["pickover-biomorph-2"] = (function(){
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

return {
  name: 'pickover-biomorph-2',
  description: 'sin(z) + z^2 + c, AND bailout — denser "bract" clustering than the first biomorph',
  defaultC: [-1.0, -1.0],
  defaultDomainHalf: 8,
  iterate
};
})();
window.FORMULAS["pickover-biomorph"] = (function(){
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

return {
  name: 'pickover-biomorph',
  description: 'sin(z) + e^z + c, AND bailout — filamentous biomorph structure',
  defaultC: [0.2, 0.3],
  // A reasonable default view window in the complex plane. Not universal —
  // different c values can shift where the interesting structure sits.
  defaultDomainHalf: 3,
  iterate
};
})();
window.FORMULAS["secant-simplified"] = (function(){
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

return {
  name: 'secant-simplified',
  description: 'Secant method on z^3-1, convergence speed only (basin/root distinction dropped — see file comment)',
  defaultC: [0, 0],
  defaultDomainHalf: 2,
  iterate
};
})();
window.FORMULAS["tricorn-julia"] = (function(){
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

return {
  name: 'tricorn-julia',
  description: 'conj(z)^2 + c, Julia dual of Tricorn/Mandelbar (pixel=z0, c fixed — see file comment)',
  defaultC: [0, 0],
  defaultDomainHalf: 1.8, // tuned in Node: the Mandelbrot preset's w=3.5
                          // showed almost no structure once reinterpreted
                          // as a Julia set — 1.8 is where mean/max lands
                          // near the middle of its range (~0.46)
  iterate
};
})();
