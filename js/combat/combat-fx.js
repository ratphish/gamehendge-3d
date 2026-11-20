/**
 * Gamehendge 3D Survivor Mode Combat FX
 * Floating 60 FPS Damage Numbers, Screen Shake & Critical Hit Popups
 */

import * as THREE from '../vendor/three.module.js';

export class CombatFX {
  constructor() {
    this.activeNumbers = [];
    this.activeNotes = [];
    this.trauma = 0;
    this.maxShakeOffset = 0.8;
    this.shakeOffset = new THREE.Vector3();
    this._projVec = new THREE.Vector3();
  }

  addDamageNumber(x, y, z, value, isCrit = false) {
    this.activeNumbers.push({
      x,
      y: y + 0.5,
      z,
      value: Math.round(value),
      isCrit,
      age: 0,
      maxAge: 0.65,
      vy: isCrit ? 5.5 : 4.0
    });
  }

  addMusicalNote(x, y, z, symbol = '♪') {
    this.activeNotes.push({
      x: x + (Math.random() - 0.5) * 1.0,
      y: y + 0.8,
      z: z + (Math.random() - 0.5) * 1.0,
      symbol,
      age: 0,
      maxAge: 0.8,
      vy: 4.5,
      rot: (Math.random() - 0.5) * 0.4
    });
  }

  addScreenShake(amount) {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  update(delta) {
    const dt = Math.min(1.0, delta);

    // Update floating damage numbers
    for (let i = this.activeNumbers.length - 1; i >= 0; i--) {
      const num = this.activeNumbers[i];
      num.age += dt;
      num.y += num.vy * dt;
      num.vy = Math.max(0.5, num.vy - dt * 6.0);

      if (num.age >= num.maxAge) {
        this.activeNumbers.splice(i, 1);
      }
    }

    // Update floating musical notes
    for (let i = this.activeNotes.length - 1; i >= 0; i--) {
      const note = this.activeNotes[i];
      note.age += dt;
      note.y += note.vy * dt;
      note.vy = Math.max(0.8, note.vy - dt * 4.0);

      if (note.age >= note.maxAge) {
        this.activeNotes.splice(i, 1);
      }
    }

    // Screen shake trauma decay
    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - dt * 2.8);
      const shakeMag = this.trauma * this.trauma * this.maxShakeOffset;
      this.shakeOffset.set(
        (Math.random() - 0.5) * 2 * shakeMag,
        (Math.random() - 0.5) * 2 * shakeMag,
        (Math.random() - 0.5) * 2 * shakeMag
      );
    } else {
      this.shakeOffset.set(0, 0, 0);
    }
  }

  render2D(ctx, camera, width, height) {
    if (!ctx || !camera || this.activeNumbers.length === 0) return;

    ctx.save();
    ctx.font = 'bold 16px "Orbitron", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const num of this.activeNumbers) {
      this._projVec.set(num.x, num.y, num.z);
      this._projVec.project(camera);

      // Clip if behind camera
      if (this._projVec.z > 1.0) continue;

      const sx = (this._projVec.x * 0.5 + 0.5) * width;
      const sy = (-(this._projVec.y * 0.5) + 0.5) * height;

      const progress = num.age / num.maxAge;
      // Spring pop scale
      const scale = Math.sin(progress * Math.PI) * (num.isCrit ? 1.5 : 1.1) + 0.3;
      const alpha = Math.max(0, 1.0 - progress * 1.2);

      ctx.save();
      ctx.translate(sx, sy);
      ctx.scale(scale, scale);
      ctx.globalAlpha = alpha;

      const text = num.isCrit ? `${num.value} CRIT!` : `${num.value}`;

      // Text stroke
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000000';
      ctx.strokeText(text, 0, 0);

      // Text fill
      ctx.fillStyle = num.isCrit ? '#ff3366' : '#ffffff';
      if (num.isCrit) {
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 10;
      }
      ctx.fillText(text, 0, 0);

      ctx.restore();
    }

    // Render musical notes
    ctx.font = 'bold 22px monospace';
    for (const note of this.activeNotes) {
      this._projVec.set(note.x, note.y, note.z);
      this._projVec.project(camera);
      if (this._projVec.z > 1.0) continue;

      const sx = (this._projVec.x * 0.5 + 0.5) * width;
      const sy = (-(this._projVec.y * 0.5) + 0.5) * height;

      const progress = note.age / note.maxAge;
      const scale = 1.0 + Math.sin(progress * Math.PI) * 0.4;
      const alpha = Math.max(0, 1.0 - progress * 1.1);

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(note.rot + progress * 0.5);
      ctx.scale(scale, scale);
      ctx.globalAlpha = alpha;

      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000000';
      ctx.strokeText(note.symbol, 0, 0);

      ctx.fillStyle = '#ffd700';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.fillText(note.symbol, 0, 0);

      ctx.restore();
    }

    ctx.restore();
  }
}
