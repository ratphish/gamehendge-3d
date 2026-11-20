import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as THREE from '../js/vendor/three.module.js';
import { GemManager } from '../js/combat/gems.js';

test('Task 6: GemManager spawns gems and assigns correct XP values', () => {
  const scene = new THREE.Scene();
  const gm = new GemManager(scene, null, null);

  gm.spawnGem(0, 0, 0, 'cyan');
  gm.spawnGem(5, 0, 5, 'purple');
  gm.spawnGem(10, 0, 10, 'gold');

  assert.strictEqual(gm.activeGems.length, 3);
  assert.strictEqual(gm.activeGems[0].value, 10);
  assert.strictEqual(gm.activeGems[1].value, 35);
  assert.strictEqual(gm.activeGems[2].value, 100);
});

test('Task 6: Gems remain on ground when distant and magnetize when within pickup radius', () => {
  const scene = new THREE.Scene();
  const gm = new GemManager(scene, null, null);

  gm.spawnGem(15, 0, 0, 'cyan');
  const gem = gm.activeGems[0];
  const playerPos = new THREE.Vector3(0, 0, 0);

  // Magnet radius = 8 (gem is 15 away, should not move)
  gm.update(0.1, playerPos, 8);
  assert.strictEqual(gem.isMagnetized, false);
  assert.strictEqual(gem.pos.x, 15);

  // Magnet radius = 20 (gem is within range, should magnetize and move closer)
  gm.update(0.1, playerPos, 20);
  assert.strictEqual(gem.isMagnetized, true);
  assert.ok(gem.pos.x < 15, 'Gem must move towards player position');
});

test('Task 6: Gem collection delivers XP to player upon reaching contact distance', () => {
  const scene = new THREE.Scene();
  const gm = new GemManager(scene, null, null);

  gm.spawnGem(1, 0, 0, 'cyan'); // close to origin
  const playerPos = new THREE.Vector3(0, 0, 0);

  const xpGained = gm.update(0.1, playerPos, 10);
  assert.strictEqual(xpGained, 10, 'Must return 10 XP upon pickup');
  assert.strictEqual(gm.activeGems.length, 0, 'Gem must be consumed and removed from active list');
});

test('Task 6: magnetizeAll pulls every active gem regardless of distance', () => {
  const scene = new THREE.Scene();
  const gm = new GemManager(scene, null, null);

  gm.spawnGem(50, 0, 0, 'cyan');
  gm.spawnGem(100, 0, 0, 'purple');

  gm.magnetizeAll();
  assert.strictEqual(gm.activeGems[0].isMagnetized, true);
  assert.strictEqual(gm.activeGems[1].isMagnetized, true);
});
