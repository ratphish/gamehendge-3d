/**
 * Gamehendge 3D Survivor Mode Additive Particle Engine
 * High-performance pooled particle system for death shatters, trails and dust
 */

import * as THREE from '../vendor/three.module.js';

export class ParticleEngine {
  constructor(scene, maxParticles = 250) {
    this.scene = scene;
    this.maxParticles = maxParticles;
    this.particles = [];
    this.activeCount = 0;

    for (let i = 0; i < maxParticles; i++) {
      this.particles.push({
        active: false,
        x: 0, y: 0, z: 0,
        vx: 0, vy: 0, vz: 0,
        r: 1, g: 1, b: 1,
        size: 1.0,
        age: 0,
        maxAge: 0.6,
        gravity: 12.0
      });
    }

    this.positions = new Float32Array(maxParticles * 3);
    this.colors = new Float32Array(maxParticles * 3);

    this.geom = new THREE.BufferGeometry();
    this.geom.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geom.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

    this.mat = new THREE.PointsMaterial({
      size: 0.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.points = new THREE.Points(this.geom, this.mat);
    if (this.scene) {
      this.scene.add(this.points);
    }
  }

  allocParticle() {
    for (const p of this.particles) {
      if (!p.active) {
        p.active = true;
        this.activeCount++;
        return p;
      }
    }
    // Recycle oldest if pool is full
    const oldest = this.particles[0];
    oldest.active = true;
    return oldest;
  }

  spawnDeathShards(x, y, z, hexColor = 0x00f0ff, count = 12) {
    const col = new THREE.Color(hexColor);
    for (let i = 0; i < count; i++) {
      const p = this.allocParticle();
      if (!p) break;

      const angle = Math.random() * Math.PI * 2;
      const speed = 4.0 + Math.random() * 8.0;

      p.x = x;
      p.y = y + 0.8;
      p.z = z;
      p.vx = Math.cos(angle) * speed;
      p.vy = 3.0 + Math.random() * 7.0;
      p.vz = Math.sin(angle) * speed;
      p.r = col.r;
      p.g = col.g;
      p.b = col.b;
      p.size = 1.0 + Math.random() * 0.8;
      p.age = 0;
      p.maxAge = 0.4 + Math.random() * 0.3;
      p.gravity = 16.0;
    }
  }

  spawnExplosion(x, y, z, hexColor = 0xffd700, count = 16) {
    this.spawnDeathShards(x, y, z, hexColor, count);
  }

  spawnSlideDust(x, y, z, count = 6) {
    for (let i = 0; i < count; i++) {
      const p = this.allocParticle();
      if (!p) break;

      p.x = x + (Math.random() - 0.5) * 0.8;
      p.y = y + 0.2;
      p.z = z + (Math.random() - 0.5) * 0.8;
      p.vx = (Math.random() - 0.5) * 2.5;
      p.vy = 1.5 + Math.random() * 3.0;
      p.vz = (Math.random() - 0.5) * 2.5;
      p.r = 0.85;
      p.g = 0.82;
      p.b = 0.75;
      p.size = 1.2;
      p.age = 0;
      p.maxAge = 0.3 + Math.random() * 0.2;
      p.gravity = -1.0; // Float upward
    }
  }

  spawnProjectileTrail(x, y, z, hexColor = 0xffe082) {
    const p = this.allocParticle();
    if (!p) return;
    const col = new THREE.Color(hexColor);

    p.x = x;
    p.y = y;
    p.z = z;
    p.vx = (Math.random() - 0.5) * 0.5;
    p.vy = (Math.random() - 0.5) * 0.5;
    p.vz = (Math.random() - 0.5) * 0.5;
    p.r = col.r;
    p.g = col.g;
    p.b = col.b;
    p.size = 0.8;
    p.age = 0;
    p.maxAge = 0.25;
    p.gravity = 0;
  }

  update(delta) {
    const dt = Math.min(1.0, delta);
    let activeIndex = 0;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!p.active) continue;

      p.age += dt;
      if (p.age >= p.maxAge) {
        p.active = false;
        this.activeCount = Math.max(0, this.activeCount - 1);
        continue;
      }

      p.vy -= p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;

      const alpha = 1.0 - (p.age / p.maxAge);

      this.positions[activeIndex * 3] = p.x;
      this.positions[activeIndex * 3 + 1] = p.y;
      this.positions[activeIndex * 3 + 2] = p.z;

      this.colors[activeIndex * 3] = p.r * alpha;
      this.colors[activeIndex * 3 + 1] = p.g * alpha;
      this.colors[activeIndex * 3 + 2] = p.b * alpha;

      activeIndex++;
    }

    // Zero out unused slots
    for (let i = activeIndex; i < this.maxParticles; i++) {
      this.positions[i * 3] = 0;
      this.positions[i * 3 + 1] = -9999;
      this.positions[i * 3 + 2] = 0;
    }

    if (this.geom) {
      this.geom.attributes.position.needsUpdate = true;
      this.geom.attributes.color.needsUpdate = true;
    }
  }
}
