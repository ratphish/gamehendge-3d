import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as THREE from '../js/vendor/three.module.js';
import {
  PSX_CONFIG,
  applyPSXVertexJitter,
  BAYER_4X4,
  computeInternalResolution
} from '../js/graphics/psx-renderer.js';

test('Task 2: PSX_CONFIG defines low-res target and snapping resolution', () => {
  assert.strictEqual(PSX_CONFIG.baseWidth, 320);
  assert.strictEqual(PSX_CONFIG.baseHeight, 240);
  assert.ok(PSX_CONFIG.snapX > 0 && PSX_CONFIG.snapY > 0);
});

test('Task 2: BAYER_4X4 contains valid normalized 16-element dither thresholds', () => {
  assert.strictEqual(BAYER_4X4.length, 16);
  assert.strictEqual(BAYER_4X4[0], 0.0 / 16.0);
  assert.strictEqual(BAYER_4X4[12], 15.0 / 16.0);
  for (const v of BAYER_4X4) {
    assert.ok(v >= 0.0 && v < 1.0);
  }
});

test('Task 2: computeInternalResolution maintains 4:3 or 16:9 retro aspect ratios', () => {
  const res43 = computeInternalResolution(800, 600); // 4:3 window
  assert.strictEqual(res43.width, 320);
  assert.strictEqual(res43.height, 240);

  const res169 = computeInternalResolution(1920, 1080); // 16:9 window
  assert.strictEqual(res169.width, 384);
  assert.strictEqual(res169.height, 216);
});

test('Task 2: applyPSXVertexJitter attaches onBeforeCompile hook to Three.js materials', () => {
  const mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  applyPSXVertexJitter(mat, 160, 120);

  assert.ok(typeof mat.onBeforeCompile === 'function', 'Material must have onBeforeCompile hook');

  // Verify hook modifies shader code
  const dummyShader = {
    vertexShader: `
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `
  };
  mat.onBeforeCompile(dummyShader);
  assert.ok(dummyShader.vertexShader.includes('floor('), 'Vertex shader must include vertex snapping logic');
});
