import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as THREE from '../js/vendor/three.module.js';
import { calculateTerrainHeight, GameWorld } from '../js/world.js';

test('Task 3: calculateTerrainHeight accurately maps Gamehendge topography', () => {
  // Mountain peak at (0, 0) should be highest point (between 80 and 92)
  const mountainPeak = calculateTerrainHeight(0, 0);
  assert.ok(mountainPeak >= 80 && mountainPeak <= 92, `Mountain height was ${mountainPeak}`);

  // Base of mountain distance drops significantly
  const mountainFlank = calculateTerrainHeight(40, 40);
  assert.ok(mountainFlank < mountainPeak, 'Flank must be lower than peak');

  // Castle plateau at (140, -140) should be elevated (20 to 45)
  const castleHeight = calculateTerrainHeight(140, -140);
  assert.ok(castleHeight >= 20 && castleHeight <= 45, `Castle height was ${castleHeight}`);

  // Lake basin at (-60, 40) should be depressed (<= 2.5)
  const lakeHeight = calculateTerrainHeight(-60, 40);
  assert.ok(lakeHeight <= 2.5, `Lake height was ${lakeHeight}`);

  // Sacred forest at (-140, 140) should be gentle rolling green terrain (5 to 15)
  const forestHeight = calculateTerrainHeight(-140, 140);
  assert.ok(forestHeight >= 5 && forestHeight <= 18, `Forest height was ${forestHeight}`);
});

test('Task 3: GameWorld checks obstacle collision with landmarks', () => {
  const scene = new THREE.Scene();
  const world = new GameWorld(scene);

  // Far open field should not collide
  assert.strictEqual(world.checkCollision(-200, -200, 2), false);

  // Directly inside Wilson's castle walls should trigger collision
  assert.strictEqual(world.checkCollision(140, -140, 2), true);

  // Inside a ghetto building obstacle should trigger collision
  const ghettoCollider = world.colliders.find(c => c.tag === 'ghetto_building');
  assert.ok(ghettoCollider, 'Ghetto collider must be registered');
  assert.strictEqual(world.checkCollision(ghettoCollider.x, ghettoCollider.z, 1), true);
});

test('Task 3: GameWorld populates Three.js scene with terrain mesh and landmarks', () => {
  const scene = new THREE.Scene();
  const world = new GameWorld(scene);

  assert.ok(world.terrainMesh, 'Terrain mesh must exist');
  assert.ok(world.waterMesh, 'Water mesh must exist');
  assert.ok(world.castleGroup, 'Castle group must exist');
  assert.ok(world.forestGroup, 'Forest group must exist');
  assert.ok(world.ghettoGroup, 'Ghetto group must exist');
  assert.ok(world.mountainAltar, 'Mountain altar must exist');

  // Verify elements are attached to the scene
  assert.ok(scene.children.includes(world.terrainMesh));
  assert.ok(scene.children.includes(world.waterMesh));
});
