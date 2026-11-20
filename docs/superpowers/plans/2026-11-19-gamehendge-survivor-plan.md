# Gamehendge 3D "Megabonk" Survivor Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a high-polish, fast-paced 3D action roguelike horde survivor mode ("Megabonk" style) in Gamehendge, featuring auto-firing Phish weaponry, 3D downhill slope-sliding, glowing additive particle effects, floating 60 FPS damage numbers, XP gems, holographic level-up card drafting, and boss battles with The Watchful Hosemaster and King Wilson.

**Architecture:** An isolated combat engine package in `js/combat/` that plugs cleanly into the existing Gamehendge 3D world. Pure combat logic (XP formulas, weapon cooldowns, enemy scaling, upgrade drafting) is decoupled from Three.js scene graphs for 100% headless Node.js testing. High-performance rendering uses a 2D canvas overlay for spring-animated damage numbers and an instanced additive Three.js particle pool for crystalline death shatters and slide dust. A title screen mode switcher preserves both the 1993 Explorer Tour and the new Survivor Mode.

**Tech Stack:** HTML5, CSS3, Three.js (r128), Web Audio API, Vanilla ES6 JavaScript, Node.js test runner.

**Spec:** [docs/superpowers/specs/2026-11-19-gamehendge-survivor-mode-design.md](file:///d:/gamehenge/docs/superpowers/specs/2026-11-19-gamehendge-survivor-mode-design.md)

## Global Constraints
- **Preserve Explorer Mode**: All 21 existing unit tests in `tests/*.test.js` must remain green; the original 1993 VR Tour must remain fully functional.
- **Zero External Assets**: All weapons, enemies, particles, damage numbers, and sound effects are procedurally generated in code.
- **60 FPS Performance Floor**: Active enemy cap of 60 simultaneous units; particle and projectile pooling with zero per-frame garbage collection.
- **Headless Testability**: All combat formulas and state machines must be testable via `node --test` without requiring a browser DOM or WebGL context.

## Review Focus
1. Player invulnerability frame (i-frame) flickering and contact damage cooldown preventing instant death on horde swarming.
2. Downhill slope-sliding momentum calculations preventing clipping into steep mountain terrain geometry.
3. Card draft pool exclusion when all 4 weapon or 4 passive slots are occupied, or when items reach maximum level.
4. Active enemy cap (60) strictly enforced so performance does not degrade on low-spec hardware.
5. Time-stop during level-up card selection freezing enemy movement, timers, and weapon cooldowns while keeping UI responsive.

---

### Task 1: Roguelike Formulas, Configuration & Upgrades Database

**Files:**
- Create: `js/combat/config-survivor.js`
- Create: `js/combat/upgrades.js`
- Create: `tests/survivor-upgrades.test.js`

**Interfaces:**
- Produces: `SURVIVOR_CONFIG`, `xpNeededForLevel(level: number): number`, `UpgradeManager` class with `rollCardDraft(currentWeapons, currentPassives): Array<UpgradeCard>`.

- [ ] **Step 1: Write unit tests for XP curve, weapon/passive progression, and card drafting**
- [ ] **Step 2: Run test to verify it fails**
`node tests/survivor-upgrades.test.js`
Expected: FAIL (modules not found)
- [ ] **Step 3: Implement `config-survivor.js` and `upgrades.js`**
- [ ] **Step 4: Run test to verify it passes**
`node tests/survivor-upgrades.test.js`
Expected: PASS
- [ ] **Step 5: Commit**
`git add js/combat/config-survivor.js js/combat/upgrades.js tests/survivor-upgrades.test.js`
`git commit -m "feat(survivor): implement core formulas, weapon stats and upgrade card drafting"`

---

### Task 2: Procedural Combat Sound Effects Engine

**Files:**
- Modify: `js/audio.js`
- Create: `tests/survivor-audio.test.js`

**Interfaces:**
- Consumes: `GameAudioEngine`
- Produces: `playCombatSFX(type: 'shot' | 'hit' | 'gem' | 'level_up' | 'hurt' | 'boss_alert'): void`

- [ ] **Step 1: Write unit tests verifying combat SFX triggers and synthesis parameters**
- [ ] **Step 2: Run test to verify it fails**
`node tests/survivor-audio.test.js`
Expected: FAIL
- [ ] **Step 3: Implement combat sound synthesis in `js/audio.js`**
Add snappy procedural sounds for projectile fire, impacts, ascending gem chimes, level-up brass fanfare, player hurt, and boss warnings.
- [ ] **Step 4: Run test to verify it passes**
`node tests/survivor-audio.test.js`
Expected: PASS
- [ ] **Step 5: Commit**
`git add js/audio.js tests/survivor-audio.test.js`
`git commit -m "feat(survivor): add procedural Web Audio combat sound effects"`

---

### Task 3: Visual Juice Engine: Floating Damage Numbers & Additive Particles

**Files:**
- Create: `js/combat/combat-fx.js`
- Create: `js/combat/particles.js`
- Create: `tests/survivor-fx.test.js`

**Interfaces:**
- Produces: `CombatFX` (damage numbers, screen shake), `ParticleEngine` (death crystal shards, slide dust, projectile trails).

- [ ] **Step 1: Write tests for damage number lifecycle, spring physics, and screen shake trauma decay**
- [ ] **Step 2: Run test to verify it fails**
`node tests/survivor-fx.test.js`
Expected: FAIL
- [ ] **Step 3: Implement `combat-fx.js` and `particles.js`**
Build 2D canvas damage number renderer with spring pop, and Three.js pooled additive particle system for explosions and slope slide dust.
- [ ] **Step 4: Run test to verify it passes**
`node tests/survivor-fx.test.js`
Expected: PASS
- [ ] **Step 5: Commit**
`git add js/combat/combat-fx.js js/combat/particles.js tests/survivor-fx.test.js`
`git commit -m "feat(survivor): implement floating damage numbers, screenshake and particle systems"`

---

### Task 4: Auto-Firing Weapons System & Projectile Pooling

**Files:**
- Create: `js/combat/weapons.js`
- Create: `tests/survivor-weapons.test.js`

**Interfaces:**
- Consumes: `SURVIVOR_CONFIG`, `CombatFX`, `ParticleEngine`
- Produces: `WeaponSystem` managing all 7 weapons, projectile pooling, auto-targeting, and collision checks.

- [ ] **Step 1: Write tests for weapon auto-targeting, cooldowns, and damage calculations**
- [ ] **Step 2: Run test to verify it fails**
`node tests/survivor-weapons.test.js`
Expected: FAIL
- [ ] **Step 3: Implement `weapons.js`**
Build 7 auto-firing Phish weapons (Pilgrim Staff, Rebel Bow, Whirlwind Spear, Friendly Runes, Divided Sky Lightning, Electrolux Vortex, Sloth's Cleaver) with visual projectiles and collision hitboxes.
- [ ] **Step 4: Run test to verify it passes**
`node tests/survivor-weapons.test.js`
Expected: PASS
- [ ] **Step 5: Commit**
`git add js/combat/weapons.js tests/survivor-weapons.test.js`
`git commit -m "feat(survivor): implement auto-firing Phish weapons arsenal and projectile pooling"`

---

### Task 5: Enemy Horde Spawner, AI Pathing & Boss Encounters

**Files:**
- Create: `js/combat/enemies.js`
- Create: `tests/survivor-enemies.test.js`

**Interfaces:**
- Consumes: `SURVIVOR_CONFIG`, `GameWorld`
- Produces: `EnemyManager` managing Foot Soldiers, Multibeasts, Royal Guards, The Watchful Hosemaster (05:00), and King Wilson (10:00).

- [ ] **Step 1: Write tests for enemy wave timers, active enemy cap (60), HP scaling, and boss spawn conditions**
- [ ] **Step 2: Run test to verify it fails**
`node tests/survivor-enemies.test.js`
Expected: FAIL
- [ ] **Step 3: Implement `enemies.js`**
Build procedural 3D models for all 3 enemy types and 2 bosses; implement spatial pathing toward player, hit-flash shaders, knockback, and boss attack patterns.
- [ ] **Step 4: Run test to verify it passes**
`node tests/survivor-enemies.test.js`
Expected: PASS
- [ ] **Step 5: Commit**
`git add js/combat/enemies.js tests/survivor-enemies.test.js`
`git commit -m "feat(survivor): implement enemy horde spawner, scaling waves and boss encounters"`

---

### Task 6: Flow XP Gems & Magnetic Collection Physics

**Files:**
- Create: `js/combat/gems.js`
- Create: `tests/survivor-gems.test.js`

**Interfaces:**
- Consumes: `SURVIVOR_CONFIG`
- Produces: `GemManager` managing pooled 3D Flow Gems (Cyan, Purple, Gold), magnetic pickup attraction, and XP delivery to player.

- [ ] **Step 1: Write tests for gem drop tiers, magnet radius pull acceleration, and XP collection**
- [ ] **Step 2: Run test to verify it fails**
`node tests/survivor-gems.test.js`
Expected: FAIL
- [ ] **Step 3: Implement `gems.js`**
Build pooled glowing 3D octahedron Flow Gems with floating bob animation, magnetic acceleration when within player pickup radius, and pickup sound triggers.
- [ ] **Step 4: Run test to verify it passes**
`node tests/survivor-gems.test.js`
Expected: PASS
- [ ] **Step 5: Commit**
`git add js/combat/gems.js tests/survivor-gems.test.js`
`git commit -m "feat(survivor): implement Flow XP gems and magnetic collection physics"`

---

### Task 7: Survivor Controls (Downhill Slope Sliding) & 4 Hero Avatars

**Files:**
- Create: `js/combat/survivor-controls.js`
- Create: `tests/survivor-controls.test.js`

**Interfaces:**
- Consumes: `GameWorld`, `EntityManager`
- Produces: `SurvivorControls` with downhill slope slide physics (`Shift`), jumping, camera chase orbit, and 200m arena boundary soft damping.

- [ ] **Step 1: Write tests for slope sliding momentum acceleration, terrain clamping, and arena boundary barrier**
- [ ] **Step 2: Run test to verify it fails**
`node tests/survivor-controls.test.js`
Expected: FAIL
- [ ] **Step 3: Implement `survivor-controls.js`**
Build dedicated survivor controller with fast strafing, jumping, downhill slope-sliding momentum, camera follow, and dust particle trail spawning.
- [ ] **Step 4: Run test to verify it passes**
`node tests/survivor-controls.test.js`
Expected: PASS
- [ ] **Step 5: Commit**
`git add js/combat/survivor-controls.js tests/survivor-controls.test.js`
`git commit -m "feat(survivor): implement downhill slope-sliding controls and arena boundary"`

---

### Task 8: Survivor HUD, Holographic Card Drafting UI, Mode Switcher & Integration

**Files:**
- Create: `css/survivor.css`
- Create: `js/survivor-manager.js`
- Modify: `index.html`
- Modify: `js/main.js`
- Modify: `README.md`

**Interfaces:**
- Consumes: All combat modules (`config-survivor.js`, `weapons.js`, `enemies.js`, `gems.js`, `upgrades.js`, `survivor-controls.js`, `combat-fx.js`)
- Produces: Complete playable Survivor Mode with dual-mode title screen selector, character selection modal, level-up card drafting, and game over / victory recap.

- [ ] **Step 1: Implement `survivor.css` and HUD elements in `index.html`**
Build high-polish Survivor HUD: XP progress bar, survival timer, kill counter, equipped weapon/passive slots, holographic 3D tilt cards, and Game Over / Victory modals.
- [ ] **Step 2: Implement `survivor-manager.js` and integrate in `js/main.js`**
Connect mode switcher on title screen, hero selection modal, time-stop level-up drafting loop, and game loop orchestration.
- [ ] **Step 3: Run full automated test suite (existing + survivor tests)**
`npm test`
Expected: ALL PASS
- [ ] **Step 4: Launch local test server and visually verify Survivor Mode in browser**
Verify character selection, movement and downhill sliding, weapon auto-attacks, damage numbers, enemy hordes, XP gems, level-up card selection, and 60 FPS performance.
- [ ] **Step 5: Commit**
`git add index.html css/survivor.css js/survivor-manager.js js/main.js README.md`
`git commit -m "feat(survivor): complete Gamehendge 3D Megabonk Survivor Mode integration"`
