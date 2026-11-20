import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  SURVIVOR_CONFIG,
  xpNeededForLevel,
  getEnemyScaling
} from '../js/combat/config-survivor.js';
import { UpgradeManager } from '../js/combat/upgrades.js';

test('Task 1: xpNeededForLevel scales smoothly with level', () => {
  assert.strictEqual(xpNeededForLevel(1), 15);
  assert.strictEqual(xpNeededForLevel(2), 38);
  assert.strictEqual(xpNeededForLevel(3), 66);
  assert.strictEqual(xpNeededForLevel(4), 97);
  assert.ok(xpNeededForLevel(10) > xpNeededForLevel(9));
});

test('Task 1: getEnemyScaling scales HP and speed over survival time', () => {
  const atZero = getEnemyScaling(0);
  assert.strictEqual(atZero.hpMult, 1.0);
  assert.strictEqual(atZero.speedMult, 1.0);

  // At 1 minute (60s)
  const at60 = getEnemyScaling(60);
  assert.ok(at60.hpMult > 1.0, 'HP mult must increase at 60s');
  assert.ok(at60.speedMult > 1.0, 'Speed mult must increase at 60s');

  // At 5 minutes (300s)
  const at300 = getEnemyScaling(300);
  assert.ok(at300.hpMult >= 2.0, 'HP mult must double by 5 min');
});

test('Task 1: SURVIVOR_CONFIG defines 7 weapons with 8 levels each and 6 passives with 5 levels', () => {
  const weapons = SURVIVOR_CONFIG.weapons;
  assert.strictEqual(Object.keys(weapons).length, 7);

  for (const [key, w] of Object.entries(weapons)) {
    assert.ok(w.name, `Weapon ${key} must have name`);
    assert.strictEqual(w.maxLevel, 8, `Weapon ${key} must have maxLevel 8`);
    assert.ok(Array.isArray(w.levels) && w.levels.length === 8, `Weapon ${key} must have 8 levels`);
  }

  const passives = SURVIVOR_CONFIG.passives;
  assert.strictEqual(Object.keys(passives).length, 6);
  for (const [key, p] of Object.entries(passives)) {
    assert.ok(p.name, `Passive ${key} must have name`);
    assert.strictEqual(p.maxLevel, 5, `Passive ${key} must have maxLevel 5`);
    assert.ok(Array.isArray(p.levels) && p.levels.length === 5, `Passive ${key} must have 5 levels`);
  }
});

test('Task 1: UpgradeManager card drafting respects inventory limits and rolled count', () => {
  const mgr = new UpgradeManager();

  // Fresh run with only 1 weapon (staff at lv 1) and no passives
  const currentWeapons = new Map([['staff', 1]]);
  const currentPassives = new Map();

  const draft1 = mgr.rollCardDraft(currentWeapons, currentPassives);
  assert.strictEqual(draft1.length, 3, 'Must roll exactly 3 cards');

  // Fill all 4 weapon slots
  const fullWeapons = new Map([
    ['staff', 1],
    ['bow', 1],
    ['spear', 1],
    ['runes', 1]
  ]);
  const draft2 = mgr.rollCardDraft(fullWeapons, currentPassives);
  // Any weapon in draft2 MUST be one of the 4 already owned weapons
  for (const card of draft2) {
    if (card.type === 'weapon') {
      assert.ok(fullWeapons.has(card.id), `Unowned weapon ${card.id} cannot be offered when slots are full`);
    }
  }

  // All 4 weapons maxed out (lv 8) and all 4 passives maxed out (lv 5)
  const maxWeapons = new Map([
    ['staff', 8],
    ['bow', 8],
    ['spear', 8],
    ['runes', 8]
  ]);
  const maxPassives = new Map([
    ['guitar_pick', 5],
    ['bassline', 5],
    ['organ_boost', 5],
    ['doughnut', 5]
  ]);

  const fallbackDraft = mgr.rollCardDraft(maxWeapons, maxPassives);
  assert.strictEqual(fallbackDraft.length, 3);
  for (const card of fallbackDraft) {
    assert.ok(['rations', 'bounty'].includes(card.id), 'Must offer fallback cards when everything is maxed');
  }
});
