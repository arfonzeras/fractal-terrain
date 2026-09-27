'use strict';

/**
 * Samples a formula over its domain and picks a gamma that spreads the
 * resulting values across a usable range, plus the field's actual max
 * (for color/height normalization).
 *
 * This automates what the terreno-3d-jungla project did by hand in a
 * one-off Node script: most escape-time formulas concentrate their raw
 * iteration counts near 0 over most of the plane, so a flat gamma=1 makes
 * the terrain read as nearly flat and nearly black. There's no universal
 * "right" gamma — it depends on how each formula's values are distributed
 * — so this tries a small set of candidates and picks the one whose mean
 * lands closest to the middle of its own range.
 */
function calibrate({ iterate, c, iterMax = 50, domainHalf = 3, sampleRes = 80, gammaCandidates }) {
  gammaCandidates = gammaCandidates || [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.85, 1.0];

  const raw = new Float64Array((sampleRes + 1) * (sampleRes + 1));
  let idx = 0;
  const step = (domainHalf * 2) / sampleRes;
  for (let iy = 0; iy <= sampleRes; iy++) {
    const cy = -domainHalf + iy * step;
    for (let ix = 0; ix <= sampleRes; ix++) {
      const cx = -domainHalf + ix * step;
      raw[idx++] = iterate(cx, cy, c, iterMax) / iterMax; // normalized 0..1
    }
  }

  let best = null;
  for (const gamma of gammaCandidates) {
    let min = Infinity, max = -Infinity, sum = 0;
    for (let i = 0; i < raw.length; i++) {
      const v = Math.pow(raw[i], gamma);
      if (v < min) min = v;
      if (v > max) max = v;
      sum += v;
    }
    const mean = sum / raw.length;
    const ratio = max > 0 ? mean / max : 0;
    const score = Math.abs(ratio - 0.5); // how close mean sits to the midpoint of the range
    if (!best || score < best.score) {
      best = { gamma, min, max, mean, ratio, score };
    }
  }

  return {
    sampleCount: raw.length,
    gamma: best.gamma,
    fieldMax: best.max,
    fieldMin: best.min,
    fieldMean: best.mean,
    meanToMaxRatio: best.ratio,
    triedGammas: gammaCandidates
  };
}

module.exports = { calibrate };
