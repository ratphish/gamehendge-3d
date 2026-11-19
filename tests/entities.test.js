import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as THREE from '../js/vendor/three.module.js';
import { GameWorld } from '../js/world.js';
import { EntityManager } from '../js/entities.js';

test('Task 4: EntityManager spawns all 7 characters at designated locations', () => {
  const scene = new THREE.Scene();
  const world = new GameWorld(scene);
  const manager = new EntityManager(scene, world);

  const expectedIds = ['mockingbird', 'forbin', 'sloth', 'rutherford', 'tela', 'wilson', 'icculus'];
  for (const id of expectedIds) {
    const char = manager.characters.get(id);
    assert.ok(char, `Character ${id} must exist in EntityManager`);
    assert.ok(char.group && char.group.isGroup, `Character ${id} must have a THREE.Group`);
    assert.ok(scene.children.includes(char.group), `Character ${id} group must be added to scene`);
  }
});

test('Task 4: EntityManager detects nearby characters within proximity threshold', () => {
  const scene = new THREE.Scene();
  const world = new GameWorld(scene);
  const manager = new EntityManager(scene, world);

  // Near Sloth in Ghetto (145, 5, 115)
  const nearSloth = new THREE.Vector3(146, 5, 116);
  const slothResult = manager.getNearbyCharacter(nearSloth, 15);
  assert.ok(slothResult, 'Must detect character nearby');
  assert.strictEqual(slothResult.id, 'sloth');

  // Near Icculus on mountain peak (0, 92, 0)
  const nearIcculus = new THREE.Vector3(1, 92, 1);
  const icculusResult = manager.getNearbyCharacter(nearIcculus, 15);
  assert.ok(icculusResult, 'Must detect Icculus nearby');
  assert.strictEqual(icculusResult.id, 'icculus');

  // Open ocean / field with no one around
  const emptySpot = new THREE.Vector3(-250, 10, -250);
  assert.strictEqual(manager.getNearbyCharacter(emptySpot, 15), null);
});

test('Task 4: EntityManager creates playable Mockingbird and Forbin avatars with animation joints', () => {
  const scene = new THREE.Scene();
  const world = new GameWorld(scene);
  const manager = new EntityManager(scene, world);

  assert.ok(manager.mockingbirdAvatar, 'Mockingbird avatar must exist');
  assert.ok(manager.mockingbirdAvatar.leftWing, 'Mockingbird must have left wing');
  assert.ok(manager.mockingbirdAvatar.rightWing, 'Mockingbird must have right wing');

  assert.ok(manager.forbinAvatar, 'Forbin avatar must exist');
  assert.ok(manager.forbinAvatar.leftLeg, 'Forbin must have left leg');
  assert.ok(manager.forbinAvatar.rightLeg, 'Forbin must have right leg');
});
