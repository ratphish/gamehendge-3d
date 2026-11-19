# Gamehendge Neo-CD-i 3D Interactive Web App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a lightweight, interactive 3D web application realizing Trey Anastasio's 1993 vision of Gamehendge as a virtual reality CD-i / multimedia experience, featuring Famous Mockingbird flight, Forbin ground exploration, procedural Web Audio Phish themes, character encounters, and a Neo-CD-i interface.

**Architecture:** A zero-heavy-dependency client application utilizing Three.js (r128) for 3D rendering and the Web Audio API for synthesized multi-track procedural audio. Procedural low-poly geometry generates terrain, landmarks (Wilson's Castle, Icculus Mountain, Ghetto, Forest), and characters with zero external 3D model files. A responsive HTML5/Canvas Neo-CD-i HUD provides radar tracking, CD-ROM player controls, dialogue dossiers, and an optional CRT visualizer.

**Tech Stack:** HTML5, CSS3, Three.js (r128), Web Audio API, Vanilla ES6 JavaScript, Node.js test runner for unit validation.

**Spec:** [docs/superpowers/specs/2026-11-19-gamehendge-cdi-design.md](file:///d:/gamehenge/docs/superpowers/specs/2026-11-19-gamehendge-cdi-design.md)

## Global Constraints
- Runs directly in standard modern web browsers via any static web server (e.g. `npx serve` or Python `http.server`).
- Zero external 3D model files (glTF/OBJ) or audio file downloads; all models and audio are procedurally synthesized in code.
- Target constant 60 FPS performance via low-poly flat-shaded geometries and shared materials.
- Browser autoplay security policy strictly respected: Web Audio and pointer lock initialize only upon user clicking "INSERT DISC / ENTER GAMEHENDGE".

## Review Focus
1. AudioContext autoplay policy failure if user has not interacted -> Splash screen gates audio initialization behind user click.
2. Coordinate and terrain clamping when transitioning between Mockingbird Flight and Forbin Walk mode -> Safe altitude elevation clamp prevents clipping beneath terrain.
3. Audio clipping or click/pop artifacts during multi-track oscillator cross-fading -> Exponential gain ramps and proper voice release envelopes.
4. Edge-of-world boundary traversal -> Soft boundary damping at `|X|, |Z| > 280` keeps player within playable zone.
5. High-DPI canvas blurry radar rendering -> Dynamic `devicePixelRatio` scaling on minimap 2D canvas.

---

### Task 1: Project Scaffolding, Configuration & Test Harness

**Files:**
- Create: `package.json`
- Create: `js/config.js`
- Create: `tests/config.test.js`

**Interfaces:**
- Produces: `GAMEHENDGE_CONFIG` containing world bounds, coordinates of 5 biomes, character roster, dialogue data, and audio theme metadata.

- [ ] **Step 1: Write test for configuration data structures**
Test verifies world bounds `[-300, 300]`, 5 biome locations (`mountain`, `forest`, `ghetto`, `castle`, `lake`), 7 character dossier entries with dialogues, and 5 theme definitions.
- [ ] **Step 2: Run test to verify it fails**
Run: `node tests/config.test.js`
Expected: FAIL (cannot find module `config.js`)
- [ ] **Step 3: Implement `js/config.js` and `package.json`**
Define complete configuration object with coordinates, colors, character dialogue trees, and audio definitions.
- [ ] **Step 4: Run test to verify it passes**
Run: `node tests/config.test.js`
Expected: PASS
- [ ] **Step 5: Commit**
`git add package.json js/config.js tests/config.test.js`
`git commit -m "feat: setup project scaffolding and gamehendge configuration"`

---

### Task 2: Web Audio Synthesizer & Procedural Themes

**Files:**
- Create: `js/audio.js`
- Create: `tests/audio.test.js`

**Interfaces:**
- Consumes: `GAMEHENDGE_CONFIG.audio` from `js/config.js`
- Produces: `GameAudioEngine` class with methods:
  - `init(): Promise<void>`
  - `playTheme(themeKey: string): void`
  - `updateSpatialAudio(playerX: number, playerZ: number): void`
  - `setMasterVolume(val: number): void`
  - `setMode(mode: 'auto' | 'manual'): void`
  - `getCurrentTrackInfo(): { name: string, bpm: number, isPlaying: boolean }`

- [ ] **Step 1: Write unit tests for audio note frequency calculations, sequencer math, and state machine**
Test verifies frequency math (MIDI to Hz conversion), 5 theme note sequences exist and are valid notes, and mode switching between auto/manual works.
- [ ] **Step 2: Run test to verify it fails**
Run: `node tests/audio.test.js`
Expected: FAIL
- [ ] **Step 3: Implement `GameAudioEngine` in `js/audio.js`**
Build Web Audio synthesizer with dual oscillator voices, lowpass filter, ADSR envelopes, rhythmic patterns, and sequence loops for *The Lizards*, *Fly Famous Mockingbird*, *The Sloth*, *Wilson*, and *Colonel Forbin's Ascent*. Include spatial crossfader based on player coordinates.
- [ ] **Step 4: Run test to verify it passes**
Run: `node tests/audio.test.js`
Expected: PASS
- [ ] **Step 5: Commit**
`git add js/audio.js tests/audio.test.js`
`git commit -m "feat: implement procedural Web Audio engine and Gamehendge theme sequencer"`

---

### Task 3: 3D Procedural World, Terrain Heightmap & Landmarks

**Files:**
- Create: `js/world.js`
- Create: `tests/world.test.js`

**Interfaces:**
- Consumes: `GAMEHENDGE_CONFIG` from `js/config.js`
- Produces: `GameWorld` class with:
  - `constructor(scene: THREE.Scene)`
  - `getTerrainHeight(x: number, z: number): number`
  - `checkCollision(x: number, z: number, radius: number): boolean`
  - `update(delta: number): void` (animates water ripples, campfire glow, banners)

- [ ] **Step 1: Write unit test for terrain height calculation and obstacle collision detection**
Test verifies `getTerrainHeight(0, 0)` returns mountain summit altitude (~85-90), `getTerrainHeight(140, -140)` returns castle elevation (~20-30), and collision check triggers for castle walls.
- [ ] **Step 2: Run test to verify it fails**
Run: `node tests/world.test.js`
Expected: FAIL
- [ ] **Step 3: Implement `GameWorld` in `js/world.js`**
Construct low-poly procedural terrain geometry with flat shading, Mountain of Icculus with summit altar, Sacred Forest with instanced pine trees and glowing flora, The Ghetto with timber houses and lanterns, Wilson's Basalt Castle with towers and banners, and animated reflective water for Lizard Lake.
- [ ] **Step 4: Run test to verify it passes**
Run: `node tests/world.test.js`
Expected: PASS
- [ ] **Step 5: Commit**
`git add js/world.js tests/world.test.js`
`git commit -m "feat: implement procedural 3D world, biomes, heightmap terrain and landmarks"`

---

### Task 4: Procedural 3D Character Models & Animation

**Files:**
- Create: `js/entities.js`
- Create: `tests/entities.test.js`

**Interfaces:**
- Consumes: `GAMEHENDGE_CONFIG.characters` from `js/config.js`
- Produces: `EntityManager` class with:
  - `constructor(scene: THREE.Scene, world: GameWorld)`
  - `characters: Map<string, CharacterEntity>`
  - `mockingbirdAvatar: MockingbirdAvatar`
  - `forbinAvatar: ForbinAvatar`
  - `update(delta: number, playerPos: THREE.Vector3): void`
  - `getNearbyCharacter(playerPos: THREE.Vector3, threshold: number): CharacterEntity | null`

- [ ] **Step 1: Write test for entity placement coordinates and proximity detection**
Test verifies 7 characters spawn at their designated biome coordinates, and proximity detection returns the correct character when within 15 units.
- [ ] **Step 2: Run test to verify it fails**
Run: `node tests/entities.test.js`
Expected: FAIL
- [ ] **Step 3: Implement procedural character models in `js/entities.js`**
Build procedural 3D models using Three.js primitives (Famous Mockingbird with flapping wings and trail ribbons, Colonel Forbin with traveler cloak and staff, The Sloth reclining in alleyway, Rutherford the Brave in lizard armor, Tela with bow, King Wilson with crown, Icculus with glowing robes and the Helping Friendly Book).
- [ ] **Step 4: Run test to verify it passes**
Run: `node tests/entities.test.js`
Expected: PASS
- [ ] **Step 5: Commit**
`git add js/entities.js tests/entities.test.js`
`git commit -m "feat: implement procedural 3D character models and proximity detection"`

---

### Task 5: Dual Flight & Ground Controls with Smooth Physics

**Files:**
- Create: `js/controls.js`
- Create: `tests/controls.test.js`

**Interfaces:**
- Consumes: `GameWorld`, `EntityManager`
- Produces: `PlayerControls` class with:
  - `constructor(camera: THREE.Camera, domElement: HTMLElement, world: GameWorld, entities: EntityManager)`
  - `mode: 'flight' | 'walk'`
  - `setMode(newMode: 'flight' | 'walk'): void`
  - `update(delta: number): { position: THREE.Vector3, heading: number, speed: number, altitude: number }`

- [ ] **Step 1: Write test for control state transitions and physics clamping**
Test verifies flight mode updates pitch/yaw/speed, walk mode updates position clamped to `getTerrainHeight()`, and boundary damping holds player inside world limits.
- [ ] **Step 2: Run test to verify it fails**
Run: `node tests/controls.test.js`
Expected: FAIL
- [ ] **Step 3: Implement `PlayerControls` in `js/controls.js`**
Implement Mockingbird flight mechanics (pitch, yaw, roll banking, glide, acceleration) and Forbin ground walking (WASD, mouse orbit look, jump, obstacle collision). Implement smooth transition logic on key `[T]` or land/take-off buttons.
- [ ] **Step 4: Run test to verify it passes**
Run: `node tests/controls.test.js`
Expected: PASS
- [ ] **Step 5: Commit**
`git add js/controls.js tests/controls.test.js`
`git commit -m "feat: implement dual Mockingbird flight and Forbin ground controls"`

---

### Task 6: Neo-CD-i HUD, Live Radar Minimap, Disc Player & Dialogue UI

**Files:**
- Create: `css/style.css`
- Create: `js/ui.js`
- Create: `index.html`

**Interfaces:**
- Consumes: `GAMEHENDGE_CONFIG`, `GameAudioEngine`, `PlayerControls`, `EntityManager`
- Produces: `GameUI` class with:
  - `constructor(audio: GameAudioEngine, controls: PlayerControls, entities: EntityManager)`
  - `update(telemetry: object): void`
  - `showDialogue(character: object): void`
  - `hideDialogue(): void`
  - `toggleCRT(): void`

- [ ] **Step 1: Write HTML markup and CSS styling for Neo-CD-i interface**
Build CD-i disc splash screen, telemetry HUD (heading, altitude, airspeed), 2D radar canvas overlay, CD-i rotating disc player dock, character dialogue dossier modal, and CRT filter overlay.
- [ ] **Step 2: Implement UI manager in `js/ui.js`**
Draw live rotating radar with player arrow and entity blips; bind CD-i player controls (Play, Pause, Next, Prev, Auto/Manual mode); bind dialogue choices with audio sting cues; handle CRT toggle.
- [ ] **Step 3: Verify HUD elements and radar canvas rendering in browser/node environment**
- [ ] **Step 4: Commit**
`git add index.html css/style.css js/ui.js`
`git commit -m "feat: implement Neo-CD-i HUD, radar minimap, disc player and dialogue UI"`

---

### Task 7: Integration, Game Loop & End-to-End Verification

**Files:**
- Create: `js/main.js`
- Create: `README.md`

**Interfaces:**
- Consumes: All modules (`config.js`, `audio.js`, `world.js`, `entities.js`, `controls.js`, `ui.js`)
- Produces: Complete running interactive 3D web application.

- [ ] **Step 1: Implement `js/main.js` application bootstrap and 60 FPS animation loop**
Set up Three.js WebGL renderer, scene, camera, resize handling, link controls, world updates, entity animations, audio updates, and UI telemetry.
- [ ] **Step 2: Add comprehensive README with background, controls guide, and launch instructions**
- [ ] **Step 3: Run full automated test suite**
Run: `npm test`
Expected: ALL PASS
- [ ] **Step 4: Launch local test server and verify complete interactive 3D app**
Verify 3D rendering, flight, walking, audio synthesis, character dialogues, radar, and CRT filter.
- [ ] **Step 5: Commit**
`git add js/main.js README.md`
`git commit -m "feat: complete Gamehendge Neo-CD-i 3D interactive application"`

---

## Plan Self-Review
- **Spec coverage**:
  - Biomes & landmarks -> Task 3
  - Characters & dialogue -> Tasks 1, 4, 6
  - Flight & walk modes -> Task 5
  - Procedural Web Audio Phish themes -> Task 2
  - Neo-CD-i HUD, disc player, radar, CRT -> Task 6
  - Zero heavy assets & instant start -> Tasks 1, 6, 7
- **Review Focus coverage**:
  - AudioContext user-gesture unlock -> Tasks 6 & 7
  - Transition altitude safety clamping -> Task 5
  - Audio pop/click mitigation -> Task 2
  - Boundary soft damping -> Task 5
  - High-DPI radar crisp rendering -> Task 6
- **Proportion**: Bite-sized, modular, each task has concrete test criteria and clear interface boundaries.
