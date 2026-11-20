import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as THREE from '../js/vendor/three.module.js';
import { GameWorld } from '../js/world.js';
import { EnemyManager, Enemy } from '../js/combat/enemies.js';

test('Task 5: Enemy takes damage, flashes, and dies when HP reaches 0', () => {
  const e = new Enemy('soldier', 40, 16, 10, new THREE.Vector3(10, 0, 10), 0xff3366);
  assert.strictEqual(e.isDead, false);

  const survived = e.takeDamage(15, false);
  assert.strictEqual(survived, true);
  assert.strictEqual(e.hp, 25);
  assert.strictEqual(e.flashTimer > 0, true, 'Must trigger hit flash timer');

  const fatal = e.takeDamage(30, true);
  assert.strictEqual(fatal, false);
  assert.strictEqual(e.isDead, true);
  assert.strictEqual(e.hp, 0);
});

test('Task 5: EnemyManager caps active enemies at 60', () => {
  const scene = new THREE.Scene();
  const world = new GameWorld(scene);
  const em = new EnemyManager(scene, world, null, null, null);

  const playerPos = new THREE.Vector3(0, 0, 0);

  // Force spawn 80 enemies
  for (let i = 0; i < 80; i++) {
    em.spawnEnemy(playerPos, 120);
  }

  assert.strictEqual(em.activeEnemies.length, 60, 'Active enemies must be capped at 60');
});

test('Task 5: EnemyManager triggers boss spawns at 05:00 (Hosemaster) and 10:00 (Wilson)', () => {
  const scene = new THREE.Scene();
  const world = new GameWorld(scene);
  const em = new EnemyManager(scene, world, null, null, null);

  const playerPos = new THREE.Vector3(0, 0, 0);

  // At 4:59 (299s), no boss
  em.update(1.0, playerPos, 299);
  assert.strictEqual(em.hosemasterSpawned, false);

  // At 5:00 (300s), Watchful Hosemaster spawns
  em.update(1.0, playerPos, 300);
  assert.strictEqual(em.hosemasterSpawned, true);
  const hosemaster = em.activeEnemies.find(e => e.type === 'hosemaster');
  assert.ok(hosemaster, 'Hosemaster must be in active enemies');
  assert.strictEqual(hosemaster.hp, 3500);

  // At 10:00 (600s), King Wilson spawns
  em.update(1.0, playerPos, 600);
  assert.strictEqual(em.wilsonSpawned, true);
  const wilson = em.activeEnemies.find(e => e.type === 'wilson');
  assert.ok(wilson, 'King Wilson must be in active enemies');
  assert.strictEqual(wilson.hp, 12000);
});

test('Task 5: Enemy AI paths towards player position on update', () => {
  const scene = new THREE.Scene();
  const world = new GameWorld(scene);
  const em = new EnemyManager(scene, world, null, null, null);

  const playerPos = new THREE.Vector3(0, world.getTerrainHeight(0, 0), 0);
  const enemy = new Enemy('soldier', 40, 16, 10, new THREE.Vector3(30, world.getTerrainHeight(30, 0), 0), 0xff3366);
  em.activeEnemies.push(enemy);

  const initialDist = Math.hypot(enemy.pos.x - playerPos.x, enemy.pos.z - playerPos.z);
  em.update(0.5, playerPos, 60);

  const newDist = Math.hypot(enemy.pos.x - playerPos.x, enemy.pos.z - playerPos.z);
  assert.ok(newDist < initialDist, 'Enemy must move closer to player position horizontally');
});
