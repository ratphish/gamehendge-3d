/**
 * Gamehendge 3D Survivor Mode Auto-Firing Weapons System
 * Projectile Pooling, Auto-Targeting & Passive Synergies
 */

import * as THREE from '../vendor/three.module.js';
import { SURVIVOR_CONFIG } from './config-survivor.js';

export function findNearestEnemies(playerPos, maxRange, count, enemies) {
  if (!enemies || enemies.length === 0) return [];

  const candidates = [];
  const maxRangeSq = maxRange * maxRange;

  for (const enemy of enemies) {
    if (enemy.isDead || enemy.hp <= 0) continue;
    const distSq = playerPos.distanceToSquared(enemy.pos);
    if (distSq <= maxRangeSq) {
      candidates.push({ enemy, distSq });
    }
  }

  candidates.sort((a, b) => a.distSq - b.distSq);
  return candidates.slice(0, count).map(c => c.enemy);
}

export class WeaponSystem {
  constructor(scene, combatFX, particleEngine, audio, gems = null) {
    this.scene = scene;
    this.combatFX = combatFX;
    this.particles = particleEngine;
    this.audio = audio;
    this.gems = gems;

    this.equippedWeapons = new Map();
    this.equippedPassives = new Map();
    this.activeProjectiles = [];
    this.timeSec = 0;
  }

  equipWeapon(id) {
    if (!this.equippedWeapons.has(id)) {
      this.equippedWeapons.set(id, { level: 1, timer: 0 });
    }
  }

  upgradeWeapon(id) {
    const w = this.equippedWeapons.get(id);
    if (w) {
      w.level = Math.min(SURVIVOR_CONFIG.weapons[id].maxLevel, w.level + 1);
    } else {
      this.equipWeapon(id);
    }
  }

  applyPassive(id, level) {
    this.equippedPassives.set(id, level);
  }

  calculateDamage(weaponId) {
    const wConfig = SURVIVOR_CONFIG.weapons[weaponId];
    const wState = this.equippedWeapons.get(weaponId);
    const lvl = wState ? wState.level - 1 : 0;
    const lvlData = wConfig.levels[lvl];
    const baseDmg = lvlData.damage || lvlData.dps || 20;

    // Passive multiplier (Trey's Guitar Pick)
    let dmgMult = 1.0;
    const pickLvl = this.equippedPassives.get('guitar_pick');
    if (pickLvl) {
      const pData = SURVIVOR_CONFIG.passives.guitar_pick.levels[pickLvl - 1];
      dmgMult += pData.damageMult;
    }

    // Critical hit chance (Icculus's Glasses)
    let isCrit = false;
    const glassesLvl = this.equippedPassives.get('icculus_glasses');
    if (glassesLvl) {
      const pData = SURVIVOR_CONFIG.passives.icculus_glasses.levels[glassesLvl - 1];
      if (Math.random() < pData.critChance) {
        isCrit = true;
        dmgMult *= 2.0;
      }
    }

    return {
      damage: Math.round(baseDmg * dmgMult),
      isCrit
    };
  }

  getCooldown(weaponId) {
    const wConfig = SURVIVOR_CONFIG.weapons[weaponId];
    const wState = this.equippedWeapons.get(weaponId);
    const lvl = wState ? wState.level - 1 : 0;
    let cd = wConfig.levels[lvl].cooldown || 1.0;

    // Passive CDR (Mike's Bassline)
    const bassLvl = this.equippedPassives.get('bassline');
    if (bassLvl) {
      const pData = SURVIVOR_CONFIG.passives.bassline.levels[bassLvl - 1];
      cd *= (1.0 - pData.cdr);
    }

    return Math.max(0.2, cd);
  }

  getExtraProjectiles() {
    const organLvl = this.equippedPassives.get('organ_boost');
    if (organLvl) {
      const pData = SURVIVOR_CONFIG.passives.organ_boost.levels[organLvl - 1];
      return pData.extraProjectiles || 0;
    }
    return 0;
  }

