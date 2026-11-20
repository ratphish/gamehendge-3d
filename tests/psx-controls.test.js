import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as THREE from '../js/vendor/three.module.js';
import { SurvivorControls } from '../js/combat/survivor-controls.js';

test('Task 5: SurvivorControls triggers Dodge Dash with burst speed and cooldown', () => {
  const controls = new SurvivorControls(null, null, null);
  assert.strictEqual(controls.isDashing, false);
  assert.strictEqual(controls.dashTimer, 0);

  // Trigger dash
  const didDash = controls.triggerDash();
  assert.strictEqual(didDash, true);
  assert.strictEqual(controls.isDashing, true);
  assert.ok(controls.dashTimer > 0, 'Dash cooldown must start');

  // Immediately trying to dash again must fail due to cooldown
  const secondDash = controls.triggerDash();
  assert.strictEqual(secondDash, false, 'Cannot dash while on cooldown');

  // Update through dash duration (0.25s)
  controls.update(0.3, 0);
  assert.strictEqual(controls.isDashing, false, 'Dash must complete after duration');
  assert.ok(controls.dashTimer > 0, 'Cooldown must still be active after dash ends');

  // Update through remaining cooldown (2.0s)
  controls.update(2.0, 0);
  assert.strictEqual(controls.dashTimer, 0, 'Cooldown must expire to allow dashing again');
  assert.strictEqual(controls.triggerDash(), true, 'Can dash again once cooldown expires');
});

test('Task 5: Telemetry reports isInvulnerable and dashCooldownProgress during dash', () => {
  const controls = new SurvivorControls(null, null, null);
  controls.triggerDash();

  const telem = controls.update(0.1, 0);
  assert.strictEqual(telem.isDashing, true);
  assert.strictEqual(telem.isInvulnerable, true);
  assert.ok(telem.dashCooldownProgress > 0 && telem.dashCooldownProgress <= 1.0);
});
