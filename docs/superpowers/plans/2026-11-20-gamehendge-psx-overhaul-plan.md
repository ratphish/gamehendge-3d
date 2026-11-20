# Gamehendge 3D "PSX" PlayStation 1 Visual & Gameplay Overhaul Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul Gamehendge 3D into an authentic PlayStation 1 (PSX) action roguelike with 320x240 affine vertex jitter, 16-bit Bayer color dithering, procedural chunky 32x32 pixel textures, Sacred Forest trees and stone ruins, weapon slash ribbons, active dodge rolls with i-frames, and in-run RPG story objectives.

**Architecture:** A dedicated `PSXPostProcessor` module in `js/graphics/` manages low-res rendering and Bayer dithering. `js/graphics/psx-textures.js` generates chunky pixel textures procedurally using 2D canvas and retro color palettes. Materials receive vertex snapping via `onBeforeCompile`. `js/combat/` integrates dodge dash physics, slash ribbons, and quest progression tracking.

**Tech Stack:** Three.js, WebGL Shader Language (GLSL), Web Audio API, Vanilla ES6 JavaScript, CSS3.

**Spec:** [docs/superpowers/specs/2026-11-20-gamehendge-psx-overhaul.md](file:///d:/gamehenge/docs/superpowers/specs/2026-11-20-gamehendge-psx-overhaul.md)

## Global Constraints
- **Preserve Explorer Mode**: Existing 51 unit tests must remain green; 1993 VR Tour mode remains accessible from title screen.
- **Zero External Texture Assets**: All textures are generated procedurally via pixel math on HTML5 canvas.
- **60 FPS Performance Floor**: Low-res 320x240 internal rendering ensures rock-solid 60 FPS even with full post-processing.
- **Headless Testability**: Math, texture generation algorithms, and quest state machines must run cleanly in Node.js test environment.

---

### Task 1: Procedural PSX Pixel Texture Generator

**Files:**
- Create: `js/graphics/psx-textures.js`
- Create: `tests/psx-textures.test.js`

- [ ] **Step 1: Write unit tests verifying texture dimensions, pixel generation, and data URL / canvas output**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `psx-textures.js` (terrain, cobblestone, stone ruins, pine bark, pine needles, lizard skin, forbin coat)**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 2: PSX Vertex Jitter & Bayer Dithering Post-Processor

**Files:**
- Create: `js/graphics/psx-renderer.js`
- Create: `tests/psx-renderer.test.js`

- [ ] **Step 1: Write unit tests for resolution calculations, Bayer matrix constants, and shader injection helpers**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `psx-renderer.js` with internal low-res render target, vertex jitter material hook, and Bayer dithering quad**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 3: World Atmosphere: Sacred Forest Trees, Stone Ruins & Flickering Braziers

**Files:**
- Modify: `js/world.js`
- Create: `tests/psx-world.test.js`

- [ ] **Step 1: Write unit tests for tree clustering, ruin collisions, and torch point-light generation**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement arena props (Sacred Forest pine clusters, stone monoliths, braziers, distance fog)**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 4: Combat Juice: Slash Ribbons, Musical Note Particles & Glowing Projectiles

**Files:**
- Modify: `js/combat/combat-fx.js`
- Modify: `js/combat/particles.js`
- Modify: `js/combat/weapons.js`
- Create: `tests/psx-combat-fx.test.js`

- [ ] **Step 1: Write unit tests for slash ribbon lifecycle, musical note particle types, and projectile glow**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement slash meshes for spear/cleaver, musical note crits, and billboarding glowing projectiles**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 5: Movement Juice: Active Dodge Dash with Invulnerability Frames

**Files:**
- Modify: `js/combat/survivor-controls.js`
- Create: `tests/psx-controls.test.js`

- [ ] **Step 1: Write unit tests for dodge roll physics, i-frame duration, afterimage spawning, and cooldown timers**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `Space` / `Right-Click` dodge roll, camera slide tilt, and speed lines**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 6: In-Run RPG Quest Objectives & PS1 Memory Card UI Overhaul

**Files:**
- Create: `css/psx.css`
- Modify: `js/survivor-manager.js`
- Modify: `index.html`
- Create: `tests/psx-quests.test.js`

- [ ] **Step 1: Write unit tests for 4-stage quest state machine and Helping Friendly Book page collection**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `psx.css`, quest tracker HUD, CD-i/PS1 dialog popups, and stage progression**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 7: Full System Integration, Verification & Visual Quality Inspection

**Files:**
- Modify: `js/main.js`
- Modify: `README.md`

- [ ] **Step 1: Run full automated test suite across all modules**
- [ ] **Step 2: Launch browser subagent on local server, test gameplay, capture visual evidence**
- [ ] **Step 3: Verify 60 FPS, polygon jitter, Bayer dithering, pixel textures, trees, ruins, dodge roll, and quest HUD**
- [ ] **Step 4: Commit and finalize**
