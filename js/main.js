/**
 * Gamehendge Neo-CD-i 3D Virtual Reality Experience
 * Main Application Lifecycle & Render Loop
 */

import * as THREE from './vendor/three.module.js';
import { GameAudioEngine } from './audio.js';
import { GameWorld } from './world.js';
import { EntityManager } from './entities.js';
import { PlayerControls } from './controls.js';
import { GameUI } from './ui.js';

class GamehendgeApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.clock = new THREE.Clock();
    this.isStarted = false;

    this.initScene();
    this.initSystems();
    this.bindStartScreen();
    this.bindWindowResize();
  }

  initScene() {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a1420);

    // 2. Camera
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(65, aspect, 0.5, 1200);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    if (this.container) {
      this.container.appendChild(this.renderer.domElement);
    }
  }

  initSystems() {
    // Procedural Audio Engine
    this.audio = new GameAudioEngine();

    // Procedural 3D World (terrain, biomes, landmarks, lighting)
    this.world = new GameWorld(this.scene);

    // Procedural 3D Characters & Avatars
    this.entities = new EntityManager(this.scene, this.world);

    // Flight & Ground Controls
    this.controls = new PlayerControls(this.camera, this.renderer.domElement, this.world, this.entities);

    // Neo-CD-i HUD, Minimap Radar & Dialogues
    this.ui = new GameUI(this.audio, this.controls, this.entities);
  }

  bindStartScreen() {
    const splash = document.getElementById('splash-screen');
    const startBtn = document.getElementById('btn-insert-disc');

    if (startBtn && splash) {
      startBtn.addEventListener('click', async () => {
        if (this.isStarted) return;
        this.isStarted = true;
        startBtn.disabled = true;

        // Unlock browser audio context cleanly on click
        await this.audio.init();

        // Fade out splash screen
        splash.style.transition = 'opacity 0.6s ease';
        splash.style.opacity = '0';
        setTimeout(() => {
          splash.style.display = 'none';
        }, 600);

        this.clock.start();
        this.animate();
      });
    }
  }

  bindWindowResize() {
    window.addEventListener('resize', () => {
      if (!this.camera || !this.renderer) return;
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      if (this.ui) {
        this.ui.setupRadarCanvas();
      }
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const timeSec = this.clock.getElapsedTime();

    // 1. Controls & Player Physics
    const telemetry = this.controls.update(delta, timeSec);

    // 2. Spatial Biome Audio Update
    this.audio.updateSpatialAudio(telemetry.position.x, telemetry.position.z);

    // 3. World & Landmarks Procedural Animation (water, fire, Book)
    this.world.update(delta, timeSec);

    // 4. Character Animations
    this.entities.update(delta, telemetry.position, timeSec);

    // 5. HUD, Telemetry & Minimap
    this.ui.update(telemetry);

    // 6. Three.js Render Pass
    this.renderer.render(this.scene, this.camera);
  }
}

// Bootstrap once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new GamehendgeApp();
});
