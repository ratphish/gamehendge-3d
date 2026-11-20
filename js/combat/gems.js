/**
 * Gamehendge 3D Survivor Mode Flow XP Gems
 * Octahedron 3D Geometry, Magnetic Suction & XP Delivery
 */

import * as THREE from '../vendor/three.module.js';
import { SURVIVOR_CONFIG } from './config-survivor.js';

export class Gem {
  constructor(tier, pos, scene = null) {
    this.tier = tier;
    const config = SURVIVOR_CONFIG.gems[tier] || SURVIVOR_CONFIG.gems.cyan;
    this.value = config.value;
    this.color = config.color;
    this.pos = pos.clone();

    this.isMagnetized = false;
    this.speed = 18.0;
    this.mesh = null;
    this.scene = scene;

    if (this.scene) {
      const geom = new THREE.OctahedronGeometry(tier === 'gold' ? 0.6 : tier === 'purple' ? 0.48 : 0.38);
      const mat = new THREE.MeshStandardMaterial({
        color: this.color,
        emissive: this.color,
        emissiveIntensity: 0.75,
        roughness: 0.2,
        metalness: 0.8
      });
      this.mesh = new THREE.Mesh(geom, mat);
      this.mesh.position.copy(this.pos);
      this.scene.add(this.mesh);
    }
  }

  destroy() {
    if (this.mesh && this.scene) {
      this.scene.remove(this.mesh);
      if (this.mesh.geometry) this.mesh.geometry.dispose();
      if (this.mesh.material) this.mesh.material.dispose();
    }
  }
}

export class GemManager {
  constructor(scene, audio = null, particles = null) {
    this.scene = scene;
    this.audio = audio;
    this.particles = particles;
    this.activeGems = [];
    this.timeSec = 0;
  }

  spawnGem(x, y, z, tier = 'cyan') {
    const gem = new Gem(tier, new THREE.Vector3(x, y + 0.5, z), this.scene);
    this.activeGems.push(gem);
    return gem;
  }

  magnetizeAll() {
    for (const g of this.activeGems) {
      g.isMagnetized = true;
    }
  }

  update(delta, playerPos, magnetRadius = 10) {
    const dt = Math.min(0.2, delta);
    this.timeSec += dt;
    let totalXp = 0;

    for (let i = this.activeGems.length - 1; i >= 0; i--) {
      const g = this.activeGems[i];
      const dist = g.pos.distanceTo(playerPos);

      // Check magnet activation
      if (!g.isMagnetized && dist <= magnetRadius) {
        g.isMagnetized = true;
      }

      // Magnetic movement
      if (g.isMagnetized) {
        g.speed = Math.min(48.0, g.speed + dt * 32.0);
        const dir = playerPos.clone().sub(g.pos).normalize();
        g.pos.addScaledVector(dir, g.speed * dt);
      }

      // Idle float bob & spin
      if (g.mesh) {
        g.mesh.position.copy(g.pos);
        g.mesh.rotation.y = this.timeSec * 2.5;
        if (!g.isMagnetized) {
          g.mesh.position.y = g.pos.y + Math.sin(this.timeSec * 4 + g.pos.x) * 0.15;
        }
      }

      // Collection at contact distance
      if (dist <= 1.4) {
        totalXp += g.value;
        if (this.audio) {
          this.audio.playCombatSFX('gem');
        }
        if (this.particles) {
          this.particles.spawnProjectileTrail(g.pos.x, g.pos.y, g.pos.z, g.color);
        }
        g.destroy();
        this.activeGems.splice(i, 1);
      }
    }

    return totalXp;
  }
}
