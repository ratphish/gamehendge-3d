/**
 * Gamehendge 3D Survivor Mode Configuration & Formulas
 */

export function xpNeededForLevel(level) {
  return Math.floor(15 * Math.pow(level, 1.35));
}

export function getEnemyScaling(elapsedSec) {
  const hpMult = 1.0 + 0.12 * Math.floor(elapsedSec / 30);
  const speedMult = Math.min(1.4, 1.0 + 0.03 * Math.floor(elapsedSec / 60));
  return { hpMult, speedMult };
}

export const SURVIVOR_CONFIG = {
  arena: {
    radius: 200,
    spawnMinDist: 38,
    spawnMaxDist: 55,
    maxActiveEnemies: 60
  },

  player: {
    baseHp: 100,
    baseSpeed: 22,
    slideSpeed: 46,
    invulnDuration: 0.5,
    contactDamageCooldown: 0.5
  },

  gems: {
    cyan: { value: 10, color: 0x00f0ff },
    purple: { value: 35, color: 0xbd00ff },
    gold: { value: 100, color: 0xffd700 }
  },

  heroes: {
    forbin: {
      id: 'forbin',
      name: 'Colonel Forbin',
      title: 'The Long Island Pilgrim',
      startingWeapon: 'staff',
      bonusMagnet: 0.4,
      bonusRegen: 1.5,
      hp: 100,
      color: 0x5294e2,
      desc: '+40% XP Magnet Radius & +1.5 HP/sec Regen.'
    },
    tela: {
      id: 'tela',
      name: 'Tela',
      title: 'Rebel of the Forest',
      startingWeapon: 'bow',
      bonusSpeed: 0.2,
      bonusSlide: 0.45,
      hp: 100,
      color: 0xe91e63,
      desc: '+20% Move Speed & +45% Slope Slide Speed.'
    },
    rutherford: {
      id: 'rutherford',
      name: 'Rutherford the Brave',
      title: 'Knight of the Lizards',
      startingWeapon: 'spear',
      bonusHp: 60,
      armor: 5,
      bonusKnockback: 0.35,
      hp: 160,
      color: 0x9013fe,
      desc: '+60 Max HP, 5 Flat Armor & +35% Melee Knockback.'
    },
    mockingbird: {
      id: 'mockingbird',
      name: 'The Famous Mockingbird',
      title: 'Sacred Aviary Courier',
      startingWeapon: 'lightning',
      bonusAttackSpeed: 0.15,
      lowGravity: true,
      hp: 90,
      color: 0x50e3c2,
      desc: 'Featherfall Glide Jump & +15% Weapon Attack Speed.'
    }
  },

  weapons: {
    staff: {
      id: 'staff',
      name: 'Pilgrim Staff',
      desc: 'Launches homing holy energy orbs with explosive blast.',
      icon: '✨',
      maxLevel: 8,
      levels: [
        { damage: 26, cooldown: 1.2, orbs: 1, radius: 2.5, speed: 32 },
        { damage: 32, cooldown: 1.2, orbs: 1, radius: 2.5, speed: 32 },
        { damage: 32, cooldown: 1.2, orbs: 2, radius: 2.8, speed: 34 },
        { damage: 40, cooldown: 1.1, orbs: 2, radius: 2.8, speed: 34 },
        { damage: 40, cooldown: 1.1, orbs: 3, radius: 3.2, speed: 36 },
        { damage: 50, cooldown: 1.0, orbs: 3, radius: 3.2, speed: 36 },
        { damage: 50, cooldown: 1.0, orbs: 4, radius: 3.6, speed: 38 },
        { damage: 65, cooldown: 0.9, orbs: 5, radius: 4.0, speed: 40 }
      ]
    },
    bow: {
      id: 'bow',
      name: 'Rebel Recurve Bow',
      desc: 'Fires high-velocity piercing arrows at oncoming foes.',
      icon: '🏹',
      maxLevel: 8,
      levels: [
        { damage: 18, cooldown: 0.8, arrows: 1, pierce: 3, speed: 52 },
        { damage: 22, cooldown: 0.74, arrows: 1, pierce: 4, speed: 52 },
        { damage: 22, cooldown: 0.68, arrows: 2, pierce: 4, speed: 54 },
        { damage: 28, cooldown: 0.62, arrows: 2, pierce: 5, speed: 54 },
        { damage: 28, cooldown: 0.56, arrows: 2, pierce: 6, speed: 56 },
        { damage: 35, cooldown: 0.50, arrows: 3, pierce: 6, speed: 56 },
        { damage: 42, cooldown: 0.44, arrows: 3, pierce: 7, speed: 58 },
        { damage: 50, cooldown: 0.38, arrows: 4, pierce: 8, speed: 60 }
      ]
    },
    spear: {
      id: 'spear',
      name: 'Whirlwind Spear',
      desc: 'Spins in a rapid 360-degree sweep dealing high knockback.',
      icon: '🗡️',
      maxLevel: 8,
      levels: [
        { damage: 36, cooldown: 1.4, radius: 7.0, knockback: 14 },
        { damage: 44, cooldown: 1.3, radius: 7.8, knockback: 15 },
        { damage: 54, cooldown: 1.2, radius: 8.6, knockback: 16 },
        { damage: 66, cooldown: 1.1, radius: 9.4, knockback: 17 },
        { damage: 80, cooldown: 1.0, radius: 10.2, knockback: 18 },
        { damage: 96, cooldown: 0.9, radius: 11.0, knockback: 19 },
        { damage: 115, cooldown: 0.85, radius: 11.8, knockback: 20 },
        { damage: 140, cooldown: 0.75, radius: 13.0, knockback: 22 }
      ]
    },
    runes: {
      id: 'runes',
      name: 'Helping Friendly Runes',
      desc: 'Ancient glowing book pages orbit the player like a buzzsaw.',
      icon: '📖',
      maxLevel: 8,
      levels: [
        { damage: 16, runes: 2, radius: 3.8, speed: 2.8 },
        { damage: 20, runes: 2, radius: 4.1, speed: 3.0 },
        { damage: 20, runes: 3, radius: 4.4, speed: 3.2 },
        { damage: 25, runes: 3, radius: 4.7, speed: 3.4 },
        { damage: 25, runes: 4, radius: 5.0, speed: 3.6 },
        { damage: 32, runes: 4, radius: 5.3, speed: 3.8 },
        { damage: 32, runes: 5, radius: 5.6, speed: 4.0 },
        { damage: 42, runes: 6, radius: 6.0, speed: 4.5 }
      ]
    },
    lightning: {
      id: 'lightning',
      name: 'Divided Sky Lightning',
      desc: 'Calls down thunderbolts that chain between clusters of foes.',
      icon: '⚡',
      maxLevel: 8,
      levels: [
        { damage: 55, cooldown: 2.2, chains: 2 },
        { damage: 70, cooldown: 2.05, chains: 2 },
        { damage: 70, cooldown: 1.9, chains: 3 },
        { damage: 90, cooldown: 1.75, chains: 3 },
        { damage: 110, cooldown: 1.6, chains: 4 },
        { damage: 135, cooldown: 1.45, chains: 4 },
        { damage: 160, cooldown: 1.3, chains: 5 },
        { damage: 200, cooldown: 1.15, chains: 6 }
      ]
    },
    vortex: {
      id: 'vortex',
      name: 'Electrolux Vortex',
      desc: 'Creates a mini vacuum vortex that pulls enemies and gathers all XP gems.',
      icon: '🌀',
      maxLevel: 8,
      levels: [
        { dps: 22, cooldown: 6.0, duration: 2.2, radius: 14 },
        { dps: 28, cooldown: 5.6, duration: 2.5, radius: 15 },
        { dps: 35, cooldown: 5.2, duration: 2.8, radius: 16 },
        { dps: 42, cooldown: 4.8, duration: 3.1, radius: 17 },
        { dps: 50, cooldown: 4.4, duration: 3.4, radius: 18 },
        { dps: 60, cooldown: 4.0, duration: 3.7, radius: 19 },
        { dps: 72, cooldown: 3.6, duration: 4.0, radius: 20 },
        { dps: 90, cooldown: 3.0, duration: 4.5, radius: 22 }
      ]
    },
    cleaver: {
      id: 'cleaver',
      name: "The Sloth's Cleaver",
      desc: 'Hurls heavy rotating cleavers in high parabolic arcs with splash damage.',
      icon: '🪓',
      maxLevel: 8,
      levels: [
        { damage: 80, cooldown: 2.6, cleavers: 1, radius: 5.5 },
        { damage: 100, cooldown: 2.4, cleavers: 1, radius: 6.0 },
        { damage: 125, cooldown: 2.2, cleavers: 1, radius: 6.5 },
        { damage: 125, cooldown: 2.0, cleavers: 2, radius: 7.0 },
        { damage: 155, cooldown: 1.9, cleavers: 2, radius: 7.5 },
        { damage: 190, cooldown: 1.8, cleavers: 2, radius: 8.0 },
        { damage: 190, cooldown: 1.7, cleavers: 3, radius: 8.5 },
        { damage: 250, cooldown: 1.5, cleavers: 3, radius: 9.5 }
      ]
    }
  },

  passives: {
    guitar_pick: {
      id: 'guitar_pick',
      name: "Trey's Guitar Pick",
      desc: 'Infuses attacks with raw tone (+15% Damage per level).',
      icon: '🎸',
      maxLevel: 5,
      levels: [
        { damageMult: 0.15 },
        { damageMult: 0.30 },
        { damageMult: 0.45 },
        { damageMult: 0.60 },
        { damageMult: 0.75 }
      ]
    },
    bassline: {
      id: 'bassline',
      name: "Mike's Bassline",
      desc: 'Locks in the groove (-10% Weapon Cooldown per level).',
      icon: '🔊',
      maxLevel: 5,
      levels: [
        { cdr: 0.10 },
        { cdr: 0.18 },
        { cdr: 0.26 },
        { cdr: 0.34 },
        { cdr: 0.42 }
      ]
    },
    organ_boost: {
      id: 'organ_boost',
      name: "Page's Organ Boost",
      desc: 'Rich polyphony (+1 Projectile at Lv 1, 3, 5).',
      icon: '🎹',
      maxLevel: 5,
      levels: [
        { extraProjectiles: 1 },
        { extraProjectiles: 1 },
        { extraProjectiles: 2 },
        { extraProjectiles: 2 },
        { extraProjectiles: 3 }
      ]
    },
    doughnut: {
      id: 'doughnut',
      name: "Fishman's Doughnut",
      desc: 'Pure rhythm agility (+12% Move & Slide Speed per level).',
      icon: '⭕',
      maxLevel: 5,
      levels: [
        { speedMult: 0.12 },
        { speedMult: 0.24 },
        { speedMult: 0.36 },
        { speedMult: 0.48 },
        { speedMult: 0.60 }
      ]
    },
    lizard_heart: {
      id: 'lizard_heart',
      name: 'Lizard Heart',
      desc: 'Vitality of the ancient reptiles (+30 Max HP & +1 HP/sec per level).',
      icon: '💚',
      maxLevel: 5,
      levels: [
        { maxHp: 30, regen: 1.0 },
        { maxHp: 60, regen: 2.0 },
        { maxHp: 90, regen: 3.0 },
        { maxHp: 120, regen: 4.0 },
        { maxHp: 150, regen: 5.0 }
      ]
    },
    icculus_glasses: {
      id: 'icculus_glasses',
      name: "Icculus's Glasses",
      desc: 'See the sacred flow (+12% Critical Hit Chance per level).',
      icon: '👓',
      maxLevel: 5,
      levels: [
        { critChance: 0.12 },
        { critChance: 0.24 },
        { critChance: 0.36 },
        { critChance: 0.48 },
        { critChance: 0.60 }
      ]
    }
  }
};
