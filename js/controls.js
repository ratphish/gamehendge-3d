/**
 * Gamehendge Neo-CD-i Dual Flight & Ground Controls
 * The Famous Mockingbird (Flight) & Colonel Forbin (Ground Walk)
 */

import * as THREE from './vendor/three.module.js';
import { GAMEHENDGE_CONFIG } from './config.js';

export class PlayerControls {
  constructor(camera, domElement, world, entities) {
    this.camera = camera;
    this.domElement = domElement;
    this.world = world;
    this.entities = entities;

    this.mode = 'flight'; // 'flight' | 'walk'
    this.cameraView = 'third'; // 'third' | 'first'

    this.position = new THREE.Vector3(0, 75, 40); // Initial spawn soaring near Mountain
    this.velocity = new THREE.Vector3(0, 0, -1);
    this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');

    this.pitch = -0.15;
    this.yaw = 0;
    this.roll = 0;

    // Flight variables
    this.speed = 28.0;
    this.minFlightSpeed = 14.0;
    this.maxFlightSpeed = 58.0;
    this.flightBoost = false;
    this.flightBrake = false;

    // Walk variables
    this.walkSpeed = 16.0;
    this.playerHeight = 1.8;
    this.verticalVelocity = 0;
    this.isGrounded = true;
    this.gravity = 38.0;
    this.jumpForce = 14.0;

    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      boost: false,
      brake: false
    };

    // Attach avatars
    if (this.entities) {
      if (this.entities.mockingbirdAvatar) {
        this.world.scene.add(this.entities.mockingbirdAvatar);
      }
      if (this.entities.forbinAvatar) {
        this.world.scene.add(this.entities.forbinAvatar);
      }
    }

