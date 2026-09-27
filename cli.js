#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const { calibrate } = require('./lib/calibrate.js');
const { buildMesh } = require('./lib/mesh.js');
const { exportGLTF, exportOBJ } = require('./lib/export.js');

function listFormulas() {
  const dir = path.join(__dirname, 'formulas');
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.js'))
    .map(f => f.replace(/\.js$/, ''));
}

function loadFormula(name) {
  const file = path.join(__dirname, 'formulas', name + '.js');
  if (!fs.existsSync(file)) {
    throw new Error(`Unknown formula "${name}". Available: ${listFormulas().join(', ')}`);
  }
  return require(file);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) {
        args[key] = true;
      } else {
        args[key] = next;
        i++;
      }
    }
  }
  return args;
}

function printHelp() {
  console.log(`
fractal-terrain — turn an escape-time fractal formula into an exportable 3D terrain mesh

Usage:
  node cli.js --formula <name> [options]

Options:
  --formula <name>       Formula plugin to use. Available: ${listFormulas().join(', ')}
  --c <x,y>               Complex parameter c (default: formula's defaultC)
  --domain <n>            Half-width of the sampled view window (default: formula's defaultDomainHalf)
  --resolution <n>        Grid segments per side (default: 128)
  --heightScale <n>       Vertical scale of the terrain (default: 1.6)
  --smoothPasses <n>      Box-blur passes to remove integer-iteration banding (default: 2)
  --iterMax <n>           Max escape-time iterations (default: 50)
  --out <dir>             Output directory (default: ./output)
  --name <name>           Base filename for exports (default: <formula>-<c.x>-<c.y>)
  --obj                   Also export a plain .obj (geometry only)
  --help                  Show this message
`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.formula) { printHelp(); process.exit(args.help ? 0 : 1); }

  const formula = loadFormula(args.formula);
  const c = args.c ? args.c.split(',').map(Number) : formula.defaultC;
  const domainHalf = args.domain ? Number(args.domain) : (formula.defaultDomainHalf || 3);
  const resolution = args.resolution ? Number(args.resolution) : 128;
  const heightScale = args.heightScale ? Number(args.heightScale) : 1.6;
  const smoothPasses = args.smoothPasses ? Number(args.smoothPasses) : 2;
  const iterMax = args.iterMax ? Number(args.iterMax) : 50;
  const outDir = args.out || './output';
  const name = args.name || `${args.formula}-${c[0]}-${c[1]}`;

  console.log(`Calibrating ${args.formula} at c=(${c[0]}, ${c[1]})...`);
  const cal = calibrate({ iterate: formula.iterate, c, iterMax, domainHalf });
  console.log(`  gamma=${cal.gamma}  fieldMax=${cal.fieldMax.toFixed(3)}  mean/max=${cal.meanToMaxRatio.toFixed(2)}`);

  console.log(`Building mesh at resolution ${resolution}...`);
  const mesh = buildMesh({
    iterate: formula.iterate, c, iterMax, domainHalf, resolution,
    gamma: cal.gamma, fieldMax: cal.fieldMax, heightScale, smoothPasses
  });
  console.log(`  ${mesh.positions.length / 3} vertices, ${mesh.indices.length / 3} triangles`);

  const gltfOut = exportGLTF(mesh, outDir, name);
  console.log(`Wrote ${gltfOut.gltf}`);
  console.log(`Wrote ${gltfOut.bin}`);

  if (args.obj) {
    const objOut = exportOBJ(mesh, outDir, name);
    console.log(`Wrote ${objOut.obj}`);
  }
}

main();
