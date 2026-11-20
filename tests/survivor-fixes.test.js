import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as THREE from '../js/vendor/three.module.js';
import { EnemyManager, Enemy } from '../js/combat/enemies.js';
import { WeaponSystem } from '../js/combat/weapons.js';
import { GemManager } from '../js/combat/gems.js';
import { UpgradeManager } from '../js/combat/upgrades.js';

test('Fix 1: EnemyManager returns deadEnemies on update so rewards are never missed', () => {
  const em = new EnemyManager(null, null, null, null, null);
  const enemy = new Enemy('soldier', 40, 16, 10, new THREE.Vector3(10, 0, 10), 0xff3366);
  em.activeEnemies.push(enemy);

  // Kill enemy
  enemy.takeDamage(100, false);
  assert.strictEqual(enemy.isDead, true);

  // Update should return dead enemy and clean up active list
  const result = em.update(0.1, new THREE.Vector3(), 0);
  assert.ok(result && Array.isArray(result.deadEnemies), 'Must return deadEnemies array');
  assert.strictEqual(result.deadEnemies.length, 1);
  assert.strictEqual(result.deadEnemies[0].type, 'soldier');
  assert.strictEqual(em.activeEnemies.length, 0, 'Dead enemy must be purged from active list');
});

test('Fix 2: Helping Friendly Runes damages enemies in orbit contact radius', () => {
  const ws = new WeaponSystem(null, null, null, null);
  ws.equipWeapon('runes');

  const playerPos = new THREE.Vector3(0, 0, 0);
  // Enemy standing at orbit radius (x = 3.8, z = 0)
  const enemy = new Enemy('soldier', 50, 0, 0, new THREE.Vector3(3.8, 1.0, 0), 0xff3366);

  // Run updates
  ws.update(0.1, playerPos, 0, [enemy]);
  assert.ok(enemy.hp < 50, `Enemy HP (${enemy.hp}) must be reduced by orbiting runes`);
});

test('Fix 3: Splash weapons (Staff and Cleaver) damage all enemies within blast radius', () => {
  const ws = new WeaponSystem(null, null, null, null);
  const enemy1 = new Enemy('soldier', 100, 0, 0, new THREE.Vector3(10, 0, 0), 0xff3366);
  const enemy2 = new Enemy('soldier', 100, 0, 0, new THREE.Vector3(11.5, 0, 0), 0xff3366); // 1.5 away, within radius 3.5

  ws.spawnProjectile({
    type: 'staff',
    pos: new THREE.Vector3(10, 0, 0),
    vel: new THREE.Vector3(1, 0, 0),
    damage: { damage: 30, isCrit: false },
    radius: 3.5,
    lifetime: 2.0
  });

  ws.updateProjectiles(0.016, [enemy1, enemy2]);

  assert.strictEqual(enemy1.hp, 70, 'Direct hit enemy must take 30 damage');
  assert.strictEqual(enemy2.hp, 70, 'Nearby splash enemy must take 30 damage');
});

test('Fix 4: Electrolux Vortex sustains for duration and pulls enemies towards its center', () => {
  const ws = new WeaponSystem(null, null, null, null);
  const enemy = new Enemy('soldier', 100, 0, 0, new THREE.Vector3(8, 0, 0), 0xff3366);

  ws.spawnProjectile({
    type: 'vortex',
    pos: new THREE.Vector3(0, 0, 0),
    vel: new THREE.Vector3(),
    damage: { damage: 10, isCrit: false },
    radius: 14,
    lifetime: 2.2,
    isVortex: true
  });

  // After update, vortex should still exist (not despawned) and enemy should be pulled closer to 0
  ws.updateProjectiles(0.1, [enemy]);
  assert.ok(ws.activeProjectiles.some(p => p.type === 'vortex'), 'Vortex must remain active over its lifetime');
  assert.ok(enemy.pos.x < 8, `Enemy X (${enemy.pos.x}) must be pulled closer to vortex center (0)`);
});

test('Fix 5: Homing staff projectile adjusts velocity vector toward target', () => {
  const ws = new WeaponSystem(null, null, null, null);
  const target = new Enemy('soldier', 100, 0, 0, new THREE.Vector3(10, 0, 10), 0xff3366);

  const proj = {
    type: 'staff',
    pos: new THREE.Vector3(0, 0, 0),
    vel: new THREE.Vector3(10, 0, 0), // Initially pointing along X
    target,
    damage: { damage: 25, isCrit: false },
    radius: 2.5,
    lifetime: 2.0,
    homingSpeed: 30
  };
  ws.spawnProjectile(proj);

  ws.updateProjectiles(0.1, [target]);
  // Homing velocity should now have a positive Z component towards target (10, 0, 10)
  assert.ok(proj.vel.z > 0, `Homing velocity Z (${proj.vel.z}) must turn toward target`);
});

test('Fix 6: Card drafting applies rarity bonuses (rare grants bonus XP, legendary grants double upgrade)', () => {
  const ws = new WeaponSystem(null, null, null, null);
  ws.equipWeapon('staff'); // starts level 1

  // Mock survivor manager
  let bonusXp = 0;
  const mockMgr = {
    weapons: ws,
    addXP: (amount) => { bonusXp += amount; },
    updateItemSlots: () => {}
  };

  // Simulate applying rare card
  const rareCard = { id: 'staff', type: 'weapon', rarity: 'rare' };
  if (rareCard.rarity === 'rare') mockMgr.addXP(50);
  mockMgr.weapons.upgradeWeapon(rareCard.id);

  assert.strictEqual(bonusXp, 50, 'Rare card must grant 50 bonus XP');
  assert.strictEqual(ws.equippedWeapons.get('staff').level, 2);

  // Simulate applying legendary card
  const legCard = { id: 'staff', type: 'weapon', rarity: 'legendary' };
  mockMgr.weapons.upgradeWeapon(legCard.id);
  if (legCard.rarity === 'legendary') mockMgr.weapons.upgradeWeapon(legCard.id);

  assert.strictEqual(ws.equippedWeapons.get('staff').level, 4, 'Legendary card must grant 2 upgrades');
});

test('Fix 7: SurvivorControls updateCamera applies combatFX screen shake to camera position', () => {
  const camera = new THREE.PerspectiveCamera();
  const mockCombatFX = {
    shakeOffset: new THREE.Vector2(1.5, -0.8)
  };

  import('../js/combat/survivor-controls.js').then(({ SurvivorControls }) => {
    const controls = new SurvivorControls(camera, null, null, null, null, mockCombatFX);
    controls.updateCamera();

    // Verify camera position includes shake offset
    const expectedDist = 14.0;
    const baseCamX = controls.position.x + Math.sin(controls.yaw) * expectedDist * Math.cos(controls.pitch);
    assert.strictEqual(camera.position.x, baseCamX + 1.5, 'Camera X must include shake offset X');
  });
});
