/**
 * Gamehendge Neo-CD-i 3D Virtual Reality Experience
 * Main Application Lifecycle, Mode Switcher & Render Loop
 */

import * as THREE from './vendor/three.module.js';
import { GameAudioEngine } from './audio.js';
import { GameWorld } from './world.js';
import { EntityManager } from './entities.js';
import { PlayerControls } from './controls.js';
import { GameUI } from './ui.js';
import { SurvivorManager } from './survivor-manager.js';

class GamehendgeApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.clock = new THREE.Clock();
    this.isStarted = false;
    this.currentMode = 'tour'; // 'tour' | 'survivor'

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

    // Procedural 3D Characters & Avatars (used in Tour Mode)
    this.entities = new EntityManager(this.scene, this.world);

    // Flight & Ground Controls (used in Tour Mode)
    this.controls = new PlayerControls(this.camera, this.renderer.domElement, this.world, this.entities);

    // Neo-CD-i HUD, Minimap Radar & Dialogues (used in Tour Mode)
    this.ui = new GameUI(this.audio, this.controls, this.entities);

    // High-Polish Survivor Mode Manager
    this.survivor = new SurvivorManager(this.scene, this.camera, this.renderer.domElement, this.world, this.audio);
  }

  bindStartScreen() {
    const splash = document.getElementById('splash-screen');
    const startTourBtn = document.getElementById('btn-insert-disc');
    const startSurvivorBtn = document.getElementById('btn-mode-survivor');

    // Launch 1993 Explorer Tour Mode
    if (startTourBtn && splash) {
      startTourBtn.addEventListener('click', async () => {
        if (this.isStarted) return;
        this.isStarted = true;
        this.currentMode = 'tour';

        await this.audio.init();

        const tourHud = document.getElementById('hud-overlay');
        if (tourHud) tourHud.style.display = 'flex';

        this.fadeOutSplash(splash);
        this.clock.start();
        this.animate();
      });
    }

    // Launch 3D Survivor Mode (Megabonk Roguelike)
    if (startSurvivorBtn && splash) {
      startSurvivorBtn.addEventListener('click', async () => {
        if (this.isStarted) return;
        this.isStarted = true;
        this.currentMode = 'survivor';

        await this.audio.init();

        this.fadeOutSplash(splash);
        this.survivor.openHeroSelect();
        this.clock.start();
        this.animate();
      });
    }
  }

  fadeOutSplash(splash) {
    splash.style.transition = 'opacity 0.6s ease';
    splash.style.opacity = '0';
    setTimeout(() => {
      splash.style.display = 'none';
    }, 600);
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

    if (this.currentMode === 'survivor') {
      // High-Polish 3D Survivor Mode Loop
      this.survivor.update(delta, timeSec);
      this.world.update(delta, timeSec);
    } else {
      // 1993 Virtual Reality Explorer Tour Loop
      const telemetry = this.controls.update(delta, timeSec);
      this.audio.updateSpatialAudio(telemetry.position.x, telemetry.position.z);
      this.world.update(delta, timeSec);
      this.entities.update(delta, telemetry.position, timeSec);
      this.ui.update(telemetry);
    }

    // Three.js Render Pass
    this.renderer.render(this.scene, this.camera);
  }
}

// Bootstrap once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new GamehendgeApp();
});
