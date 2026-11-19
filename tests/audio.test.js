import assert from 'node:assert/strict';
import { test } from 'node:test';
import { noteToFreq, GameAudioEngine } from '../js/audio.js';
import { GAMEHENDGE_CONFIG } from '../js/config.js';

test('Task 2: noteToFreq correctly calculates standard pitch frequencies', () => {
  const a4 = noteToFreq('A4');
  assert.strictEqual(Math.round(a4), 440);

  const c4 = noteToFreq('C4');
  assert.strictEqual(Math.round(c4), 262);

  const a3 = noteToFreq('A3');
  assert.strictEqual(Math.round(a3), 220);

  const d5 = noteToFreq('D5');
  assert.strictEqual(Math.round(d5), 587);
});

test('Task 2: GameAudioEngine determines closest biome theme from player coordinates', () => {
  const engine = new GameAudioEngine();

  // Near Forest (-140, 140)
  const forestTheme = engine.getClosestBiomeTheme(-130, 135);
  assert.strictEqual(forestTheme, 'lizards');

  // Near Castle (140, -140)
  const castleTheme = engine.getClosestBiomeTheme(135, -130);
  assert.strictEqual(castleTheme, 'wilson');

  // Near Mountain (0, 0)
  const mountainTheme = engine.getClosestBiomeTheme(5, -5);
  assert.strictEqual(mountainTheme, 'forbin');

  // Near Ghetto (150, 120)
  const ghettoTheme = engine.getClosestBiomeTheme(145, 115);
  assert.strictEqual(ghettoTheme, 'sloth');
});

test('Task 2: GameAudioEngine state machine handles auto/manual modes and volume', () => {
  const engine = new GameAudioEngine();
  assert.strictEqual(engine.mode, 'auto');
  assert.strictEqual(engine.currentThemeKey, 'lizards');

  engine.setMode('manual');
  assert.strictEqual(engine.mode, 'manual');

  engine.selectTrack('mockingbird');
  assert.strictEqual(engine.currentThemeKey, 'mockingbird');

  engine.setMasterVolume(0.5);
  assert.strictEqual(engine.masterVolume, 0.5);

  const info = engine.getCurrentTrackInfo();
  assert.strictEqual(info.title, 'Fly Famous Mockingbird');
  assert.strictEqual(info.bpm, 136);
});
