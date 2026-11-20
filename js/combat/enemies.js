/**
 * Gamehendge 3D Survivor Mode Enemy Horde & Boss System
 * Wave Progression, Flocking AI, Hit Flash & Boss Encounters
 */

import * as THREE from '../vendor/three.module.js';
import { SURVIVOR_CONFIG, getEnemyScaling } from './config-survivor.js';

export class Enemy {
  constructor(type, hp, speed, damage, pos, color = 0xd0021b, scale = 1.0, combatFX = null, particles = null, audio = null) {
    this.type = type;
    this.hp = hp;
    this.maxHp = hp;
    this.speed = speed;
    this.damage = damage;
    this.pos = pos.clone();
    this.color = color;
    this.scale = scale;
    this.radius = 1.0 * scale;

    this.combatFX = combatFX;
    this.particles = particles;
    this.audio = audio;

    this.isDead = false;
    this.flashTimer = 0;
    this.mesh = null;
  }

  takeDamage(amount, isCrit = false) {
    if (this.isDead) return false;

    this.hp = Math.max(0, this.hp - amount);
    this.flashTimer = 0.12;

    if (this.combatFX) {
      this.combatFX.addDamageNumber(this.pos.x, this.pos.y + 1.2, this.pos.z, amount, isCrit);
      if (isCrit) {
        this.combatFX.addScreenShake(0.18);
      }
    }

    if (this.audio) {
      this.audio.playCombatSFX('hit');
    }

    if (this.hp <= 0) {
      this.isDead = true;
      if (this.particles) {
        this.particles.spawnDeathShards(this.pos.x, this.pos.y, this.pos.z, this.color, 14);
      }
      return false; // Fatal
    }

    return true; // Survived
  }
}

export class EnemyManager {
  constructor(scene, world, combatFX, particles, audio) {
    this.scene = scene;
    this.world = world;
    this.combatFX = combatFX;
    this.particles = particles;
    this.audio = audio;

    this.activeEnemies = [];
    this.spawnTimer = 0;
    this.hosemasterSpawned = false;
    this.wilsonSpawned = false;

    this.sharedGeom = new THREE.DodecahedronGeometry(0.8, 1);
  }

  spawnEnemy(playerPos, elapsedSec) {
    if (this.activeEnemies.length >= SURVIVOR_CONFIG.arena.maxActiveEnemies) return null;

    const angle = Math.random() * Math.PI * 2;
    const dist = SURVIVOR_CONFIG.arena.spawnMinDist + Math.random() * (SURVIVOR_CONFIG.arena.spawnMaxDist - SURVIVOR_CONFIG.arena.spawnMinDist);
    const sx = playerPos.x + Math.cos(angle) * dist;
    const sz = playerPos.z + Math.sin(angle) * dist;
    const sy = this.world ? this.world.getTerrainHeight(sx, sz) : 0;

    const scaling = getEnemyScaling(elapsedSec);

    let type = 'soldier';
    let baseHp = 35;
    let baseSpeed = 16;
    let baseDmg = 8;
    let color = 0xd0021b;
    let scale = 1.0;

    if (elapsedSec > 300 && Math.random() < 0.5) {
      // Citadel Royal Guard
      type = 'guard';
      baseHp = 240;
      baseSpeed = 13;
      baseDmg = 24;
      color = 0x9013fe;
      scale = 1.4;
    } else if (elapsedSec > 150 && Math.random() < 0.6) {
      // Corrupted Multibeast
      type = 'multibeast';
      baseHp = 90;
      baseSpeed = 21;
      baseDmg = 16;
      color = 0xff7700;
      scale = 1.2;
    }

    const enemy = new Enemy(
      type,
      Math.round(baseHp * scaling.hpMult),
      baseSpeed * scaling.speedMult,
      baseDmg,
      new THREE.Vector3(sx, sy, sz),
      color,
      scale,
      this.combatFX,
      this.particles,
      this.audio
    );

    this.createEnemyMesh(enemy);
    this.activeEnemies.push(enemy);
    return enemy;
  }

  spawnHosemaster(playerPos) {
    this.hosemasterSpawned = true;
    const angle = Math.random() * Math.PI * 2;
    const sx = playerPos.x + Math.cos(angle) * 42;
    const sz = playerPos.z + Math.sin(angle) * 42;
    const sy = this.world ? this.world.getTerrainHeight(sx, sz) : 0;

    const boss = new Enemy(
      'hosemaster',
      3500,
      14,
      20,
      new THREE.Vector3(sx, sy, sz),
      0x00f0ff,
      2.6,
      this.combatFX,
      this.particles,
      this.audio
    );

    if (this.audio) {
      this.audio.playCombatSFX('boss_alert');
    }
    if (this.combatFX) {
      this.combatFX.addScreenShake(0.5);
    }

    this.createEnemyMesh(boss);
    this.activeEnemies.push(boss);
  }

