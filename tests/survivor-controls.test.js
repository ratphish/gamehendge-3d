import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as THREE from '../js/vendor/three.module.js';
import { GameWorld } from '../js/world.js';
import { SurvivorControls } from '../js/combat/survivor-controls.js';

test('Task 7: SurvivorControls initializes with hero stats and updates speed modifiers', () => {
  const scene = new THREE.Scene();
  const world = new GameWorld(scene);
  const camera = new THREE.PerspectiveCamera();
  const controls = new SurvivorControls(camera, null, world);

  assert.strictEqual(controls.selectedHero, 'forbin');
  assert.strictEqual(controls.baseSpeed, 22);

  // Switch to Tela (+20% speed)
  controls.setHero('tela');
  assert.strictEqual(controls.selectedHero, 'tela');
  assert.strictEqual(controls.baseSpeed, Math.round(22 * 1.2));
});

test('Task 7: SurvivorControls clamps position to terrain height and enforces 200m arena boundary', () => {
  const scene = new THREE.Scene();
  const world = new GameWorld(scene);
  const camera = new THREE.PerspectiveCamera();
  const controls = new SurvivorControls(camera, null, world);

  controls.position.set(250, 0, 0); // Beyond 200m arena radius
  controls.update(0.016, 0);

  const distFromCenter = Math.hypot(controls.position.x, controls.position.z);
  assert.ok(distFromCenter <= 201, `Distance ${distFromCenter} must be clamped to arena radius 200`);

  const expectedTerrainY = world.getTerrainHeight(controls.position.x, controls.position.z);
  assert.ok(Math.abs(controls.position.y - (expectedTerrainY + controls.playerHeight)) < 0.2);
});

test('Task 7: Downhill slope-sliding activates on Shift and accelerates velocity', () => {
  const scene = new THREE.Scene();
  const world = new GameWorld(scene);
  const camera = new THREE.PerspectiveCamera();
  const controls = new SurvivorControls(camera, null, world);

  // Place on mountain slope (20, 0) moving downhill away from center (facing positive X)
  controls.position.set(20, 0, 0);
  controls.yaw = -Math.PI / 2; // Facing +X
  controls.keys.forward = true;
  controls.keys.slide = true;

  const result = controls.update(0.1, 0);
  assert.strictEqual(result.isSliding, true, 'isSliding must be true when holding slide key moving downhill');
  assert.ok(result.currentSpeed > controls.baseSpeed, 'Slide speed must exceed normal running speed');
});