    this.syncAvatarVisibility();
    this.bindEvents();
  }

  syncAvatarVisibility() {
    if (!this.entities) return;
    if (this.entities.mockingbirdAvatar) {
      this.entities.mockingbirdAvatar.visible = (this.mode === 'flight');
    }
    if (this.entities.forbinAvatar) {
      this.entities.forbinAvatar.visible = (this.mode === 'walk');
    }
  }

  setMode(newMode) {
    if (newMode === this.mode) return;
    this.mode = newMode;

    const rawTerrainY = this.world ? this.world.getTerrainHeight(this.position.x, this.position.z) : 0;
    const terrainY = Math.max(rawTerrainY, GAMEHENDGE_CONFIG.world.waterLevel - 0.2);

    if (this.mode === 'walk') {
      // Land on terrain
      this.position.y = terrainY + this.playerHeight;
      this.verticalVelocity = 0;
      this.pitch = 0;
      this.roll = 0;
    } else {
      // Take off into flight
      this.position.y = Math.max(this.position.y, terrainY + 12.0);
      this.speed = 26.0;
      this.pitch = 0.1;
    }

    this.syncAvatarVisibility();
  }

  toggleMode() {
    this.setMode(this.mode === 'flight' ? 'walk' : 'flight');
  }

  toggleCameraView() {
    this.cameraView = this.cameraView === 'third' ? 'first' : 'third';
  }

  bindEvents() {
    if (!this.domElement && typeof window === 'undefined') return;

    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));

    let isMouseDown = false;
    let prevMouseX = 0, prevMouseY = 0;

    if (this.domElement) {
      this.domElement.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      });

      window.addEventListener('mouseup', () => { isMouseDown = false; });

      window.addEventListener('mousemove', (e) => {
        if (!isMouseDown) return;
        const dx = e.clientX - prevMouseX;
        const dy = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;

        const sensitivity = 0.0035;
        this.yaw -= dx * sensitivity;
        this.pitch -= dy * sensitivity;
        this.pitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, this.pitch));
      });
    }
  }

  onKeyDown(e) {
    if (typeof document !== 'undefined') {
      const modal = document.getElementById('dossier-modal');
      if (modal && modal.classList.contains('active')) {
        return; // Pause control inputs while reading character dialogue
      }
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
        if (this.mode === 'walk') {
          this.keys.jump = true;
        } else {
          this.keys.boost = true;
        }
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        if (this.mode === 'flight') {
          this.keys.brake = true;
        }
        break;
      case 'KeyT':
        this.toggleMode();
        break;
      case 'KeyV':
        this.toggleCameraView();
        break;
    }
  }

  onKeyUp(e) {
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
        this.keys.boost = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keys.brake = false;
        break;
    }
  }

  update(delta, timeSec = 0) {
    const dt = Math.min(0.1, delta);

    if (this.mode === 'flight') {
      this.updateFlight(dt, timeSec);
    } else {
      this.updateWalk(dt, timeSec);
    }

    // World boundary damping
    const maxBound = GAMEHENDGE_CONFIG.world.boundaryDamping;
    if (this.position.x > maxBound) this.position.x = maxBound;
    if (this.position.x < -maxBound) this.position.x = -maxBound;
    if (this.position.z > maxBound) this.position.z = maxBound;
    if (this.position.z < -maxBound) this.position.z = -maxBound;

    // Update camera
    this.updateCamera();

    const terrainY = this.world ? this.world.getTerrainHeight(this.position.x, this.position.z) : 0;
    const altitude = Math.max(0, this.position.y - terrainY);

    return {
      position: this.position,
      heading: this.yaw,
      speed: this.mode === 'flight' ? this.speed : (this.keys.forward || this.keys.backward || this.keys.left || this.keys.right ? this.walkSpeed : 0),
      altitude: Math.round(altitude),
      mode: this.mode
    };
  }

  updateFlight(dt, timeSec) {
    // Flight steering
    const turnRate = 1.6;
    const pitchRate = 1.4;

    if (this.keys.left) {
      this.yaw += turnRate * dt;
      this.roll = THREE.MathUtils.lerp(this.roll, 0.45, dt * 4.0);
    } else if (this.keys.right) {
      this.yaw -= turnRate * dt;
      this.roll = THREE.MathUtils.lerp(this.roll, -0.45, dt * 4.0);
    } else {
      this.roll = THREE.MathUtils.lerp(this.roll, 0, dt * 3.5);
    }

    if (this.keys.forward) {
      this.pitch = Math.max(-1.1, this.pitch - pitchRate * dt);
    } else if (this.keys.backward) {
      this.pitch = Math.min(0.9, this.pitch + pitchRate * dt);
    }

    // Speed throttle
    if (this.keys.boost) {
      this.speed = THREE.MathUtils.lerp(this.speed, this.maxFlightSpeed, dt * 3.0);
    } else if (this.keys.brake) {
      this.speed = THREE.MathUtils.lerp(this.speed, this.minFlightSpeed, dt * 3.0);
    } else {
      this.speed = THREE.MathUtils.lerp(this.speed, 28.0, dt * 1.5);
    }

    // Direction vector from pitch and yaw
    const forward = new THREE.Vector3(
      -Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      -Math.cos(this.yaw) * Math.cos(this.pitch)
    ).normalize();

    this.position.addScaledVector(forward, this.speed * dt);

    // Altitude floor check
    const terrainY = this.world ? this.world.getTerrainHeight(this.position.x, this.position.z) : 0;
    const minFlightAlt = terrainY + 1.2;

    if (this.position.y < minFlightAlt) {
      this.position.y = minFlightAlt;
      this.pitch = Math.max(0, this.pitch);
      // Auto land if descending softly
      if (this.pitch <= 0.05 && this.speed < 22) {
        this.setMode('walk');
        return;
      }
    }

    // Mockingbird avatar update
    if (this.entities && this.entities.mockingbirdAvatar) {
      const bird = this.entities.mockingbirdAvatar;
      bird.position.copy(this.position);
      bird.rotation.set(this.pitch, this.yaw, this.roll, 'YXZ');
      if (bird.animate) {
        bird.animate(timeSec, this.speed / 24.0);
      }
    }
  }

  updateWalk(dt, timeSec) {
    const moveDir = new THREE.Vector3();

    if (this.keys.forward) moveDir.z -= 1;
    if (this.keys.backward) moveDir.z += 1;
    if (this.keys.left) moveDir.x -= 1;
    if (this.keys.right) moveDir.x += 1;

    const isMoving = moveDir.lengthSq() > 0;

    if (isMoving) {
      moveDir.normalize();
      // Rotate movement vector by player yaw
      moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

      const nextX = this.position.x + moveDir.x * this.walkSpeed * dt;
      const nextZ = this.position.z + moveDir.z * this.walkSpeed * dt;

      // Obstacle collision check with sliding response
      if (this.world) {
        if (!this.world.checkCollision(nextX, nextZ, 1.2)) {
          this.position.x = nextX;
          this.position.z = nextZ;
        } else if (!this.world.checkCollision(nextX, this.position.z, 1.2)) {
          this.position.x = nextX; // Slide along Z
        } else if (!this.world.checkCollision(this.position.x, nextZ, 1.2)) {
          this.position.z = nextZ; // Slide along X
        }
      }
    }

    // Jump and gravity physics
    const rawTerrainY = this.world ? this.world.getTerrainHeight(this.position.x, this.position.z) : 0;
    const terrainY = Math.max(rawTerrainY, GAMEHENDGE_CONFIG.world.waterLevel - 0.2);
    const groundLevel = terrainY + this.playerHeight;

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

    // Forbin avatar update
    if (this.entities && this.entities.forbinAvatar) {
      const forbin = this.entities.forbinAvatar;
      forbin.position.copy(this.position);
      forbin.rotation.y = this.yaw;
      if (forbin.animate) {
        forbin.animate(timeSec, isMoving);
      }
    }
  }

  updateCamera() {
    if (!this.camera) return;

    if (this.mode === 'flight') {
      if (this.cameraView === 'first') {
        this.camera.position.copy(this.position);
        this.camera.rotation.set(this.pitch, this.yaw, this.roll, 'YXZ');
      } else {
        // Third-person chase cam
        const offset = new THREE.Vector3(
          Math.sin(this.yaw) * 12.0,
          Math.sin(-this.pitch) * 4.0 + 4.5,
          Math.cos(this.yaw) * 12.0
        );
        this.camera.position.copy(this.position).add(offset);
        this.camera.lookAt(this.position.x, this.position.y + 1.2, this.position.z);
      }
    } else {
      // Walk mode camera
      if (this.cameraView === 'first') {
        this.camera.position.set(this.position.x, this.position.y + 1.2, this.position.z);
        this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
      } else {
        const dist = 7.5;
        const camX = this.position.x + Math.sin(this.yaw) * dist;
        const camZ = this.position.z + Math.cos(this.yaw) * dist;
        const camY = this.position.y + 3.2 - Math.sin(this.pitch) * 4.0;
        this.camera.position.set(camX, camY, camZ);
        this.camera.lookAt(this.position.x, this.position.y + 1.4, this.position.z);
      }
    }
  }
}