  spawnWilson(playerPos) {
    this.wilsonSpawned = true;
    const angle = Math.random() * Math.PI * 2;
    const sx = playerPos.x + Math.cos(angle) * 45;
    const sz = playerPos.z + Math.sin(angle) * 45;
    const sy = this.world ? this.world.getTerrainHeight(sx, sz) : 0;

    const boss = new Enemy(
      'wilson',
      12000,
      17,
      35,
      new THREE.Vector3(sx, sy, sz),
      0xff0055,
      3.8,
      this.combatFX,
      this.particles,
      this.audio
    );

    if (this.audio) {
      this.audio.playCombatSFX('boss_alert');
    }
    if (this.combatFX) {
      this.combatFX.addScreenShake(0.8);
    }

    this.createEnemyMesh(boss);
    this.activeEnemies.push(boss);
  }

  createEnemyMesh(enemy) {
    if (!this.scene) return;

    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
      color: enemy.color,
      roughness: 0.6,
      flatShading: true
    });

    const body = new THREE.Mesh(this.sharedGeom, mat);
    body.scale.set(enemy.scale, enemy.scale * 1.3, enemy.scale);
    body.position.y = enemy.scale * 0.9;
    group.add(body);

    // Glowing eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.12 * enemy.scale, 4, 4), eyeMat);
    eye1.position.set(0.28 * enemy.scale, enemy.scale * 1.2, 0.65 * enemy.scale);
    const eye2 = eye1.clone();
    eye2.position.x = -0.28 * enemy.scale;
    group.add(eye1);
    group.add(eye2);

    group.position.copy(enemy.pos);
    this.scene.add(group);
    enemy.mesh = group;
    enemy.mat = mat;
  }

  update(delta, playerPos, elapsedSec) {
    const dt = Math.min(0.2, delta);

    // Check Boss Spawns
    if (elapsedSec >= 300 && !this.hosemasterSpawned) {
      this.spawnHosemaster(playerPos);
    }
    if (elapsedSec >= 600 && !this.wilsonSpawned) {
      this.spawnWilson(playerPos);
    }

    // Spawn regular waves
    this.spawnTimer += dt;
    const spawnInterval = Math.max(0.25, 1.2 - (elapsedSec / 60) * 0.15);
    if (this.spawnTimer >= spawnInterval) {
      this.spawnTimer = 0;
      this.spawnEnemy(playerPos, elapsedSec);
    }

    // Update active enemies
    for (let i = this.activeEnemies.length - 1; i >= 0; i--) {
      const e = this.activeEnemies[i];

      if (e.isDead) {
        if (e.mesh && this.scene) {
          this.scene.remove(e.mesh);
        }
        this.activeEnemies.splice(i, 1);
        continue;
      }

      // Hit flash visual update
      if (e.flashTimer > 0) {
        e.flashTimer -= dt;
        if (e.mat) {
          e.mat.emissive.setHex(0xffffff);
          e.mat.emissiveIntensity = 0.8;
        }
      } else if (e.mat) {
        e.mat.emissive.setHex(0x000000);
        e.mat.emissiveIntensity = 0;
      }

      // Steer toward player
      const dir = playerPos.clone().sub(e.pos);
      dir.y = 0;
      const dist = dir.length();

      if (dist > 1.2) {
        dir.normalize();
        e.pos.addScaledVector(dir, e.speed * dt);
      }

      // Terrain elevation clamping
      if (this.world) {
        e.pos.y = this.world.getTerrainHeight(e.pos.x, e.pos.z);
      }

      // Update Three.js mesh
      if (e.mesh) {
        e.mesh.position.copy(e.pos);
        if (dist > 0.1) {
          e.mesh.rotation.y = Math.atan2(dir.x, dir.z);
        }
      }
    }
  }

  checkPlayerContact(playerPos, playerRadius = 1.4) {
    let hit = false;
    let totalDmg = 0;

    for (const e of this.activeEnemies) {
      if (e.isDead) continue;
      const dist = playerPos.distanceTo(e.pos);
      if (dist <= (playerRadius + e.radius)) {
        hit = true;
        totalDmg = Math.max(totalDmg, e.damage);
      }
    }

    return { hit, damage: totalDmg };
  }
}
