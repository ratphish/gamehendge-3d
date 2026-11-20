/**
 * Gamehendge 3D Survivor Mode Enemy Horde & Boss System
 * Wave Progression, Flocking AI, Hit Flash & Boss Encounters
 */

import * as THREE from '../vendor/three.module.js';
import { SURVIVOR_CONFIG, getEnemyScaling } from './config-survivor.js';
import { getPSXCanvasTexture } from '../graphics/psx-textures.js';
import { applyPSXVertexJitter } from '../graphics/psx-renderer.js';

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
    const scale = enemy.scale || 1.0;
    const limbs = {};

    const lizardTex = getPSXCanvasTexture('lizard');
    const ruinsTex = getPSXCanvasTexture('ruins');

    if (enemy.type === 'soldier') {
      // 1. Lizard Foot Soldier (Biped with snout, mace, shield, legs)
      const skinMat = new THREE.MeshStandardMaterial({
        color: 0x48b870, // Vibrant olive-emerald lizard scale
        map: lizardTex || null,
        roughness: 0.65,
        emissive: 0x0c2514, // Subtle inner reptile glow
        flatShading: true
      });
      applyPSXVertexJitter(skinMat);

      const armorMat = new THREE.MeshStandardMaterial({
        color: 0x6e5238, // Leather harness
        roughness: 0.75,
        flatShading: true
      });
      applyPSXVertexJitter(armorMat);

      const metalMat = new THREE.MeshStandardMaterial({
        color: 0x9ca6b4,
        roughness: 0.35,
        metalness: 0.7,
        flatShading: true
      });
      applyPSXVertexJitter(metalMat);

      // Torso
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7 * scale, 0.9 * scale, 0.5 * scale), armorMat);
      torso.position.y = 1.1 * scale;
      group.add(torso);

      // Head with snout
      const headGroup = new THREE.Group();
      headGroup.position.set(0, 1.7 * scale, 0.1 * scale);
      const cranium = new THREE.Mesh(new THREE.BoxGeometry(0.5 * scale, 0.38 * scale, 0.4 * scale), skinMat);
      const snout = new THREE.Mesh(new THREE.BoxGeometry(0.42 * scale, 0.28 * scale, 0.55 * scale), skinMat);
      snout.position.set(0, -0.05 * scale, 0.35 * scale);
      headGroup.add(cranium);
      headGroup.add(snout);

      // Glowing yellow slit eyes
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });
      const eye1 = new THREE.Mesh(new THREE.BoxGeometry(0.08 * scale, 0.08 * scale, 0.08 * scale), eyeMat);
      eye1.position.set(0.24 * scale, 0.06 * scale, 0.16 * scale);
      const eye2 = eye1.clone();
      eye2.position.x = -0.24 * scale;
      headGroup.add(eye1);
      headGroup.add(eye2);
      group.add(headGroup);

      // Spiked Mace in Right Hand
      const armR = new THREE.Group();
      armR.position.set(0.45 * scale, 1.4 * scale, 0);
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.08 * scale, 0.8 * scale, 0.08 * scale), armorMat);
      handle.position.set(0, -0.2 * scale, 0.2 * scale);
      handle.rotation.x = 0.6;
      const maceHead = new THREE.Mesh(new THREE.OctahedronGeometry(0.2 * scale, 0), metalMat);
      maceHead.position.set(0, 0.25 * scale, 0.45 * scale);
      armR.add(handle);
      armR.add(maceHead);
      group.add(armR);
      limbs.armR = armR;

      // Small Buckler Shield on Left Arm
      const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.3 * scale, 0.3 * scale, 0.08 * scale, 5), metalMat);
      shield.position.set(-0.45 * scale, 1.1 * scale, 0.15 * scale);
      shield.rotation.z = Math.PI / 2;
      group.add(shield);

      // Left & Right Walking Legs
      const legL = new THREE.Group();
      legL.position.set(0.22 * scale, 0.7 * scale, 0);
      const legMeshL = new THREE.Mesh(new THREE.BoxGeometry(0.22 * scale, 0.7 * scale, 0.22 * scale), skinMat);
      legMeshL.position.y = -0.35 * scale;
      legL.add(legMeshL);
      group.add(legL);

      const legR = new THREE.Group();
      legR.position.set(-0.22 * scale, 0.7 * scale, 0);
      const legMeshR = new THREE.Mesh(new THREE.BoxGeometry(0.22 * scale, 0.7 * scale, 0.22 * scale), skinMat);
      legMeshR.position.y = -0.35 * scale;
      legR.add(legMeshR);
      group.add(legR);

      limbs.legL = legL;
      limbs.legR = legR;
      enemy.mat = skinMat;
    } else if (enemy.type === 'beast') {
      // 2. Corrupted Multibeast (Quadruped with horns and tail)
      const beastMat = new THREE.MeshStandardMaterial({
        color: 0xb84e36, // Rufous auburn hide
        roughness: 0.8,
        emissive: 0x1f0a05,
        flatShading: true
      });
      applyPSXVertexJitter(beastMat);

      const hornMat = new THREE.MeshStandardMaterial({ color: 0x221a14, roughness: 0.6, flatShading: true });

      // Body
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.0 * scale, 0.8 * scale, 1.6 * scale), beastMat);
      body.position.y = 0.9 * scale;
      group.add(body);

      // Head
      const head = new THREE.Group();
      head.position.set(0, 1.1 * scale, 0.9 * scale);
      const skull = new THREE.Mesh(new THREE.BoxGeometry(0.6 * scale, 0.5 * scale, 0.7 * scale), beastMat);
      head.add(skull);

      // Horns
      const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.12 * scale, 0.5 * scale, 4), hornMat);
      hornL.position.set(0.25 * scale, 0.35 * scale, -0.1 * scale);
      hornL.rotation.x = -0.4;
      const hornR = hornL.clone();
      hornR.position.x = -0.25 * scale;
      head.add(hornL);
      head.add(hornR);
      group.add(head);

      // 4 Walking Legs
      const legFL = new THREE.Group(); legFL.position.set(0.38 * scale, 0.5 * scale, 0.5 * scale);
      const legFR = new THREE.Group(); legFR.position.set(-0.38 * scale, 0.5 * scale, 0.5 * scale);
      const legBL = new THREE.Group(); legBL.position.set(0.38 * scale, 0.5 * scale, -0.5 * scale);
      const legBR = new THREE.Group(); legBR.position.set(-0.38 * scale, 0.5 * scale, -0.5 * scale);

      const legGeom = new THREE.BoxGeometry(0.22 * scale, 0.5 * scale, 0.22 * scale);
      [legFL, legFR, legBL, legBR].forEach(l => {
        const m = new THREE.Mesh(legGeom, beastMat);
        m.position.y = -0.25 * scale;
        l.add(m);
        group.add(l);
      });

      // Wagging Tail
      const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * scale, 0.04 * scale, 0.7 * scale, 4), beastMat);
      tail.position.set(0, 0.9 * scale, -0.9 * scale);
      tail.rotation.x = 0.8;
      group.add(tail);

      limbs.legFL = legFL; limbs.legFR = legFR; limbs.legBL = legBL; limbs.legBR = legBR;
      limbs.tail = tail;
      enemy.mat = beastMat;
    } else if (enemy.type === 'guard') {
      // 3. Royal Castle Guard (Armored Humanoid with Horned Helmet & Halberd)
      const steelMat = new THREE.MeshStandardMaterial({
        color: 0x8894a6,
        map: ruinsTex || null,
        metalness: 0.8,
        roughness: 0.35,
        flatShading: true
      });
      applyPSXVertexJitter(steelMat);

      const surcoatMat = new THREE.MeshStandardMaterial({
        color: 0xc82035, // Bright royal crimson
        roughness: 0.75,
        flatShading: true
      });
      applyPSXVertexJitter(surcoatMat);

      // Torso with Surcoat
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.8 * scale, 1.1 * scale, 0.55 * scale), surcoatMat);
      torso.position.y = 1.3 * scale;
      group.add(torso);

      // Horned Greathelm
      const helm = new THREE.Mesh(new THREE.BoxGeometry(0.55 * scale, 0.65 * scale, 0.55 * scale), steelMat);
      helm.position.set(0, 2.05 * scale, 0);
      const visorMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.35 * scale, 0.08 * scale, 0.05 * scale), visorMat);
      visor.position.set(0, 0, 0.29 * scale);
      helm.add(visor);
      group.add(helm);

      // Halberd in right hand
      const halberdArm = new THREE.Group();
      halberdArm.position.set(0.5 * scale, 1.5 * scale, 0);
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06 * scale, 0.06 * scale, 2.8 * scale, 4), steelMat);
      shaft.position.set(0, 0.2 * scale, 0.25 * scale);
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08 * scale, 0.7 * scale, 0.45 * scale), steelMat);
      blade.position.set(0, 1.1 * scale, 0.25 * scale);
      halberdArm.add(shaft);
      halberdArm.add(blade);
      group.add(halberdArm);
      limbs.armR = halberdArm;

      // Legs
      const legL = new THREE.Group(); legL.position.set(0.24 * scale, 0.8 * scale, 0);
      const legR = new THREE.Group(); legR.position.set(-0.24 * scale, 0.8 * scale, 0);
      const legGeom = new THREE.BoxGeometry(0.24 * scale, 0.8 * scale, 0.24 * scale);
      [legL, legR].forEach(l => {
        const m = new THREE.Mesh(legGeom, steelMat);
        m.position.y = -0.4 * scale;
        l.add(m);
        group.add(l);
      });
      limbs.legL = legL; limbs.legR = legR;
      enemy.mat = surcoatMat;
    } else if (enemy.type === 'hosemaster') {
      // 4. The Watchful Hosemaster (Giant Brass Heavy Warden)
      const brassMat = new THREE.MeshStandardMaterial({ color: 0xb58832, roughness: 0.4, metalness: 0.8, flatShading: true });
      applyPSXVertexJitter(brassMat);

      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.9 * scale, 1.1 * scale, 1.8 * scale, 6), brassMat);
      body.position.y = 1.4 * scale;
      group.add(body);

      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.6 * scale, 5, 4), brassMat);
      dome.position.y = 2.6 * scale;
      group.add(dome);

      // Giant Hose Nozzle
      const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.22 * scale, 0.35 * scale, 2.2 * scale, 6), brassMat);
      nozzle.position.set(0, 1.4 * scale, 0.9 * scale);
      nozzle.rotation.x = Math.PI / 2;
      group.add(nozzle);

      enemy.mat = brassMat;
    } else if (enemy.type === 'wilson') {
      // 5. King Wilson (Giant Obsidian Tyrant with Gold Crown & Cape)
      const obsidianMat = new THREE.MeshStandardMaterial({ color: 0x181a20, roughness: 0.3, metalness: 0.85, flatShading: true });
      applyPSXVertexJitter(obsidianMat);
      const capeMat = new THREE.MeshStandardMaterial({ color: 0x8a001a, roughness: 0.7, side: THREE.DoubleSide });
      applyPSXVertexJitter(capeMat);

      const body = new THREE.Mesh(new THREE.BoxGeometry(1.2 * scale, 2.0 * scale, 0.8 * scale), obsidianMat);
      body.position.y = 1.8 * scale;
      group.add(body);

      // Crown
      const crownMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.2, metalness: 0.9 });
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.65 * scale, 0.5 * scale, 0.4 * scale, 5), crownMat);
      crown.position.y = 3.2 * scale;
      group.add(crown);

      // Crimson Cape
      const cape = new THREE.Mesh(new THREE.PlaneGeometry(1.4 * scale, 2.4 * scale), capeMat);
      cape.position.set(0, 1.6 * scale, -0.45 * scale);
      group.add(cape);

      enemy.mat = obsidianMat;
    } else {
      const mat = new THREE.MeshStandardMaterial({ color: enemy.color, flatShading: true });
      const body = new THREE.Mesh(new THREE.BoxGeometry(enemy.scale, enemy.scale * 1.3, enemy.scale), mat);
      body.position.y = enemy.scale * 0.9;
      group.add(body);
      enemy.mat = mat;
    }

    enemy.limbs = limbs;
    group.position.copy(enemy.pos);
    this.scene.add(group);
    enemy.mesh = group;
  }

  update(delta, playerPos, elapsedSec) {
    const dt = Math.min(0.2, delta);
    const deadEnemies = [];

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
          if (e.mat) e.mat.dispose();
        }
        deadEnemies.push(e);
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

        // Animate walking limbs
        if (e.limbs) {
          e.walkCycle = (e.walkCycle || 0) + dt * (e.speed * 0.4);
          const swing = Math.sin(e.walkCycle);
          if (e.limbs.legL && e.limbs.legR) {
            e.limbs.legL.rotation.x = swing * 0.6;
            e.limbs.legR.rotation.x = -swing * 0.6;
          }
          if (e.limbs.legFL && e.limbs.legFR) {
            e.limbs.legFL.rotation.x = swing * 0.5;
            e.limbs.legFR.rotation.x = -swing * 0.5;
            e.limbs.legBL.rotation.x = -swing * 0.5;
            e.limbs.legBR.rotation.x = swing * 0.5;
          }
          if (e.limbs.tail) {
            e.limbs.tail.rotation.y = Math.sin(e.walkCycle * 2) * 0.4;
          }
          if (e.limbs.armR) {
            e.limbs.armR.rotation.x = -swing * 0.4;
          }
        }
      }
    }

    return { deadEnemies };
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
