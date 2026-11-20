/**
 * Gamehendge 3D Survivor Mode Upgrade Card Drafting System
 */

import { SURVIVOR_CONFIG } from './config-survivor.js';

export class UpgradeManager {
  constructor() {
    this.weapons = SURVIVOR_CONFIG.weapons;
    this.passives = SURVIVOR_CONFIG.passives;
  }

  /**
   * Rolls 3 random upgrade cards based on player's current loadout and limits
   * @param {Map<string, number>} currentWeapons Map of weaponId -> currentLevel (1-8)
   * @param {Map<string, number>} currentPassives Map of passiveId -> currentLevel (1-5)
   * @returns {Array<object>} Array of 3 card descriptors
   */
  rollCardDraft(currentWeapons, currentPassives) {
    const candidates = [];

    const weaponCount = currentWeapons.size;
    const passiveCount = currentPassives.size;

    // 1. Evaluate Weapons
    for (const [id, w] of Object.entries(this.weapons)) {
      const currentLvl = currentWeapons.get(id) || 0;
      if (currentLvl >= w.maxLevel) continue; // Maxed out

      // If player already has this weapon, they can upgrade it
      if (currentLvl > 0) {
        candidates.push({
          type: 'weapon',
          id,
          name: w.name,
          icon: w.icon,
          currentLevel: currentLvl,
          nextLevel: currentLvl + 1,
          desc: `Level ${currentLvl + 1}: Upgrade weapon effectiveness.`,
          rarity: this.rollRarity()
        });
      } else if (weaponCount < 4) {
        // Can discover new weapon if < 4 slots full
        candidates.push({
          type: 'weapon',
          id,
          name: w.name,
          icon: w.icon,
          currentLevel: 0,
          nextLevel: 1,
          desc: `New Weapon: ${w.desc}`,
          rarity: this.rollRarity()
        });
      }
    }

    // 2. Evaluate Passives
    for (const [id, p] of Object.entries(this.passives)) {
      const currentLvl = currentPassives.get(id) || 0;
      if (currentLvl >= p.maxLevel) continue; // Maxed out

      if (currentLvl > 0) {
        candidates.push({
          type: 'passive',
          id,
          name: p.name,
          icon: p.icon,
          currentLevel: currentLvl,
          nextLevel: currentLvl + 1,
          desc: `Level ${currentLvl + 1}: Boost passive stats.`,
          rarity: this.rollRarity()
        });
      } else if (passiveCount < 4) {
        candidates.push({
          type: 'passive',
          id,
          name: p.name,
          icon: p.icon,
          currentLevel: 0,
          nextLevel: 1,
          desc: `New Passive: ${p.desc}`,
          rarity: this.rollRarity()
        });
      }
    }

    // Fallbacks if candidate pool has fewer than 3 items
    const fallbacks = [
      {
        type: 'consumable',
        id: 'rations',
        name: 'Lizard Rations',
        icon: '🍖',
        desc: 'Instantly restores 35 HP.',
        rarity: 'common'
      },
      {
        type: 'consumable',
        id: 'bounty',
        name: "King's Bounty",
        icon: '💰',
        desc: 'Grants an instant burst of 100 Flow XP.',
        rarity: 'rare'
      }
    ];

    // Shuffle candidates
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);

    const result = [];
    for (let i = 0; i < 3; i++) {
      if (shuffled.length > 0) {
        result.push(shuffled.pop());
      } else {
        result.push({ ...fallbacks[i % fallbacks.length] });
      }
    }

    return result;
  }

  rollRarity() {
    const roll = Math.random();
    if (roll < 0.05) return 'legendary';
    if (roll < 0.30) return 'rare';
    return 'common';
  }
}
