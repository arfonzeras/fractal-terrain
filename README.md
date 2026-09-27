# fractal-terrain

Turn an escape-time fractal formula into an exportable 3D terrain mesh (glTF / OBJ), with **automatic per-formula calibration** instead of hand-tuning gamma and normalization by trial and error.

This grew out of a specific project — a Pickover Biomorph fractal ([contributed to FractalJS](https://github.com/arfonzeras/FractalJS)) turned into a navigable Three.js terrain — generalized into a reusable tool once the same math+calibration+export pipeline proved useful beyond that one shape.

```
formula plugin  →  calibrate()  →  buildMesh()  →  export (glTF / OBJ)
   (you add)         (automatic)      (height +         (drop into
                                        color field)      Blender / Unity /
                                                           Unreal / three.js)
```

## Is this actually a good way to make terrain? Read this first.

Short answer: **not as a general-purpose replacement for Perlin/Simplex noise + fBm**, which is what the games and VFX industry actually uses for terrain, and for good reason — it's cheap (a handful of multiplications and a hash, no loops), predictable, and tileable. An escape-time fractal like this one runs an iteration loop with transcendental functions (`sin`, `cos`, `exp`) per sample. It is **not cheaper** than the industry standard. If you evaluate it live, per-frame, on a GPU (see the "live" note below), it directly competes with your game's other systems for the same frame budget.

Where it *does* have a real, defensible edge:

- **A distinctive, non-generic look.** Escape-time fractals produce filamentous, organic structure that doesn't read as "stock Perlin terrain." Pickover biomorphs in particular.
- **Enormous variety from a tiny parameter.** The `c` constant (two floats) is the entire seed. No heightmap asset, no baked texture — just a formula and two numbers.
- **It's cheap once you bake it.** Run the calculation once, offline, export a static mesh, and the runtime cost is identical to any other mesh of that polygon count. The "expensive" part is a design-time cost you pay once, not a runtime cost you pay every frame.
- **Live parameter mutation is a genuine capability, not an optimization.** Animate `c` and the terrain morphs continuously — something a static heightmap can't do without a from-scratch resample. That's a feature, not a performance trick, and it costs real GPU time to run live (see below).

**Practical recommendation:** use this tool to *generate* terrain assets offline (bake once → static mesh → zero runtime overhead, same as any other exported mesh), and reserve live/in-shader recomputation for specific set-pieces where the live-morphing capability itself is the point — not as your default terrain pipeline.

## What's actually verified here

- Every formula below produces a glTF that passes the official [Khronos glTF-validator](https://github.com/KhronosGroup/glTF-Validator) with **0 errors, 0 warnings** — checked one by one, not assumed from the first one working.
- Each formula's math is ported from an actual source, not written from memory. 10 come from PRs by the same author against [solendil/FractalJS](https://github.com/solendil/FractalJS) (PRs #91–#99, two biomorphs in one PR). The other 8 are the fractals that shipped with the base fork before those PRs (Mandelbrot, Julia, Burning Ship, Burning Bird, Multibrot ×3/×4, Phoenix, Tippetts). As of this writing the upstream maintainer has merged exactly 3 PRs in the project's entire history — all 3 are Dependabot security bumps, none from a human contributor — so rather than wait on that, all 18 fractals live and run in **[arfonzeras/FractalJS](https://github.com/arfonzeras/FractalJS)**, deployed at **[arfonzeras.github.io/FractalJS](https://arfonzeras.github.io/FractalJS/)**. That fork is the source every one of these was fetched and read from directly — not re-typed from recollection.
- The auto-calibration picks *different* gamma per formula/`c` (0.2 to 1.0 across the set below) — it's adapting to each one's real distribution, not applying one hardcoded curve.

## Formulas that ship

All 18 were run through `calibrate()` → `buildMesh()` → `exportGLTF()` → glTF-validator in Node before being listed here "working." The dropdown on the live site groups them the same way this table does — three categories, because the source files split cleanly into two rendering conventions plus two that don't fit an escape-time model at all.

### Julia-native (pixel = z0, c fixed in the source — no adaptation needed)

| Formula | Source | Status |
|---|---|---|
| `pickover-biomorph` | pickover.ts (PR #93) | Works well out of the box |
| `pickover-biomorph-2` | pickover2.ts (PR #93) | Works, but **weak by default** — this `c` escapes almost immediately over most of the domain (max ~8-16 iterations vs. ~50 for the first biomorph). Terrain will look mostly flat. Try other `c` values. |
| `nova-inverse` | novatan.ts (PR #99) | Works very well — best-spread distribution of the whole set (gamma=1, no correction even needed) |
| `julia` | julia.ts (base fork) | Works well — the textbook Julia set |
| `phoenix` | phoenix.ts (base fork) | Works well. Second-order recurrence (uses the previous *two* steps, not one) — the source itself maps the pixel into z0 via a 90° coordinate swap |

### Adapted from Mandelbrot (pixel plays z0 here; originally pixel played c, z0 fixed — see explanation below)

| Formula | Source | Status |
|---|---|---|
| `tricorn-julia` | tricorn.ts (PR #91) | Works, default domain hand-tuned (the original's own preset window showed almost no structure once reinterpreted) |
| `nova-julia` | nova.ts (PR #94) | Works well |
| `magnet1-julia` | magnet1.ts (PR #95) | Works, needed a wider domain than the original's preset (smaller windows were mostly flat/converged) |
| `magnet2-julia` | magnet2.ts (PR #97) | Works, same issue as magnet1, wider domain needed |
| `nova-complex-relax` | novacomplex.ts (PR #98) | Works, but **the naive default was dead — genuinely broken, not just weak**: at c=(0,0) (matching the original's implicit z0), 100% of the sampled domain converges within `iterMax`, i.e. a perfectly flat terrain. Fixed by hand-searching for a `c` that actually varies (0.5, 0) — documented in the file. |
| `mandelbrot-julia` | mandelbrot.ts (base fork) | Works well. Default `c` reuses julia.ts's own (0.285, 0.01) rather than (0,0), which is just a degenerate circle for this map |
| `burning-ship-julia` | burningship.ts (base fork) | Works well after an automated search over a handful of candidate `c` values (see below) |
| `burning-bird-julia` | burningbird.ts (base fork) | Works well, same automated search |
| `multibrot3-julia` | mandelbrot3.ts (base fork) | Works well, same automated search |
| `multibrot4-julia` | mandelbrot4.ts (base fork) | Works well, same automated search |
| `tippetts-julia` | tippetts.ts (base fork) | Works well, same automated search. Source only implements the plain (non-smooth) iteration, so that's all this ports |

### Simplified — convergence fractals, not escape-time

| Formula | Source | Status |
|---|---|---|
| `newton-simplified` | newton.ts (PR #92) | The original is a convergence fractal: it encodes which of 3 roots each point lands on as a large offset (up to ~150), a different scale than a height field. This version keeps only convergence *speed* and drops which root — the 3-basin color structure from the 2D version is gone. Height relief is real, but not the same picture. |
| `secant-simplified` | secant.ts (PR #96) | Same simplification and same caveat as `newton-simplified`. |

**Read this before picking a formula for something that matters.** Several of these needed a real fix after the first attempt came back degenerate or flat — that's the calibration/verification step doing its job, not a reason to distrust the ones that did work on the first try.

### The "Adapted" ones, explained

Tricorn, Nova, Magnet I/II, Nova (Complex Relaxation), Mandelbrot, Burning Ship, Burning Bird, Multibrot ×3/×4, and Tippetts all render in **Mandelbrot convention** in their source: the terrain-sample-equivalent (the pixel) plays the role of the formula's `c`, and the starting point `z0` is fixed. This tool needs the sampled point to be what *varies* across the terrain, the same way `pickover-biomorph`'s pixel is its starting `z0`. So for these eleven, the point sampled across the terrain plays `z0` instead, and what used to be the fixed `z0` is now exposed as this tool's tunable `c`. This is the standard "Julia set" dual of a Mandelbrot-style formula — a known, legitimate technique — but it means **these don't render the same picture as the original sources**. Said plainly in each file's own comment, not just here.

For six of these eleven, there's no well-known "good" Julia `c` the way julia.ts's own 0.285+0.01i is — c=(0,0) is often a degenerate special case (a perfect circle for plain z²+c, for instance), so picking a default by hand for each would mean six more rounds of trial and error. Instead, `c` and domain were picked automatically: a small set of candidate `c` values known to produce rich Julia sets for the z²-family were tried across a few domain sizes, scored by the same mean-to-max ratio `calibrate()` already uses for gamma, and the best-scoring combination kept. Mechanical, not hand-tuned per formula — the code that did it isn't part of the shipped tool (it was a one-off search), but the reasoning and the winning values are recorded in each formula file's own comment.

`nova-inverse` (Nova Inverse / novatan.ts) is the one exception in that group — its own PR comment states it's deliberately Julia-convention already, because rendering it Mandelbrot-style barely shows any structure. No adaptation needed there.

## Quick start

```bash
node cli.js --formula pickover-biomorph --resolution 128 --out ./output --obj
```

This calibrates gamma and the color-normalization range automatically, builds the mesh, and writes `output/pickover-biomorph-0.2-0.3.gltf` (+ `.bin`, + `.obj` if `--obj` is passed).

```
Options:
  --formula <name>       Formula plugin to use (see formulas/)
  --c <x,y>               Complex parameter c (default: formula's defaultC)
  --domain <n>            Half-width of the sampled view window
  --resolution <n>        Grid segments per side (default: 128)
  --heightScale <n>       Vertical scale of the terrain (default: 1.6)
  --smoothPasses <n>      Box-blur passes — raw iteration counts are integers,
                           so neighboring cells can jump sharply without this
  --iterMax <n>           Max escape-time iterations (default: 50)
  --out <dir>             Output directory
  --name <name>           Base filename for exports
  --obj                   Also export a plain .obj (geometry only, no color)
```

**Live in the browser, no install:** [arfonzeras.github.io/fractal-terrain](https://arfonzeras.github.io/fractal-terrain/) runs the exact same `calibrate()`/`buildMesh()` code client-side — pick a formula, tweak `c`, generate, download the `.gltf` straight from the page. Same math as the CLI (the page is built from the same `lib/` and `formulas/` files, not a separate reimplementation — see `site/` and `build-site.js`).

## Adding a new formula

Drop a file in `formulas/`, matching this interface:

```js
module.exports = {
  name: 'my-formula',
  description: 'what it is',
  defaultC: [x, y],
  defaultDomainHalf: 3,       // a reasonable view window to start from
  iterate(cx, cy, c, iterMax) {
    // return the escape-time iteration count (integer, 0..iterMax)
  }
};
```

It's picked up automatically — `node cli.js --formula my-formula` — and `calibrate()` will pick a gamma for it without you tuning anything by hand. **Verify the output actually looks like terrain before trusting it** — some formulas may concentrate their values in ways the current calibration heuristic (matching the mean to roughly the midpoint of the range) doesn't handle well. Check `examples/` for what a working one looks like.

## Why the calibration step exists

Most escape-time formulas concentrate their raw iteration counts near zero over most of the sampled plane — only a thin, interesting boundary region escapes slowly. Feed that straight into a heightmap and you get a nearly-flat, nearly-black terrain; the interesting structure is compressed into a sliver of the value range. `calibrate()` samples the formula, tries a handful of gamma curves, and picks the one that spreads the distribution more evenly — this was done by hand (one Node script, re-run and re-tuned manually) in the original project; here it's automatic and reusable per formula/per `c`.

## Structure

```
formulas/            18 formula plugins, all calibrated + validated (see tables above)
lib/calibrate.js      Auto-calibration (gamma + normalization range)
lib/mesh.js            Height/color field, box-blur smoothing, geometry arrays
lib/export.js          glTF 2.0 and OBJ exporters (zero dependencies)
cli.js                  Command-line entry point
index.html              The live site (GitHub Pages) — generator + Three.js viewer
site/*.gen.js            Browser bundle, AUTO-GENERATED — don't hand-edit
build-site.js            Regenerates site/*.gen.js from lib/ and formulas/
examples/               Pre-generated example outputs at various c values
```

Changed anything in `lib/` or `formulas/`? Run `node build-site.js` before pushing — the live site is a generated build artifact of those, not a hand-maintained copy, and it'll silently drift out of sync otherwise.

## License

MIT — use it, fork it, rip pieces out of it.