  update(delta, playerPos, playerHeading, enemies) {
    const dt = Math.min(2.0, delta);
    this.timeSec += dt;

    // Update weapon fire cooldowns
    for (const [id, state] of this.equippedWeapons.entries()) {
      if (id === 'runes') {
        this.updateRunes(state.level, playerPos);
        continue;
      }

      state.timer += dt;
      const cd = this.getCooldown(id);
      if (state.timer >= cd) {
        state.timer = 0;
        this.fireWeapon(id, state.level, playerPos, playerHeading, enemies);
      }
    }

    // Update active projectiles
    this.updateProjectiles(dt, enemies);
  }

  fireWeapon(id, level, playerPos, playerHeading, enemies) {
    const wConfig = SURVIVOR_CONFIG.weapons[id];
    const lvlData = wConfig.levels[level - 1];
    const extraProj = this.getExtraProjectiles();

    if (this.audio) {
      this.audio.playCombatSFX('shot');
    }

    switch (id) {
      case 'staff': {
        const count = (lvlData.orbs || 1) + extraProj;
        const targets = findNearestEnemies(playerPos, 45, count, enemies);
        for (let i = 0; i < count; i++) {
          const target = targets[i] || targets[0];
          const dir = target
            ? target.pos.clone().sub(playerPos).normalize()
            : new THREE.Vector3(-Math.sin(playerHeading), 0, -Math.cos(playerHeading));

          this.spawnProjectile({
            type: 'staff',
            pos: playerPos.clone().add(new THREE.Vector3(0, 1.2, 0)),
            vel: dir.multiplyScalar(lvlData.speed || 32),
            target,
            damage: this.calculateDamage('staff'),
            radius: lvlData.radius || 2.5,
            lifetime: 2.5,
            homingSpeed: lvlData.speed || 32,
            color: 0xffd700
          });
        }
        break;
      }
      case 'bow': {
        const count = (lvlData.arrows || 1) + extraProj;
        const targets = findNearestEnemies(playerPos, 50, 1, enemies);
        const baseDir = targets[0]
          ? targets[0].pos.clone().sub(playerPos).normalize()
          : new THREE.Vector3(-Math.sin(playerHeading), 0, -Math.cos(playerHeading));

        for (let i = 0; i < count; i++) {
          const spreadAngle = (i - (count - 1) / 2) * 0.12;
          const dir = baseDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), spreadAngle);

          this.spawnProjectile({
            type: 'bow',
            pos: playerPos.clone().add(new THREE.Vector3(0, 1.0, 0)),
            vel: dir.multiplyScalar(lvlData.speed || 52),
            damage: this.calculateDamage('bow'),
            pierce: lvlData.pierce || 3,
            radius: 1.2,
            lifetime: 1.5,
            color: 0x00f0ff
          });
        }
        break;
      }
      case 'spear': {
        // Instant 360 cleave around player
        const dmgInfo = this.calculateDamage('spear');
        const radius = lvlData.radius || 7.0;
        const knockback = lvlData.knockback || 14.0;

        for (const enemy of enemies) {
          if (enemy.isDead) continue;
          const dist = playerPos.distanceTo(enemy.pos);
          if (dist <= radius) {
            enemy.takeDamage(dmgInfo.damage, dmgInfo.isCrit);
            const knockDir = enemy.pos.clone().sub(playerPos).normalize();
            enemy.pos.addScaledVector(knockDir, knockback * 0.15);
          }
        }
        if (this.particles) {
          this.particles.spawnDeathShards(playerPos.x, playerPos.y + 0.5, playerPos.z, 0x9013fe, 10);
        }
        break;
      }
      case 'lightning': {
        const count = (lvlData.chains || 2) + extraProj;
        const targets = findNearestEnemies(playerPos, 45, count, enemies);
        const dmgInfo = this.calculateDamage('lightning');

        for (const target of targets) {
          target.takeDamage(dmgInfo.damage, dmgInfo.isCrit);
          if (this.particles) {
            this.particles.spawnDeathShards(target.pos.x, target.pos.y + 1, target.pos.z, 0x50e3c2, 8);
          }
        }
        break;
      }
      case 'vortex': {
        this.spawnProjectile({
          type: 'vortex',
          pos: playerPos.clone(),
          vel: new THREE.Vector3(),
          damage: this.calculateDamage('vortex'),
          radius: lvlData.radius || 14,
          lifetime: lvlData.duration || 2.5,
          color: 0x38bdf8
        });
        break;
      }
      case 'cleaver': {
        const count = (lvlData.cleavers || 1) + extraProj;
        const targets = findNearestEnemies(playerPos, 40, count, enemies);
        for (let i = 0; i < count; i++) {
          const target = targets[i];
          const dir = target
            ? target.pos.clone().sub(playerPos).normalize()
            : new THREE.Vector3(-Math.sin(playerHeading), 0, -Math.cos(playerHeading));

          this.spawnProjectile({
            type: 'cleaver',
            pos: playerPos.clone().add(new THREE.Vector3(0, 1.5, 0)),
            vel: dir.multiplyScalar(22).add(new THREE.Vector3(0, 8, 0)),
            gravity: 18,
            damage: this.calculateDamage('cleaver'),
            radius: lvlData.radius || 5.5,
            lifetime: 2.0,
            color: 0xff3366
          });
        }
        break;
      }
    }
  }

  updateRunes(level, playerPos) {
    const wConfig = SURVIVOR_CONFIG.weapons.runes;
    const lvlData = wConfig.levels[level - 1];
    const runeCount = (lvlData.runes || 2) + this.getExtraProjectiles();
    const radius = lvlData.radius || 3.8;
    const speed = lvlData.speed || 2.8;

    let runes = this.activeProjectiles.filter(p => p.type === 'runes');
    if (runes.length !== runeCount) {
      this.activeProjectiles = this.activeProjectiles.filter(p => p.type !== 'runes');
      runes = [];
      for (let i = 0; i < runeCount; i++) {
        const rune = {
          type: 'runes',
          pos: new THREE.Vector3(),
          vel: new THREE.Vector3(),
          damage: this.calculateDamage('runes'),
          radius: 1.2,
          lifetime: Infinity,
          isAura: true,
          color: 0xf5a623,
          hitCooldowns: new Map()
        };
        this.activeProjectiles.push(rune);
        runes.push(rune);
      }
    }

    const dmgInfo = this.calculateDamage('runes');
    for (let i = 0; i < runeCount; i++) {
      const angle = this.timeSec * speed + (i * Math.PI * 2) / runeCount;
      const rx = playerPos.x + Math.cos(angle) * radius;
      const rz = playerPos.z + Math.sin(angle) * radius;
      const rune = runes[i];
      rune.pos.set(rx, playerPos.y + 1.0, rz);
      rune.damage = dmgInfo;
    }
  }

  spawnProjectile(config) {
    this.activeProjectiles.push({
      ...config,
      age: 0
    });
  }

  updateProjectiles(dt, enemies) {
    for (let i = this.activeProjectiles.length - 1; i >= 0; i--) {
      const p = this.activeProjectiles[i];
      p.age = (p.age || 0) + dt;

      if (p.lifetime !== Infinity && p.age >= p.lifetime) {
        this.activeProjectiles.splice(i, 1);
        continue;
      }

      // Parabolic gravity
      if (p.gravity) {
        p.vel.y -= p.gravity * dt;
      }

      // Homing guidance for projectiles with target
      if (p.target && !p.target.isDead) {
        const toTarget = p.target.pos.clone().sub(p.pos);
        toTarget.y = 0;
        if (toTarget.lengthSq() > 0.001) {
          toTarget.normalize();
          const speed = p.homingSpeed || p.vel.length() || 30;
          p.vel.lerp(toTarget.multiplyScalar(speed), Math.min(1.0, 6.0 * dt));
        }
      }

      // Movement (auras are moved by their orbit controller)
      if (!p.isAura) {
        p.pos.addScaledVector(p.vel, dt);
      }

      if (this.particles && Math.random() < 0.4) {
        this.particles.spawnProjectileTrail(p.pos.x, p.pos.y, p.pos.z, p.color);
      }

      // 1. Vortex Projectiles (Sustains for duration, pulls enemies & gems, tick damage)
      if (p.type === 'vortex' || p.isVortex) {
        p.tickTimer = (p.tickTimer || 0) + dt;
        const doTick = p.tickTimer >= 0.25;
        if (doTick) {
          p.tickTimer = 0;
        }

        if (enemies) {
          for (const enemy of enemies) {
            if (enemy.isDead) continue;
            const dir = p.pos.clone().sub(enemy.pos);
            dir.y = 0;
            const dist = dir.length();
            if (dist <= p.radius) {
              if (dist > 0.5) {
                dir.normalize();
                const pullSpeed = p.pullStrength || 12;
                enemy.pos.addScaledVector(dir, Math.min(dist - 0.5, pullSpeed * dt));
              }
              if (doTick) {
                enemy.takeDamage(p.damage.damage, p.damage.isCrit);
              }
            }
          }
        }
        continue; // Vortex lives until p.age >= p.lifetime
      }

      // 2. Aura Projectiles (e.g., Runes orbit)
      if (p.isAura) {
        if (p.hitCooldowns) {
          for (const [enemy, cd] of p.hitCooldowns.entries()) {
            if (cd > 0) {
              p.hitCooldowns.set(enemy, cd - dt);
            }
          }
        }
        if (enemies) {
          for (const enemy of enemies) {
            if (enemy.isDead) continue;
            const dist = p.pos.distanceTo(enemy.pos);
            if (dist <= (p.radius + (enemy.radius || 1.0))) {
              const cd = (p.hitCooldowns && p.hitCooldowns.get(enemy)) || 0;
              if (cd <= 0) {
                enemy.takeDamage(p.damage.damage, p.damage.isCrit);
                if (p.hitCooldowns) {
                  p.hitCooldowns.set(enemy, 0.3);
                }
              }
            }
          }
        }
        continue;
      }

      // 3. Collision with enemies for direct / splash / piercing projectiles
      if (enemies) {
        // Splash Projectiles (Staff, Cleaver)
        if (p.type === 'staff' || p.type === 'cleaver') {
          const directHit = enemies.some(e => !e.isDead && p.pos.distanceTo(e.pos) <= (p.radius + (e.radius || 1.0)));
          if (directHit) {
            for (const enemy of enemies) {
              if (enemy.isDead) continue;
              const dist = p.pos.distanceTo(enemy.pos);
              if (dist <= (p.radius + (enemy.radius || 1.0))) {
                enemy.takeDamage(p.damage.damage, p.damage.isCrit);
              }
            }
            if (this.particles) {
              this.particles.spawnExplosion(p.pos.x, p.pos.y, p.pos.z, p.color || 0xffd700, 12);
            }
            if (this.combatFX) {
              this.combatFX.addScreenShake(0.15);
            }
            this.activeProjectiles.splice(i, 1);
            continue;
          }
        } else {
          // Standard / Piercing projectiles (e.g. Bow)
          let hitSomething = false;
          for (const enemy of enemies) {
            if (enemy.isDead) continue;
            const dist = p.pos.distanceTo(enemy.pos);
            if (dist <= (p.radius + (enemy.radius || 1.0))) {
              enemy.takeDamage(p.damage.damage, p.damage.isCrit);
              hitSomething = true;
              if (p.pierce !== undefined) {
                p.pierce--;
                if (p.pierce <= 0) break;
              } else {
                break;
              }
            }
          }

          if (hitSomething && (p.pierce === undefined || p.pierce <= 0)) {
            this.activeProjectiles.splice(i, 1);
            continue;
          }
        }
      }
    }
  }
}
