'use strict';
const fs = require('fs');
const path = require('path');

/**
 * Writes a minimal, spec-valid glTF 2.0 asset (separate .gltf JSON + .bin)
 * with POSITION, COLOR_0 and indices — no external dependencies. Imports
 * cleanly into Blender, Unity (via a glTF importer), Unreal, and Three.js.
 */
function exportGLTF(mesh, outDir, baseName) {
  const { positions, colors, indices } = mesh;
  const vertCount = positions.length / 3;

  const idxArray = new Uint32Array(indices);

  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i], y = positions[i + 1], z = positions[i + 2];
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
    if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
  }

  const posBuf = Buffer.from(positions.buffer, positions.byteOffset, positions.byteLength);
  const colBuf = Buffer.from(colors.buffer, colors.byteOffset, colors.byteLength);
  const idxBuf = Buffer.from(idxArray.buffer, idxArray.byteOffset, idxArray.byteLength);
  const binBuffer = Buffer.concat([posBuf, colBuf, idxBuf]);

  const gltf = {
    asset: { version: '2.0', generator: 'fractal-terrain (hand-written exporter)' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: baseName }],
    meshes: [{
      name: baseName,
      primitives: [{
        attributes: { POSITION: 0, COLOR_0: 1 },
        indices: 2,
        mode: 4 // TRIANGLES
      }]
    }],
    buffers: [{ uri: baseName + '.bin', byteLength: binBuffer.length }],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: posBuf.length, target: 34962 },
      { buffer: 0, byteOffset: posBuf.length, byteLength: colBuf.length, target: 34962 },
      { buffer: 0, byteOffset: posBuf.length + colBuf.length, byteLength: idxBuf.length, target: 34963 }
    ],
    accessors: [
      { bufferView: 0, componentType: 5126, count: vertCount, type: 'VEC3', min: [minX, minY, minZ], max: [maxX, maxY, maxZ] },
      { bufferView: 1, componentType: 5126, count: vertCount, type: 'VEC3' },
      { bufferView: 2, componentType: 5125, count: idxArray.length, type: 'SCALAR' }
    ]
  };

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, baseName + '.gltf'), JSON.stringify(gltf, null, 2));
  fs.writeFileSync(path.join(outDir, baseName + '.bin'), binBuffer);
  return {
    gltf: path.join(outDir, baseName + '.gltf'),
    bin: path.join(outDir, baseName + '.bin')
  };
}

/**
 * Plain OBJ export — geometry only (no vertex color; OBJ's vertex-color
 * extension isn't reliably supported across tools). Useful as a safe
 * fallback for pipelines that don't want glTF.
 */
function exportOBJ(mesh, outDir, baseName) {
  const { positions, indices } = mesh;
  const lines = ['# exported by fractal-terrain'];
  for (let i = 0; i < positions.length; i += 3) {
    lines.push(`v ${positions[i]} ${positions[i + 1]} ${positions[i + 2]}`);
  }
  for (let i = 0; i < indices.length; i += 3) {
    // OBJ face indices are 1-based
    lines.push(`f ${indices[i] + 1} ${indices[i + 1] + 1} ${indices[i + 2] + 1}`);
  }
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, baseName + '.obj');
  fs.writeFileSync(outPath, lines.join('\n'));
  return { obj: outPath };
}

module.exports = { exportGLTF, exportOBJ };
