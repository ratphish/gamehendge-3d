/**
 * Gamehendge Neo-CD-i HUD, Minimap Radar & Dialogue UI Manager
 */

import { GAMEHENDGE_CONFIG } from './config.js';

export class GameUI {
  constructor(audio, controls, entities) {
    this.audio = audio;
    this.controls = controls;
    this.entities = entities;

    this.radarCanvas = document.getElementById('radar-canvas');
    this.radarCtx = this.radarCanvas ? this.radarCanvas.getContext('2d') : null;

    this.telemMode = document.getElementById('telem-mode');
    this.telemAlt = document.getElementById('telem-alt');
    this.telemSpeed = document.getElementById('telem-speed');
    this.telemZone = document.getElementById('telem-zone');

    this.trackTitle = document.getElementById('track-title');
    this.trackStatus = document.getElementById('track-status');
    this.trackMeta = document.getElementById('track-meta');
    this.discIndicator = document.getElementById('disc-indicator');

    this.proximityPrompt = document.getElementById('proximity-prompt');
    this.dossierModal = document.getElementById('dossier-modal');
    this.crtActive = false;
    this.currentNearbyCharacter = null;

    this.setupRadarCanvas();
    this.bindButtons();
  }

  setupRadarCanvas() {
    if (!this.radarCanvas) return;
    const dpr = window.devicePixelRatio || 1;
    this.radarCanvas.width = 170 * dpr;
    this.radarCanvas.height = 170 * dpr;
  }

