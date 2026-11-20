import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as THREE from '../js/vendor/three.module.js';
import { CombatFX } from '../js/combat/combat-fx.js';
import { ParticleEngine } from '../js/combat/particles.js';

test('Task 3: CombatFX manages floating damage numbers with spring easing and expiration', () => {
  const fx = new CombatFX();
  fx.addDamageNumber(0, 10, 0, 45, false);
  fx.addDamageNumber(5, 12, 5, 128, true);

  assert.strictEqual(fx.activeNumbers.length, 2, 'Should track 2 active numbers');
  const crit = fx.activeNumbers.find(n => n.isCrit);
  assert.ok(crit, 'Crit damage number must exist');
  assert.strictEqual(crit.value, 128);

  // Advance time past lifetime (0.7s)
  fx.update(0.8);
  assert.strictEqual(fx.activeNumbers.length, 0, 'Numbers must expire and be recycled');
});

test('Task 3: CombatFX screen shake trauma decays exponentially', () => {
  const fx = new CombatFX();
  fx.addScreenShake(1.0);
  assert.strictEqual(fx.trauma, 1.0);

  fx.update(0.1);
  assert.ok(fx.trauma < 1.0, 'Trauma must decay');
  assert.ok(fx.trauma > 0, 'Trauma must remain positive during decay');

  // Advance 1 second
  fx.update(1.0);
  assert.strictEqual(fx.trauma, 0, 'Trauma must fully expire');
});

test('Task 3: ParticleEngine pools particles without unbounded allocation', () => {
  const scene = new THREE.Scene();
  const pe = new ParticleEngine(scene);

  pe.spawnDeathShards(0, 5, 0, 0x00ffff, 15);
  assert.strictEqual(pe.activeCount, 15);

  pe.spawnSlideDust(2, 1, 2, 8);
  assert.strictEqual(pe.activeCount, 23);

  // Advance time past particle lifetime (0.6s)
  pe.update(0.7);
  assert.strictEqual(pe.activeCount, 0, 'Particles must return to pool after expiration');
});
