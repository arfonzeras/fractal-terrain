'use strict';
const fs = require('fs');
const path = require('path');

const repoRoot = __dirname;
const formulasDir = path.join(repoRoot, 'formulas');
const formulaFiles = fs.readdirSync(formulasDir).filter(f => f.endsWith('.js')).sort();

let out = '// AUTO-GENERATED from /formulas/*.js by build-site.js — do not hand-edit.\n';
out += 'window.FORMULAS = {};\n';

for (const file of formulaFiles) {
  const name = file.replace(/\.js$/, '');
  let src = fs.readFileSync(path.join(formulasDir, file), 'utf8');
  // Keep the WHOLE file body (preserving any module-level const the
  // iterate function closes over — e.g. pickover's `const A = 10` lives
  // outside iterate() itself). Only swap the CommonJS export for a
  // return, and wrap the whole thing in its own IIFE so each formula's
  // module-level consts (many are named the same across files, like A)
  // don't collide in the shared global scope.
  src = src.replace(/^'use strict';\s*/, '');
  src = src.replace(/module\.exports\s*=\s*(\{[\s\S]*?\});?\s*$/, 'return $1;');
  out += `window.FORMULAS[${JSON.stringify(name)}] = (function(){\n${src}\n})();\n`;
}
fs.mkdirSync(path.join(repoRoot, 'site'), { recursive: true });
fs.writeFileSync(path.join(repoRoot, 'site/formulas.gen.js'), out);

function stripExports(src) {
  return src.replace(/^'use strict';\s*/, '').replace(/module\.exports\s*=\s*\{[^}]*\};?\s*$/, '');
}
const calibrateSrc = stripExports(fs.readFileSync(path.join(repoRoot, 'lib/calibrate.js'), 'utf8'));
const meshSrc = stripExports(fs.readFileSync(path.join(repoRoot, 'lib/mesh.js'), 'utf8'));
fs.writeFileSync(path.join(repoRoot, 'site/lib.gen.js'),
  calibrateSrc + '\n' + meshSrc + '\nwindow.calibrate = calibrate;\nwindow.buildMesh = buildMesh;\n');

console.log('wrote site/formulas.gen.js and site/lib.gen.js');
