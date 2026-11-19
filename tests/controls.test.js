import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as THREE from '../js/vendor/three.module.js';
import { GameWorld } from '../js/world.js';
import { EntityManager } from '../js/entities.js';
import { PlayerControls } from '../js/controls.js';

test('Task 5: PlayerControls initializes in flight mode and handles mode switching', () => {
  const scene = new THREE.Scene();
  const world = new GameWorld(scene);
  const entities = new EntityManager(scene, world);
  const camera = new THREE.PerspectiveCamera();

  const controls = new PlayerControls(camera, null, world, entities);
  assert.strictEqual(controls.mode, 'flight');
  assert.strictEqual(entities.mockingbirdAvatar.visible, true);
  assert.strictEqual(entities.forbinAvatar.visible, false);

  controls.setMode('walk');
  assert.strictEqual(controls.mode, 'walk');
  assert.strictEqual(entities.mockingbirdAvatar.visible, false);
  assert.strictEqual(entities.forbinAvatar.visible, true);
});

test('Task 5: PlayerControls in walk mode clamps position to terrain height', () => {
  const scene = new THREE.Scene();
  const world = new GameWorld(scene);
  const entities = new EntityManager(scene, world);
  const camera = new THREE.PerspectiveCamera();

  const controls = new PlayerControls(camera, null, world, entities);
  controls.setMode('walk');
  controls.position.set(0, 0, 0); // Mountain peak

  controls.update(0.016);
  const expectedTerrainY = world.getTerrainHeight(0, 0);
  assert.ok(
    Math.abs(controls.position.y - (expectedTerrainY + controls.playerHeight)) < 0.1,
    `Player Y (${controls.position.y}) must clamp to terrain (${expectedTerrainY})`
  );
});

test('Task 5: PlayerControls enforces world boundary damping', () => {
  const scene = new THREE.Scene();
  const world = new GameWorld(scene);
  const entities = new EntityManager(scene, world);
  const camera = new THREE.PerspectiveCamera();

  const controls = new PlayerControls(camera, null, world, entities);
  controls.position.set(350, 50, 0); // Beyond border
  controls.update(0.016);

  assert.ok(controls.position.x <= 285, `Position X (${controls.position.x}) must be clamped within boundary`);
});

test('Task 5: PlayerControls update returns complete telemetry object', () => {
  const scene = new THREE.Scene();
  const world = new GameWorld(scene);
  const entities = new EntityManager(scene, world);
  const camera = new THREE.PerspectiveCamera();

  const controls = new PlayerControls(camera, null, world, entities);
  const telemetry = controls.update(0.016);

  assert.ok(telemetry.position instanceof THREE.Vector3);
  assert.strictEqual(typeof telemetry.heading, 'number');
  assert.strictEqual(typeof telemetry.speed, 'number');
  assert.strictEqual(typeof telemetry.altitude, 'number');
  assert.strictEqual(telemetry.mode, 'flight');
});
