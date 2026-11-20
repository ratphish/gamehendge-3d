/**
 * Gamehendge 3D Survivor Mode Dedicated Controls
 * High-Speed 3D Ground Movement & Downhill Slope Sliding Physics
 */

import * as THREE from '../vendor/three.module.js';
import { SURVIVOR_CONFIG } from './config-survivor.js';
import { createForbinModel } from '../entities.js';

export class SurvivorControls {
  constructor(camera, domElement, world, particles = null, audio = null, combatFX = null, scene = null) {
    this.camera = camera;
    this.domElement = domElement;
    this.world = world;
    this.particles = particles;
    this.audio = audio;
    this.combatFX = combatFX;
    this.scene = scene;

    this.avatar = null;
    if (this.scene) {
      try {
        this.avatar = createForbinModel(true);
        this.scene.add(this.avatar);
      } catch (e) {
        // Safe fallback in headless test runs
      }
    }

    this.selectedHero = 'forbin';
    this.baseSpeed = SURVIVOR_CONFIG.player.baseSpeed;
    this.slideSpeed = SURVIVOR_CONFIG.player.slideSpeed;
    this.playerHeight = 1.8;

    this.position = new THREE.Vector3(0, 8, 85);
    this.yaw = 0;
    this.pitch = 0.35; // Slight top-down isometric tilt

    this.verticalVelocity = 0;
    this.isGrounded = true;
    this.gravity = 36.0;
    this.jumpForce = SURVIVOR_CONFIG.player.baseSpeed * 0.65;

    this.isSliding = false;
    this.currentSpeed = this.baseSpeed;
    this.prevY = 0;

    // Dodge Dash
    this.isDashing = false;
    this.dashDuration = 0.25;
    this.dashTimer = 0;
    this.dashActiveTimer = 0;
    this.dashDirection = new THREE.Vector3(0, 0, -1);

    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false,
      slide: false,
      dash: false
    };

