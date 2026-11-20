# Gamehendge 3D "PSX" PlayStation 1 Visual Overhaul & Gameplay Depth Spec

## Goal
Transform Gamehendge 3D Survivor Mode into an authentic, high-quality late-90s PlayStation 1 (PSX) action roguelike. Eliminate modern flat/sterile WebGL rendering in favor of authentic 320x240 affine vertex jitter, 16-bit Bayer color dithering, procedural chunky 32x32 pixel textures, atmospheric distance fog, Sacred Forest environment props, weapon slash ribbons, active dodge rolling with i-frames, and in-run RPG story objectives.

## Architecture

### 1. PSX Rendering Pipeline (`js/graphics/psx-renderer.js`)
- **Internal Resolution**: 320x240 (4:3) or 384x216 (16:9) rendering target with `THREE.NearestFilter`.
- **Vertex Jitter (Affine Polygon Wobble)**:
  - Custom vertex shader injection on materials via `material.onBeforeCompile`:
    ```glsl
    vec4 snappedPos = gl_Position;
    snappedPos.xyz /= snappedPos.w;
    snappedPos.xy = floor(snappedPos.xy * vec2(160.0, 120.0)) / vec2(160.0, 120.0);
    snappedPos.xyz *= snappedPos.w;
    gl_Position = snappedPos;
    ```
- **16-bit Bayer Dither Pass**:
  - Fullscreen quad shader applying 4x4 Bayer matrix dithering to quantize 24-bit RGB down to PS1 15-bit (RGB555) color depth without severe banding.
- **CRT / Scanline Filter**:
  - Optional subtle scanline raster overlay.

### 2. Procedural Pixel Textures (`js/graphics/psx-textures.js`)
- Generate 32x32 and 64x64 pixelated textures with fixed retro color palettes:
  - `terrain_rock_grass`: Mossy rock blending into dirt.
  - `cobblestone_path`: Chunky earthen cobblestone.
  - `pine_bark` & `pine_foliage`: Forest tree materials.
  - `ancient_ruin_stone`: Weathered stone blocks with moss cracks.
  - `forbin_coat`: Tweed fabric with stitch details.
  - `lizard_skin`: Scaly green reptile skin.
  - `glowing_flame`: Animated 16x16 torch fire sprite.

### 3. World & Environment (`js/world.js`)
- Populated arena bounds:
  - Sacred Forest pine tree clusters with billboarding/faceted pixel leaves.
  - Ancient stone monoliths and crumbled garrison walls forming natural cover.
  - Braziers with flickering point-lights (`intensity` modulated by simplex/sine wave).
  - Mountain of Icculus looming in distance fog (`THREE.Fog(0x111625, 20, 110)`).

### 4. Combat Juice & Feedback (`js/combat/combat-fx.js`, `js/combat/weapons.js`)
- **Weapon Slash Meshes**: Curved polygonal ribbon arcs spawned on Whirlwind Spear and Sloth's Cleaver attacks with additive opacity fade.
- **Glowing Projectiles**: Billboarding energy sprites with additive blend.
- **Musical Note Particles**: Float up on crits (`♪`, `♫`, `♬`).
- **Dynamic Camera Pulses**: Camera micro-kick on boss impacts and heavy crits.

### 5. Movement: Active Dodge Dash (`js/combat/survivor-controls.js`)
- `Spacebar` / `Right-Click`: Instant directional dash burst (2.4x speed for 0.25s) with afterimage ghost meshes and 0.3s invulnerability frames.
- Cooldown: 2.2 seconds (indicated by a HUD pip).
- Radial speed lines when downhill sliding at max velocity.

### 6. RPG Story Objectives & PS1 HUD (`js/survivor-manager.js`, `css/psx.css`)
- Quest Objective Tracker:
  1. *Breach the Garrison*: Defeat 25 Wilson Foot Soldiers.
  2. *The Lost Pages*: Recover 3 Pages of the *Helping Friendly Book* from altars guarded by elite Multibeasts.
  3. *The Hosemaster*: Slay The Watchful Hosemaster (05:00).
  4. *The Tyrant*: Slay King Wilson (10:00).
- PS1 BIOS / Memory Card inspired UI styling: chunky bevels, high-contrast cyan/amber/magenta indicators, pixel typography.
