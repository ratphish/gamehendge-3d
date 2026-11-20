/**
 * Gamehendge 3D Survivor Mode Orchestration Manager
 * Loop, State Machine, XP Leveling, Card Drafting & Run Outcomes
 */

import * as THREE from './vendor/three.module.js';
import { SURVIVOR_CONFIG, xpNeededForLevel } from './combat/config-survivor.js';
import { SurvivorControls } from './combat/survivor-controls.js';
import { WeaponSystem } from './combat/weapons.js';
import { EnemyManager } from './combat/enemies.js';
import { GemManager } from './combat/gems.js';
import { CombatFX } from './combat/combat-fx.js';
import { ParticleEngine } from './combat/particles.js';
import { UpgradeManager } from './combat/upgrades.js';

export class SurvivorManager {
  constructor(scene, camera, domElement, world, audio) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;
    this.world = world;
    this.audio = audio;

    this.state = 'HERO_SELECT'; // 'HERO_SELECT' | 'PLAYING' | 'LEVEL_UP' | 'GAME_OVER' | 'VICTORY'
    this.selectedHeroId = 'forbin';

    this.player = {
      hp: 100,
      maxHp: 100,
      armor: 0,
      regen: 0,
      level: 1,
      xp: 0,
      xpNeeded: xpNeededForLevel(1),
      kills: 0,
      timer: 0,
      iFrameTimer: 0,
      magnetRadius: 10
    };

    // Subsystems
    this.combatFX = new CombatFX();
    this.particles = new ParticleEngine(this.scene);
    this.controls = new SurvivorControls(this.camera, this.domElement, this.world, this.particles, this.audio);
    this.weapons = new WeaponSystem(this.scene, this.combatFX, this.particles, this.audio);
    this.enemies = new EnemyManager(this.scene, this.world, this.combatFX, this.particles, this.audio);
    this.gems = new GemManager(this.scene, this.audio, this.particles);
    this.upgrades = new UpgradeManager();

    // 2D FX Canvas
    this.fxCanvas = document.getElementById('combat-fx-canvas');
    this.fxCtx = this.fxCanvas ? this.fxCanvas.getContext('2d') : null;

