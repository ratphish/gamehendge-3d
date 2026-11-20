import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  generatePixelGrid,
  PALETTES,
  createTerrainPixels,
  createCobblestonePixels,
  createBarkPixels,
  createPineFoliagePixels,
  createRuinStonePixels,
  createLizardSkinPixels,
  createTweedPixels
} from '../js/graphics/psx-textures.js';

test('Task 1: PALETTES contains retro 8-16 color palettes for PS1 aesthetics', () => {
  assert.ok(Array.isArray(PALETTES.terrain) && PALETTES.terrain.length >= 4);
  assert.ok(Array.isArray(PALETTES.stone) && PALETTES.stone.length >= 4);
  assert.ok(Array.isArray(PALETTES.bark) && PALETTES.bark.length >= 4);
  assert.ok(Array.isArray(PALETTES.lizard) && PALETTES.lizard.length >= 4);
});

test('Task 1: generatePixelGrid produces correct width x height RGBA buffer', () => {
  const w = 32;
  const h = 32;
  const grid = generatePixelGrid(w, h, (x, y) => [255, 0, 128, 255]);

  assert.strictEqual(grid.width, 32);
  assert.strictEqual(grid.height, 32);
  assert.strictEqual(grid.data.length, w * h * 4);
  assert.strictEqual(grid.data[0], 255); // R
  assert.strictEqual(grid.data[1], 0);   // G
  assert.strictEqual(grid.data[2], 128); // B
  assert.strictEqual(grid.data[3], 255); // A
});

test('Task 1: Texture pixel generators return valid 32x32 pixel grids', () => {
  const terrain = createTerrainPixels(32, 32);
  const cobblestone = createCobblestonePixels(32, 32);
  const bark = createBarkPixels(32, 32);
  const foliage = createPineFoliagePixels(32, 32);
  const ruins = createRuinStonePixels(32, 32);
  const lizard = createLizardSkinPixels(32, 32);
  const tweed = createTweedPixels(32, 32, 0x4a6572);

  for (const tex of [terrain, cobblestone, bark, foliage, ruins, lizard, tweed]) {
    assert.strictEqual(tex.width, 32);
    assert.strictEqual(tex.height, 32);
    assert.strictEqual(tex.data.length, 32 * 32 * 4);
    // Ensure not all zeros (has color content)
    const hasColor = tex.data.some((val, idx) => idx % 4 !== 3 && val > 0);
    assert.ok(hasColor, 'Texture must contain valid color pixels');
  }
});