    this.setHero('forbin');
    this.bindEvents();
  }

  triggerDash() {
    if (this.dashTimer > 0) return false;

    this.isDashing = true;
    this.dashActiveTimer = this.dashDuration;
    this.dashTimer = 2.2;

    // Compute dash direction from keys or heading
    const moveDir = new THREE.Vector3();
    if (this.keys.forward) moveDir.z -= 1;
    if (this.keys.backward) moveDir.z += 1;
    if (this.keys.left) moveDir.x -= 1;
    if (this.keys.right) moveDir.x += 1;

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();
      moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
      this.dashDirection.copy(moveDir);
    } else {
      this.dashDirection.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw)).normalize();
    }

    if (this.audio) {
      this.audio.playCombatSFX('slide');
    }
    if (this.particles) {
      this.particles.spawnSlideDust(this.position.x, this.position.y, this.position.z, 8);
    }

    return true;
  }

  setHero(heroId) {
    const hero = SURVIVOR_CONFIG.heroes[heroId];
    if (!hero) return;
    this.selectedHero = heroId;

    let speed = SURVIVOR_CONFIG.player.baseSpeed;
    let slide = SURVIVOR_CONFIG.player.slideSpeed;

    if (hero.bonusSpeed) speed = Math.round(speed * (1 + hero.bonusSpeed));
    if (hero.bonusSlide) slide = Math.round(slide * (1 + hero.bonusSlide));

    this.baseSpeed = speed;
    this.slideSpeed = slide;

    if (this.avatar && hero.color) {
      this.avatar.traverse(child => {
        if (child.isMesh && child.material && child.material.color && child.geometry && child.geometry.type === 'CylinderGeometry') {
          child.material.color.setHex(hero.color);
        }
      });
    }
    this.currentSpeed = speed;
    this.gravity = hero.lowGravity ? 18.0 : 36.0;
  }

  bindEvents() {
    if (!this.domElement && typeof window === 'undefined') return;

    window.addEventListener('keydown', (e) => {
      // Pause inputs if card drafting modal is active
      if (typeof document !== 'undefined') {
        const modal = document.getElementById('card-draft-modal');
        if (modal && modal.classList.contains('active')) return;
      }

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = true;
          break;
        case 'Space':
          this.keys.jump = true;
          this.triggerDash();
          break;
        case 'KeyE':
        case 'KeyQ':
          this.triggerDash();
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
        case 'KeyC':
          this.keys.slide = true;
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = false;
          break;
        case 'Space':
          this.keys.jump = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
        case 'KeyC':
          this.keys.slide = false;
          break;
      }
    });

    // Mouse drag camera orbit
    let isMouseDown = false;
    let prevX = 0, prevY = 0;

    if (this.domElement) {
      this.domElement.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.triggerDash();
      });

      this.domElement.addEventListener('mousedown', (e) => {
        if (e.button === 2) {
          this.triggerDash();
          return;
        }
        isMouseDown = true;
        prevX = e.clientX;
        prevY = e.clientY;
      });
      window.addEventListener('mouseup', () => { isMouseDown = false; });
      window.addEventListener('mousemove', (e) => {
        if (!isMouseDown) return;
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        prevX = e.clientX;
        prevY = e.clientY;

        this.yaw -= dx * 0.004;
        this.pitch = Math.max(0.15, Math.min(0.85, this.pitch + dy * 0.003));
      });
    }
  }

  update(delta, timeSec = 0) {
    const dt = Math.min(5.0, delta);

    // Dash timer and active movement
    if (this.dashTimer > 0) {
      this.dashTimer = Math.max(0, this.dashTimer - dt);
    }

    if (this.isDashing) {
      this.dashActiveTimer -= dt;
      const dashSpeed = this.baseSpeed * 2.5;
      const nextX = this.position.x + this.dashDirection.x * dashSpeed * dt;
      const nextZ = this.position.z + this.dashDirection.z * dashSpeed * dt;
      this.position.x = nextX;
      this.position.z = nextZ;

      if (this.dashActiveTimer <= 0) {
        this.isDashing = false;
      }
    }

    const moveDir = new THREE.Vector3();

    if (this.keys.forward) moveDir.z -= 1;
    if (this.keys.backward) moveDir.z += 1;
    if (this.keys.left) moveDir.x -= 1;
    if (this.keys.right) moveDir.x += 1;

    const isMoving = moveDir.lengthSq() > 0;

    if (isMoving) {
      moveDir.normalize();
      moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

      // Downhill slope-sliding detection
      const currentTerrainY = this.world ? this.world.getTerrainHeight(this.position.x, this.position.z) : 0;
      const nextProbeX = this.position.x + moveDir.x * 2.0;
      const nextProbeZ = this.position.z + moveDir.z * 2.0;
      const nextTerrainY = this.world ? this.world.getTerrainHeight(nextProbeX, nextProbeZ) : 0;
      const isDownhill = (currentTerrainY - nextTerrainY) > 0.08;

      if (this.keys.slide && isDownhill) {
        this.isSliding = true;
        this.currentSpeed = THREE.MathUtils.lerp(this.currentSpeed, this.slideSpeed, dt * 5.0);

        if (this.particles && Math.random() < 0.6) {
          this.particles.spawnSlideDust(this.position.x, this.position.y, this.position.z, 2);
        }
      } else {
        this.isSliding = false;
        this.currentSpeed = THREE.MathUtils.lerp(this.currentSpeed, this.baseSpeed, dt * 6.0);
      }

      const nextX = this.position.x + moveDir.x * this.currentSpeed * dt;
      const nextZ = this.position.z + moveDir.z * this.currentSpeed * dt;

      // Obstacle sliding response
      if (this.world) {
        if (!this.world.checkCollision(nextX, nextZ, 1.2)) {
          this.position.x = nextX;
          this.position.z = nextZ;
        } else if (!this.world.checkCollision(nextX, this.position.z, 1.2)) {
          this.position.x = nextX;
        } else if (!this.world.checkCollision(this.position.x, nextZ, 1.2)) {
          this.position.z = nextZ;
        }
      } else {
        this.position.x = nextX;
        this.position.z = nextZ;
      }
    } else {
      this.isSliding = false;
      this.currentSpeed = this.baseSpeed;
    }

    // Arena circular boundary clamping
    const maxRadius = SURVIVOR_CONFIG.arena.radius;
    const distFromCenter = Math.hypot(this.position.x, this.position.z);
    if (distFromCenter > maxRadius) {
      const angle = Math.atan2(this.position.z, this.position.x);
      this.position.x = Math.cos(angle) * maxRadius;
      this.position.z = Math.sin(angle) * maxRadius;
    }

    // Jump & gravity physics
    const rawTerrainY = this.world ? this.world.getTerrainHeight(this.position.x, this.position.z) : 0;
    const groundLevel = rawTerrainY + this.playerHeight;

    if (this.isGrounded) {
      if (this.keys.jump) {
        this.verticalVelocity = this.jumpForce;
        this.isGrounded = false;
        this.keys.jump = false;
      } else {
        this.position.y = groundLevel;
        this.verticalVelocity = 0;
      }
    } else {
      this.verticalVelocity -= this.gravity * dt;
      this.position.y += this.verticalVelocity * dt;

      if (this.position.y <= groundLevel) {
        this.position.y = groundLevel;
        this.verticalVelocity = 0;
        this.isGrounded = true;
      }
    }

    // Avatar visual position & walk animation
    if (this.avatar) {
      this.avatar.position.set(this.position.x, rawTerrainY, this.position.z);
      this.avatar.rotation.y = this.yaw + Math.PI;
      if (this.avatar.animate) {
        this.avatar.animate(timeSec, isMoving || this.isSliding);
      }
    }

    // Camera follow (isometric-tilt chase cam with screen shake)
    this.updateCamera();

    return {
      position: this.position,
      heading: this.yaw,
      isSliding: this.isSliding,
      currentSpeed: this.currentSpeed,
      isDashing: this.isDashing,
      isInvulnerable: this.isDashing,
      dashCooldownProgress: Math.max(0, this.dashTimer / 2.2)
    };
  }

  updateCamera() {
    if (!this.camera) return;
    const dist = 14.0;
    let camX = this.position.x + Math.sin(this.yaw) * dist * Math.cos(this.pitch);
    let camZ = this.position.z + Math.cos(this.yaw) * dist * Math.cos(this.pitch);
    let camY = this.position.y + dist * Math.sin(this.pitch) + 2.0;

    if (this.combatFX && this.combatFX.shakeOffset) {
      camX += this.combatFX.shakeOffset.x;
      camY += this.combatFX.shakeOffset.y;
    }

    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(this.position.x, this.position.y + 1.4, this.position.z);
  }
}
