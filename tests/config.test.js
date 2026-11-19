import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GAMEHENDGE_CONFIG } from '../js/config.js';

test('Task 1: GAMEHENDGE_CONFIG has required world bounds', () => {
  assert.ok(GAMEHENDGE_CONFIG.world);
  assert.strictEqual(GAMEHENDGE_CONFIG.world.size, 600);
  assert.strictEqual(GAMEHENDGE_CONFIG.world.minX, -300);
  assert.strictEqual(GAMEHENDGE_CONFIG.world.maxX, 300);
  assert.strictEqual(GAMEHENDGE_CONFIG.world.minZ, -300);
  assert.strictEqual(GAMEHENDGE_CONFIG.world.maxZ, 300);
  assert.strictEqual(GAMEHENDGE_CONFIG.world.boundaryDamping, 280);
});

test('Task 1: GAMEHENDGE_CONFIG has 5 primary biomes/landmarks with coordinates', () => {
  const biomes = GAMEHENDGE_CONFIG.biomes;
  assert.ok(biomes.mountain, 'Mountain must be defined');
  assert.ok(biomes.forest, 'Forest must be defined');
  assert.ok(biomes.ghetto, 'Ghetto must be defined');
  assert.ok(biomes.castle, 'Castle must be defined');
  assert.ok(biomes.lake, 'Lake must be defined');

  assert.deepStrictEqual([biomes.mountain.x, biomes.mountain.z], [0, 0]);
  assert.deepStrictEqual([biomes.forest.x, biomes.forest.z], [-140, 140]);
  assert.deepStrictEqual([biomes.ghetto.x, biomes.ghetto.z], [150, 120]);
  assert.deepStrictEqual([biomes.castle.x, biomes.castle.z], [140, -140]);
  assert.deepStrictEqual([biomes.lake.x, biomes.lake.z], [-60, 40]);
});

test('Task 1: GAMEHENDGE_CONFIG contains 7 character dossier definitions with dialogue & audio stings', () => {
  const characters = GAMEHENDGE_CONFIG.characters;
  const expectedKeys = ['mockingbird', 'forbin', 'sloth', 'rutherford', 'tela', 'wilson', 'icculus'];
  for (const key of expectedKeys) {
    assert.ok(characters[key], `Character ${key} must exist`);
    assert.ok(characters[key].name, `Character ${key} must have name`);
    assert.ok(characters[key].title, `Character ${key} must have title`);
    assert.ok(characters[key].dialogue, `Character ${key} must have dialogue`);
    assert.ok(Array.isArray(characters[key].position), `Character ${key} position must be [x, y, z]`);
  }
});

test('Task 1: GAMEHENDGE_CONFIG defines 5 audio themes with BPM and scale notes', () => {
  const audio = GAMEHENDGE_CONFIG.audio;
  assert.ok(audio.themes);
  const expectedThemes = ['lizards', 'mockingbird', 'sloth', 'wilson', 'forbin'];
  for (const theme of expectedThemes) {
    assert.ok(audio.themes[theme], `Theme ${theme} must exist`);
    assert.ok(audio.themes[theme].title, `Theme ${theme} must have title`);
    assert.ok(audio.themes[theme].bpm, `Theme ${theme} must have BPM`);
    assert.ok(Array.isArray(audio.themes[theme].melody), `Theme ${theme} must have melody array`);
  }
});
