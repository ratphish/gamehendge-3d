import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as THREE from '../js/vendor/three.module.js';
import { CombatFX } from '../js/combat/combat-fx.js';
import { WeaponSystem } from '../js/combat/weapons.js';

test('Task 4: CombatFX tracks and updates floating musical note particles', () => {
  const fx = new CombatFX();
  fx.addMusicalNote(0, 5, 0, '♪');
  fx.addMusicalNote(2, 6, 2, '♫');

  assert.strictEqual(fx.activeNotes.length, 2);
  assert.strictEqual(fx.activeNotes[0].symbol, '♪');

  // Advance time past lifetime (0.8s)
  fx.update(0.9);
  assert.strictEqual(fx.activeNotes.length, 0, 'Musical notes must expire after lifetime');
});

test('Task 4: WeaponSystem creates visual slash ribbon on spear cleave attack', () => {
  const scene = new THREE.Scene();
  const ws = new WeaponSystem(scene, null, null, null);
  ws.equipWeapon('spear');

  // Trigger spear attack
  ws.fireWeapon('spear', 1, new THREE.Vector3(0, 0, 0), 0, []);

  // Check scene contains slash arc group/mesh
  const slashMeshes = [];
  scene.traverse(child => {
    if (child.name === 'slash_ribbon') slashMeshes.push(child);
  });
  assert.ok(slashMeshes.length > 0, 'Spear strike must spawn visual slash ribbon in scene');
});
