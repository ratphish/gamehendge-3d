import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as THREE from '../js/vendor/three.module.js';
import { GameWorld } from '../js/world.js';

test('Task 3: GameWorld populates arena with trees, ruins, and braziers in survivor radius', () => {
  const scene = new THREE.Scene();
  const world = new GameWorld(scene);

  // Check arena props group
  assert.ok(world.arenaPropsGroup, 'world.arenaPropsGroup must exist');
  assert.ok(world.arenaPropsGroup.children.length >= 25, 'Arena must contain at least 25 props (trees, stones, braziers)');

  // Verify braziers have dynamic point lights
  const lights = [];
  world.arenaPropsGroup.traverse(child => {
    if (child.isPointLight) lights.push(child);
  });
  assert.ok(lights.length >= 4, 'Must have at least 4 torch/brazier point lights for atmosphere');
});

test('Task 3: GameWorld updates flickering braziers on update loop', () => {
  const scene = new THREE.Scene();
  const world = new GameWorld(scene);

  const initialIntensities = [];
  world.arenaPropsGroup.traverse(child => {
    if (child.isPointLight) initialIntensities.push(child.intensity);
  });

  world.update(1.5);

  const newIntensities = [];
  world.arenaPropsGroup.traverse(child => {
    if (child.isPointLight) newIntensities.push(child.intensity);
  });

  assert.strictEqual(initialIntensities.length, newIntensities.length);
  // Point lights must flicker (change intensity) over time
  const hasFlickered = newIntensities.some((val, idx) => Math.abs(val - initialIntensities[idx]) > 0.001);
  assert.ok(hasFlickered, 'Brazier lights must flicker dynamically with time');
});