    this.setupCanvas();
    this.bindUI();
  }

  setupCanvas() {
    if (!this.fxCanvas) return;
    this.fxCanvas.width = window.innerWidth;
    this.fxCanvas.height = window.innerHeight;
  }

  bindUI() {
    // Hero select cards
    const heroCards = document.querySelectorAll('.hero-select-card');
    heroCards.forEach(card => {
      card.addEventListener('click', () => {
        heroCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedHeroId = card.dataset.hero;
      });
    });

    // Start run button
    const startRunBtn = document.getElementById('btn-start-run');
    if (startRunBtn) {
      startRunBtn.addEventListener('click', () => {
        this.startRun(this.selectedHeroId);
      });
    }

    // Play again buttons
    const restartBtns = document.querySelectorAll('.btn-restart-run');
    restartBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.resetRun();
        this.startRun(this.selectedHeroId);
      });
    });

    window.addEventListener('resize', () => {
      if (this.fxCanvas) {
        this.fxCanvas.width = window.innerWidth;
        this.fxCanvas.height = window.innerHeight;
      }
    });
  }

  openHeroSelect() {
    this.state = 'HERO_SELECT';
    const modal = document.getElementById('hero-select-modal');
    if (modal) modal.classList.add('active');
    const hud = document.getElementById('survivor-hud');
    if (hud) hud.classList.remove('active');
  }

  startRun(heroId) {
    this.selectedHeroId = heroId;
    const hero = SURVIVOR_CONFIG.heroes[heroId];

    this.controls.setHero(heroId);
    this.player.hp = hero.hp || 100;
    this.player.maxHp = hero.hp || 100;
    this.player.armor = hero.armor || 0;
    this.player.regen = hero.bonusRegen || 0;
    this.player.magnetRadius = hero.bonusMagnet ? 10 * (1 + hero.bonusMagnet) : 10;

    // Equip starting weapon
    this.weapons.equipWeapon(hero.startingWeapon);

    // Hide hero select, show survivor HUD
    const heroModal = document.getElementById('hero-select-modal');
    if (heroModal) heroModal.classList.remove('active');
    const survivorHud = document.getElementById('survivor-hud');
    if (survivorHud) survivorHud.classList.add('active');

    this.state = 'PLAYING';
    if (this.audio) {
      this.audio.selectTrack('sloth'); // Fast-paced battle groove
    }
  }

  resetRun() {
    this.player.level = 1;
    this.player.xp = 0;
    this.player.xpNeeded = xpNeededForLevel(1);
    this.player.kills = 0;
    this.player.timer = 0;
    this.player.iFrameTimer = 0;

    this.weapons.equippedWeapons.clear();
    this.weapons.equippedPassives.clear();
    this.weapons.activeProjectiles = [];

    // Clear active enemies
    for (const e of this.enemies.activeEnemies) {
      if (e.mesh && this.scene) this.scene.remove(e.mesh);
    }
    this.enemies.activeEnemies = [];
    this.enemies.hosemasterSpawned = false;
    this.enemies.wilsonSpawned = false;

    // Clear active gems
    for (const g of this.gems.activeGems) {
      g.destroy();
    }
    this.gems.activeGems = [];

    // Reset modals
    const gameOverModal = document.getElementById('game-over-modal');
    if (gameOverModal) gameOverModal.classList.remove('active');
    const victoryModal = document.getElementById('victory-modal');
    if (victoryModal) victoryModal.classList.remove('active');
  }

  update(delta, timeSec = 0) {
    if (this.state !== 'PLAYING') {
      if (this.fxCtx) {
        this.fxCtx.clearRect(0, 0, this.fxCanvas.width, this.fxCanvas.height);
      }
      return;
    }

    const dt = Math.min(0.1, delta);
    this.player.timer += dt;

    // 1. Controls & Player Physics
    const telem = this.controls.update(dt, timeSec);
    const playerPos = telem.position;

    // 2. Health Regen & i-frames
    if (this.player.regen > 0) {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + this.player.regen * dt);
    }
    if (this.player.iFrameTimer > 0) {
      this.player.iFrameTimer -= dt;
    }

    // 3. Weapons Update & Auto-Fire
    this.weapons.update(dt, playerPos, telem.heading, this.enemies.activeEnemies);

    // 4. Enemies Update & Spawning
    this.enemies.update(dt, playerPos, this.player.timer);

    // Check enemy deaths for XP gem drops & kills
    for (const e of this.enemies.activeEnemies) {
      if (e.isDead) {
        this.player.kills++;
        const tier = e.type === 'hosemaster' ? 'gold' : e.type === 'guard' ? 'purple' : 'cyan';
        this.gems.spawnGem(e.pos.x, e.pos.y, e.pos.z, tier);

        // If defeated Wilson -> Victory!
        if (e.type === 'wilson') {
          this.triggerVictory();
          return;
        }

        // If defeated Hosemaster -> Free 3-card draft chest!
        if (e.type === 'hosemaster') {
          this.triggerCardDraft(true);
        }
      }
    }

    // Check Enemy Contact Damage to Player
    if (this.player.iFrameTimer <= 0) {
      const contact = this.enemies.checkPlayerContact(playerPos, 1.4);
      if (contact.hit) {
        const effectiveDamage = Math.max(1, contact.damage - this.player.armor);
        this.player.hp = Math.max(0, this.player.hp - effectiveDamage);
        this.player.iFrameTimer = SURVIVOR_CONFIG.player.invulnDuration;

        this.combatFX.addScreenShake(0.35);
        if (this.audio) this.audio.playCombatSFX('hurt');

        if (this.player.hp <= 0) {
          this.triggerGameOver();
          return;
        }
      }
    }

    // 5. XP Gems Update & Magnet Physics
    const xpGained = this.gems.update(dt, playerPos, this.player.magnetRadius);
    if (xpGained > 0) {
      this.addXP(xpGained);
    }

    // 6. Visual Effects & Particles
    this.particles.update(dt);
    this.combatFX.update(dt);

    // Render 2D Damage Numbers
    if (this.fxCtx) {
      this.fxCtx.clearRect(0, 0, this.fxCanvas.width, this.fxCanvas.height);
      this.combatFX.render2D(this.fxCtx, this.camera, this.fxCanvas.width, this.fxCanvas.height);
    }

    // 7. Update HUD
    this.updateHUD();
  }

  addXP(amount) {
    this.player.xp += amount;
    if (this.player.xp >= this.player.xpNeeded) {
      this.player.xp -= this.player.xpNeeded;
      this.player.level++;
      this.player.xpNeeded = xpNeededForLevel(this.player.level);
      this.triggerCardDraft();
    }
  }

  triggerCardDraft(isChest = false) {
    this.state = 'LEVEL_UP';
    if (this.audio) this.audio.playCombatSFX('level_up');

    const modal = document.getElementById('card-draft-modal');
    const container = document.getElementById('draft-cards-container');
    const subtitle = document.getElementById('draft-subtitle');

    if (subtitle) {
      subtitle.innerText = isChest ? 'LEGENDARY HOSEMASTER REWARD' : `CHOOSE AN UPGRADE FOR LEVEL ${this.player.level}`;
    }

    if (modal && container) {
      container.innerHTML = '';
      const cards = this.upgrades.rollCardDraft(this.weapons.equippedWeapons, this.weapons.equippedPassives);

      cards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = `upgrade-card rarity-${card.rarity}`;
        cardEl.innerHTML = `
          <div class="card-icon">${card.icon || '⭐'}</div>
          <div class="card-name">${card.name}</div>
          <div class="card-lvl-badge">${card.type === 'consumable' ? 'INSTANT' : `LVL ${card.nextLevel}`}</div>
          <div class="card-desc">${card.desc}</div>
          <div class="card-rarity-tag">${card.rarity}</div>
        `;

        cardEl.addEventListener('click', () => {
          this.applyCardChoice(card);
          modal.classList.remove('active');
          this.state = 'PLAYING';
        });

        container.appendChild(cardEl);
      });

      modal.classList.add('active');
    }
  }

  applyCardChoice(card) {
    if (card.type === 'weapon') {
      this.weapons.upgradeWeapon(card.id);
    } else if (card.type === 'passive') {
      const curLvl = this.weapons.equippedPassives.get(card.id) || 0;
      const nextLvl = curLvl + 1;
      this.weapons.applyPassive(card.id, nextLvl);

      // Apply immediate passive stat modifications
      if (card.id === 'lizard_heart') {
        this.player.maxHp += 30;
        this.player.hp += 30;
        this.player.regen += 1.0;
      } else if (card.id === 'doughnut') {
        this.controls.baseSpeed = Math.round(this.controls.baseSpeed * 1.12);
        this.controls.slideSpeed = Math.round(this.controls.slideSpeed * 1.12);
      }
    } else if (card.type === 'consumable') {
      if (card.id === 'rations') {
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 35);
      } else if (card.id === 'bounty') {
        this.addXP(100);
      }
    }
  }

  triggerGameOver() {
    this.state = 'GAME_OVER';
    const modal = document.getElementById('game-over-modal');
    if (modal) {
      document.getElementById('go-time').innerText = this.formatTime(this.player.timer);
      document.getElementById('go-kills').innerText = `${this.player.kills}`;
      document.getElementById('go-level').innerText = `LVL ${this.player.level}`;
      modal.classList.add('active');
    }
  }

  triggerVictory() {
    this.state = 'VICTORY';
    if (this.audio) this.audio.playCombatSFX('level_up');
    const modal = document.getElementById('victory-modal');
    if (modal) {
      document.getElementById('vic-time').innerText = this.formatTime(this.player.timer);
      document.getElementById('vic-kills').innerText = `${this.player.kills}`;
      document.getElementById('vic-level').innerText = `LVL ${this.player.level}`;
      modal.classList.add('active');
    }
  }

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  updateHUD() {
    // XP Bar
    const pct = Math.min(100, Math.round((this.player.xp / this.player.xpNeeded) * 100));
    const xpFill = document.getElementById('survivor-xp-fill');
    const xpText = document.getElementById('survivor-xp-text');
    if (xpFill) xpFill.style.width = `${pct}%`;
    if (xpText) xpText.innerText = `LVL ${this.player.level} (${this.player.xp} / ${this.player.xpNeeded} XP)`;

    // Stats
    const timerEl = document.getElementById('survivor-timer');
    const killsEl = document.getElementById('survivor-kills');
    const hpBar = document.getElementById('player-hp-fill');
    const hpText = document.getElementById('player-hp-text');

    if (timerEl) timerEl.innerText = `⏱ ${this.formatTime(this.player.timer)}`;
    if (killsEl) killsEl.innerText = `💀 ${this.player.kills}`;

    if (hpBar) {
      const hpPct = Math.max(0, Math.min(100, (this.player.hp / this.player.maxHp) * 100));
      hpBar.style.width = `${hpPct}%`;
    }
    if (hpText) hpText.innerText = `HP: ${Math.round(this.player.hp)} / ${this.player.maxHp}`;

    // Weapon & Passive slots
    this.updateItemSlots();
  }

  updateItemSlots() {
    const wContainer = document.getElementById('weapon-slots-row');
    if (wContainer) {
      wContainer.innerHTML = '';
      for (const [id, w] of this.weapons.equippedWeapons.entries()) {
        const config = SURVIVOR_CONFIG.weapons[id];
        const slot = document.createElement('div');
        slot.className = 'item-slot filled';
        slot.innerHTML = `${config.icon}<span class="item-lvl-tag">${w.level}</span>`;
        wContainer.appendChild(slot);
      }
      for (let i = this.weapons.equippedWeapons.size; i < 4; i++) {
        const empty = document.createElement('div');
        empty.className = 'item-slot';
        wContainer.appendChild(empty);
      }
    }

    const pContainer = document.getElementById('passive-slots-row');
    if (pContainer) {
      pContainer.innerHTML = '';
      for (const [id, lvl] of this.weapons.equippedPassives.entries()) {
        const config = SURVIVOR_CONFIG.passives[id];
        const slot = document.createElement('div');
        slot.className = 'item-slot filled';
        slot.innerHTML = `${config.icon}<span class="item-lvl-tag">${lvl}</span>`;
        pContainer.appendChild(slot);
      }
      for (let i = this.weapons.equippedPassives.size; i < 4; i++) {
        const empty = document.createElement('div');
        empty.className = 'item-slot';
        pContainer.appendChild(empty);
      }
    }
  }
}