  bindButtons() {
    // Mode toggle button
    const btnMode = document.getElementById('btn-mode-toggle');
    if (btnMode) {
      btnMode.addEventListener('click', () => {
        this.controls.toggleMode();
      });
    }

    // CRT filter toggle
    const btnCrt = document.getElementById('btn-crt-toggle');
    if (btnCrt) {
      btnCrt.addEventListener('click', () => {
        this.toggleCRT();
      });
    }

    // CD-i Deck Controls
    const btnPlay = document.getElementById('deck-btn-play');
    if (btnPlay) {
      btnPlay.addEventListener('click', () => {
        const playing = this.audio.togglePlay();
        btnPlay.innerText = playing ? 'PAUSE' : 'PLAY';
        if (this.discIndicator) {
          this.discIndicator.classList.toggle('paused', !playing);
        }
      });
    }

    const btnNext = document.getElementById('deck-btn-next');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        this.audio.nextTrack();
        this.updateTrackInfo();
      });
    }

    const btnPrev = document.getElementById('deck-btn-prev');
    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        this.audio.prevTrack();
        this.updateTrackInfo();
      });
    }

    const btnAuto = document.getElementById('deck-btn-auto');
    if (btnAuto) {
      btnAuto.addEventListener('click', () => {
        const newMode = this.audio.mode === 'auto' ? 'manual' : 'auto';
        this.audio.setMode(newMode);
        btnAuto.innerText = newMode === 'auto' ? 'AUTO: ON' : 'AUTO: OFF';
        btnAuto.classList.toggle('active', newMode === 'auto');
        this.updateTrackInfo();
      });
    }

    // Proximity prompt click / press E
    if (this.proximityPrompt) {
      this.proximityPrompt.addEventListener('click', () => {
        if (this.currentNearbyCharacter) {
          this.showDialogue(this.currentNearbyCharacter);
        }
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyE') {
        if (this.currentNearbyCharacter && (!this.dossierModal || !this.dossierModal.classList.contains('active'))) {
          this.showDialogue(this.currentNearbyCharacter);
        }
      } else if (e.code === 'Escape') {
        this.hideDialogue();
      }
    });

    const closeBtn = document.getElementById('dossier-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hideDialogue());
    }
  }

  toggleCRT() {
    this.crtActive = !this.crtActive;
    document.body.classList.toggle('crt-active', this.crtActive);
    const btnCrt = document.getElementById('btn-crt-toggle');
    if (btnCrt) {
      btnCrt.classList.toggle('active', this.crtActive);
    }
  }

  updateTrackInfo() {
    const info = this.audio.getCurrentTrackInfo();
    if (this.trackTitle) this.trackTitle.innerText = info.title;
    if (this.trackStatus) this.trackStatus.innerText = info.mode === 'auto' ? 'SPATIAL AUDIO: ACTIVE' : 'CD-I TRACK LOCKED';
    if (this.trackMeta) this.trackMeta.innerText = `TEMPO: ${info.bpm} BPM | 16-BIT SYNTH`;
  }

  update(telemetry) {
    // 1. Update Telemetry HUD
    if (this.telemMode) {
      this.telemMode.innerText = telemetry.mode === 'flight' ? 'MOCKINGBIRD FLIGHT' : 'FORBIN WALK';
      this.telemMode.className = `telem-val mode-${telemetry.mode}`;
    }
    if (this.telemAlt) this.telemAlt.innerText = `${telemetry.altitude} FT`;
    if (this.telemSpeed) this.telemSpeed.innerText = `${Math.round(telemetry.speed)} KTS`;

    // Biome determination
    const closestTheme = this.audio.getClosestBiomeTheme(telemetry.position.x, telemetry.position.z);
    if (this.telemZone) {
      const zoneTitles = {
        forbin: 'MOUNTAIN OF ICCULUS',
        lizards: 'THE SACRED FOREST',
        sloth: 'THE GHETTO',
        wilson: "WILSON'S FORTRESS"
      };
      this.telemZone.innerText = zoneTitles[closestTheme] || 'GAMEHENDGE';
    }

    this.updateTrackInfo();

    // 2. Render Live Radar Minimap
    this.renderRadar(telemetry);

    // 3. Check Character Proximity
    this.checkProximity(telemetry.position);
  }

  checkProximity(playerPos) {
    if (!this.entities) return;
    const nearby = this.entities.getNearbyCharacter(playerPos, 16);
    this.currentNearbyCharacter = nearby;

    if (nearby && this.proximityPrompt) {
      this.proximityPrompt.style.display = 'block';
      this.proximityPrompt.innerText = `[E] COMMUNICATE WITH ${nearby.config.name.toUpperCase()}`;
    } else if (this.proximityPrompt) {
      this.proximityPrompt.style.display = 'none';
    }
  }

  renderRadar(telemetry) {
    if (!this.radarCtx) return;
    const ctx = this.radarCtx;
    const dpr = window.devicePixelRatio || 1;
    const w = 170 * dpr;
    const h = 170 * dpr;
    const cx = w / 2;
    const cy = h / 2;
    const scale = (w * 0.42) / 300; // Map 300 units to radius

    ctx.clearRect(0, 0, w, h);

    // Radar circular background & reticle
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, cx - 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(10, 20, 32, 0.85)';
    ctx.fill();
    ctx.strokeStyle = '#50e3c2';
    ctx.lineWidth = 1.5 * dpr;
    ctx.stroke();

    // Concentric range rings
    [0.33, 0.66, 1.0].forEach((rFactor) => {
      ctx.beginPath();
      ctx.arc(cx, cy, (cx - 6) * rFactor, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(80, 227, 194, 0.2)';
      ctx.stroke();
    });

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(cx, 4);
    ctx.lineTo(cx, h - 4);
    ctx.moveTo(4, cy);
    ctx.lineTo(w - 4, cy);
    ctx.strokeStyle = 'rgba(80, 227, 194, 0.25)';
    ctx.stroke();

    // Draw Biome Landmark Markers
    for (const [key, b] of Object.entries(GAMEHENDGE_CONFIG.biomes)) {
      const bx = cx + b.x * scale;
      const bz = cy + b.z * scale;

      ctx.beginPath();
      ctx.arc(bx, bz, 4 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = key === 'castle' ? '#ff3366' : key === 'mountain' ? '#ffd700' : key === 'forest' ? '#39ff14' : '#00e5ff';
      ctx.fill();
    }

    // Draw Character Blips
    if (this.entities) {
      for (const char of this.entities.characters.values()) {
        const chx = cx + char.group.position.x * scale;
        const chz = cy + char.group.position.z * scale;
        ctx.beginPath();
        ctx.arc(chx, chz, 2.5 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
    }

    // Draw Player Arrow
    const px = cx + telemetry.position.x * scale;
    const pz = cy + telemetry.position.z * scale;
    const heading = telemetry.heading;

    ctx.save();
    ctx.translate(px, pz);
    ctx.rotate(-heading);

    ctx.beginPath();
    ctx.moveTo(0, -6 * dpr);
    ctx.lineTo(4 * dpr, 6 * dpr);
    ctx.lineTo(0, 4 * dpr);
    ctx.lineTo(-4 * dpr, 6 * dpr);
    ctx.closePath();
    ctx.fillStyle = telemetry.mode === 'flight' ? '#50e3c2' : '#ffd700';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1 * dpr;
    ctx.stroke();

    ctx.restore();
    ctx.restore();
  }

  showDialogue(character) {
    if (!this.dossierModal) return;
    const config = character.config;

    const nameEl = document.getElementById('dossier-name');
    const titleEl = document.getElementById('dossier-title');
    const quoteEl = document.getElementById('dossier-quote');
    const bodyEl = document.getElementById('dossier-body');
    const choicesEl = document.getElementById('dossier-choices');

    if (nameEl) nameEl.innerText = config.name;
    if (titleEl) titleEl.innerText = config.title;
    if (quoteEl) quoteEl.innerText = `"${config.quote}"`;
    if (bodyEl) bodyEl.innerText = config.dialogue;

    if (choicesEl) {
      choicesEl.innerHTML = '';
      (config.choices || []).forEach((choice) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerText = `▶ ${choice.label}`;
        btn.addEventListener('click', () => {
          this.handleChoiceAction(choice.action);
        });
        choicesEl.appendChild(btn);
      });
    }

    this.dossierModal.classList.add('active');
    this.audio.playSting('ui_blip');
  }

  handleChoiceAction(action) {
    switch (action) {
      case 'takeoff':
        this.controls.setMode('flight');
        this.hideDialogue();
        break;
      case 'walk_forbin':
        this.controls.setMode('walk');
        this.hideDialogue();
        break;
      case 'wilson_chant':
        this.audio.playSting('wilson_chant');
        break;
      case 'read_book':
        this.audio.playSting('read_book');
        break;
      case 'sloth_contract':
        this.audio.playSting('sloth_contract');
        break;
      case 'audio_mockingbird':
        this.audio.selectTrack('mockingbird');
        this.updateTrackInfo();
        break;
      case 'close':
      default:
        this.hideDialogue();
        break;
    }
  }

  hideDialogue() {
    if (this.dossierModal) {
      this.dossierModal.classList.remove('active');
    }
  }
}
