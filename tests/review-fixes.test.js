import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as THREE from '../js/vendor/three.module.js';
import { GameWorld } from '../js/world.js';
import { EntityManager, createForbinModel } from '../js/entities.js';
import { PlayerControls } from '../js/controls.js';
import { GameAudioEngine } from '../js/audio.js';

test('Fix 1: Forbin animation preserves root group world position Y and does not bury NPC', () => {
  const forbin = createForbinModel();
  forbin.position.set(-20, 50.5, 10);

  // Animate while stationary
  forbin.animate(1.0, false);
  assert.strictEqual(forbin.position.y, 50.5, 'Stationary Forbin root Y must not be overwritten');

  // Animate while moving
  forbin.animate(2.0, true);
  assert.strictEqual(forbin.position.y, 50.5, 'Moving Forbin root Y must not be overwritten');
});

test('Fix 2: Forbin NPC remains detectable by player proximity on mountain slope', () => {
  const scene = new THREE.Scene();
  const world = new GameWorld(scene);
  const entities = new EntityManager(scene, world);

  // Run entity animation
  entities.update(0.016, new THREE.Vector3(0, 0, 0), 1.0);

  const forbinChar = entities.characters.get('forbin');
  assert.ok(forbinChar, 'Forbin character must exist');
  assert.ok(forbinChar.group.position.y > 40, `Forbin Y (${forbinChar.group.position.y}) must stay on mountain slope`);

  // Player at Forbin's location with player height offset
  const playerPos = new THREE.Vector3(forbinChar.group.position.x, forbinChar.group.position.y + 1.8, forbinChar.group.position.z);
  const detected = entities.getNearbyCharacter(playerPos, 16);
  assert.ok(detected, 'Forbin must be detected within proximity threshold');
  assert.strictEqual(detected.id, 'forbin');
});

test('Fix 3: Rutherford and Icculus models do not suffer vertical drift', () => {
  const scene = new THREE.Scene();
  const world = new GameWorld(scene);
  const entities = new EntityManager(scene, world);

  const rutherford = entities.characters.get('rutherford');
  const icculus = entities.characters.get('icculus');
  const initialRuthY = rutherford.group.position.y;
  const initialIccY = icculus.group.position.y;

  // Simulate 300 animation frames with variable dt
  for (let t = 0; t < 30; t += 0.1) {
    entities.update(0.1, new THREE.Vector3(), t);
  }

  assert.strictEqual(rutherford.group.position.y, initialRuthY, 'Rutherford root Y must not drift');
  assert.strictEqual(icculus.group.position.y, initialIccY, 'Icculus root Y must not drift');
});

test('Fix 4: Lizard lake ground walking clamps to water surface level', () => {
  const scene = new THREE.Scene();
  const world = new GameWorld(scene);
  const entities = new EntityManager(scene, world);
  const camera = new THREE.PerspectiveCamera();

  const controls = new PlayerControls(camera, null, world, entities);
  controls.setMode('walk');

  // Walk into Lizard Lake basin (-60, 40)
  controls.position.set(-60, 0, 40);
  controls.update(0.016);

  // Player should not submerge 5 units below water surface (waterLevel = 2.0)
  assert.ok(controls.position.y >= 2.0, `Player Y (${controls.position.y}) must be at or above water surface`);
});
