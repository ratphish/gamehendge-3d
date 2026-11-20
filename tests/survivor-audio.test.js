import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GameAudioEngine } from '../js/audio.js';

test('Task 2: GameAudioEngine supports playCombatSFX across all required combat types', () => {
  const engine = new GameAudioEngine();
  assert.strictEqual(typeof engine.playCombatSFX, 'function', 'playCombatSFX must be a method on GameAudioEngine');

  const validTypes = ['shot', 'hit', 'gem', 'level_up', 'hurt', 'boss_alert', 'slide'];
  for (const t of validTypes) {
    // Should not throw even before user gesture AudioContext is created
    assert.doesNotThrow(() => {
      engine.playCombatSFX(t);
    }, `playCombatSFX('${t}') should execute safely`);
  }
});
