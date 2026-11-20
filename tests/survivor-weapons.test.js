import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as THREE from '../js/vendor/three.module.js';
import { WeaponSystem, findNearestEnemies } from '../js/combat/weapons.js';

test('Task 4: findNearestEnemies sorts enemies by distance and respects range limit', () => {
  const playerPos = new THREE.Vector3(0, 0, 0);
  const enemies = [
    { id: 1, pos: new THREE.Vector3(20, 0, 0), isDead: false },
    { id: 2, pos: new THREE.Vector3(5, 0, 0), isDead: false },
    { id: 3, pos: new THREE.Vector3(12, 0, 0), isDead: false },
    { id: 4, pos: new THREE.Vector3(50, 0, 0), isDead: false }, // out of range 30
    { id: 5, pos: new THREE.Vector3(3, 0, 0), isDead: true } // dead, ignore
  ];

  const nearest = findNearestEnemies(playerPos, 30, 2, enemies);
  assert.strictEqual(nearest.length, 2);
  assert.strictEqual(nearest[0].id, 2); // dist 5
  assert.strictEqual(nearest[1].id, 3); // dist 12
});

test('Task 4: WeaponSystem fires equipped weapon on cooldown and spawns projectiles', () => {
  const scene = new THREE.Scene();
  const ws = new WeaponSystem(scene, null, null, null);
  ws.equipWeapon('staff');

  assert.strictEqual(ws.equippedWeapons.has('staff'), true);
  assert.strictEqual(ws.equippedWeapons.get('staff').level, 1);

  const playerPos = new THREE.Vector3(0, 0, 0);
  const enemies = [{ id: 1, pos: new THREE.Vector3(10, 0, 0), hp: 100, isDead: false }];

  // Advance time past cooldown (1.2s)
  ws.update(1.3, playerPos, 0, enemies);
  assert.ok(ws.activeProjectiles.length > 0, 'Must spawn projectile towards enemy');
});

test('Task 4: WeaponSystem applies passive item stat modifiers to damage and cooldown', () => {
  const scene = new THREE.Scene();
  const ws = new WeaponSystem(scene, null, null, null);
  ws.equipWeapon('staff');

  const baseDmg = ws.calculateDamage('staff');
  assert.strictEqual(baseDmg.damage, 26);

  // Equip Trey's Guitar Pick Lv 2 (+30% damage)
  ws.applyPassive('guitar_pick', 2);
  const boostedDmg = ws.calculateDamage('staff');
  assert.strictEqual(boostedDmg.damage, Math.round(26 * 1.30));

  // Equip Mike's Bassline Lv 1 (-10% cooldown)
  ws.applyPassive('bassline', 1);
  const cd = ws.getCooldown('staff');
  assert.ok(cd < 1.2, 'Cooldown must be reduced by bassline');
});

test('Task 4: Orbiting Helping Friendly Runes position around player', () => {
  const scene = new THREE.Scene();
  const ws = new WeaponSystem(scene, null, null, null);
  ws.equipWeapon('runes');

  const playerPos = new THREE.Vector3(10, 5, 10);
  ws.update(0.1, playerPos, 0, []);

  const runeProj = ws.activeProjectiles.filter(p => p.type === 'runes');
  assert.strictEqual(runeProj.length, 2, 'Level 1 runes should have 2 orbiting pages');

  // Verify distance from player matches orbit radius (~3.8)
  for (const r of runeProj) {
    const dist = Math.hypot(r.pos.x - playerPos.x, r.pos.z - playerPos.z);
    assert.ok(Math.abs(dist - 3.8) < 0.2, `Orbit distance ${dist} must match radius`);
  }
});
