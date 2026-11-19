# Design Doc: Gamehendge Neo-CD-i 3D Interactive Web App

## 1. Intent & Context
In an early-1990s Phish newsletter / note, Trey Anastasio detailed his vision for releasing the Gamehendge narrative (*The Man Who Stepped into Yesterday*) as an interactive virtual reality CD-ROM or Philips CD-i DBK disc:
> *"This technology would allow the user to enter the virtual reality of Gamehendge on their TV (or computer) and basically 'travel' around Gamehendge hearing different music and meeting different characters. For instance, you could 'fly' over the forest with the Famous Mockingbird, seeing everything from the bird's perspective and landing wherever you wanted to. You could climb the mountain with Col. Forbin, or venture into the ghetto and meet the sloth."*

The goal of this project is to realize Trey's vision as a lightweight, interactive 3D web application with a **Neo-CD-i** aesthetic—blending 1993 CD-ROM interactive multimedia nostalgia with modern low-poly 3D graphics, dynamic lighting, responsive UI, and zero external asset dependencies.

---

## 2. World Coordinate System, Scale & Biomes

The world is centered at origin `(0, 0, 0)` with bounds `[-300, 300]` on X and Z axes (total 600x600 units). Elevation ranges from `y = 0` to `y = 95`.

| Region / Landmark | Coordinates (X, Z) | Elevation (Y) | Visual Characteristics | Character Encounter |
| :--- | :--- | :--- | :--- | :--- |
| **The Mountain of Icculus** | `(0, 0)` | `0` to `90` | Steep rugged spiral peak, snowy crags, stone altar at peak | **Icculus** (holding the Helping Friendly Book) |
| **The Sacred Forest** | `(-140, 140)` | `5` to `15` | Lush pine canopy, glowing mushrooms, tribal campfire | **Tela** & **The Lizards** |
| **The Ghetto** | `(150, 120)` | `2` to `8` | Misty cobblestone alleys, leaning timber houses, dim lanterns | **The Sloth** |
| **Wilson's Castle** | `(140, -140)` | `20` to `50` | Imposing dark basalt citadel, iron gates, crimson flags | **King Wilson** & **Errand** |
| **Lizard Lake & River** | `(-60, 40)` | `2.0` | Animated reflective low-poly water with stepping stones | **Rutherford the Brave** |
| **World Boundary** | `|X|, |Z| > 280` | Any | Thick mysterious mist barrier gently nudging player back | - |

---

## 3. Character Encounters & Dialogue System

All characters are procedurally constructed using low-poly Three.js geometries (flat-shaded cylinders, boxes, wedges, and spheres with vibrant color palettes) and animated via procedural vertex/joint articulation.

### Character Roster & Dossiers:
1. **The Famous Mockingbird**:
   - *Role*: Playable flight avatar or free-soaring companion.
   - *Model*: Golden/emerald avian with articulate wings, tailfeathers, and wind trail ribbons.
   - *Dialogue*: "The sacred bird sent by Icculus to retrieve the Helping Friendly Book."
2. **Colonel Forbin**:
   - *Role*: Playable ground explorer or mountain pilgrim.
   - *Model*: Low-poly traveler with green explorer jacket, walking staff, and boots.
   - *Quote*: "Why am I here? To climb the sacred mountain and plead for the Lizards."
3. **The Sloth**:
   - *Role*: Lurking hitman in the ghetto.
   - *Model*: Shaggy gray/brown figure reclining in a secluded alleyway under a flickering streetlamp.
   - *Dialogue*: "They call me The Sloth... I work for Wilson, or whoever pays the coin. Bad news arrives slowly, but it always arrives."
   - *Choice*: `[Ask about the contract]` -> Triggers gritty synth sting & quote: "Piece of cake. Consider Wilson handled."
4. **Rutherford the Brave**:
   - *Role*: Armored Lizard knight standing on the riverbank.
   - *Model*: Lizardfolk warrior in silver plate armor with a spear and shield.
   - *Dialogue*: "Our people have forgotten how to live without the Book. We do not know who wrote it or why."
5. **Tela**:
   - *Role*: Rebel heroine stationed at the forest pavilion.
   - *Model*: Cloaked green/gold ranger with an ornate bow.
   - *Dialogue*: "Wilson stole our freedom when he locked the Book in his high tower."
6. **King Wilson**:
   - *Role*: The tyrant of Gamehendge standing atop the castle balcony.
   - *Model*: Regal figure draped in royal purple with a jagged golden crown.
   - *Dialogue*: "I am the Duke of Lizards! None shall touch the Book!"
   - *Choice*: `[Chant "WIL-SON!"]` -> Triggers thunderous crowd synth chant.
7. **Icculus**:
   - *Role*: The author of the Helping Friendly Book, meditating atop the Mountain.
   - *Model*: Ethereal glowing elder sage in white and gold robes with floating runic parchment.
   - *Dialogue*: "The trick was to surrender to the flow... Read the Book!"

---

## 4. Dual Travel Modes & Controls

### 4.1 Flight Mode (The Famous Mockingbird)
- **Keybindings**:
  - `W` / `S`: Pitch down / pitch up (or invert option).
  - `A` / `D`: Yaw left / right with banking roll.
  - `Shift` / `Space`: Speed boost / glide brake.
  - `T` or landing button: Smooth touchdown to ground mode when altitude < 15 units.
- **Physics**: Smooth momentum, airspeed calculation, dynamic banking angle, swooping camera with aerodynamic FOV increase on boost.

### 4.2 Ground Walk Mode (Colonel Forbin / Explorer)
- **Keybindings**:
  - `W` / `A` / `S` / `D`: Walk forward, back, strafe.
  - `Space`: Jump.
  - `Mouse Drag / Pointer Lock`: Orbit/look camera.
  - `V`: Toggle 3rd-person / 1st-person camera.
  - `T` or take-off button: Launch into flight as the Mockingbird.
- **Physics**: Terrain height clamping `y = getTerrainHeight(x, z) + playerHeight`, gravity, obstacle collision with castle walls and house bounding boxes.

---

## 5. Procedural Web Audio Engine

Zero external audio files required. Uses Web Audio API `AudioContext` with customized synthesizer voices:
- **Lead Synth**: Detuned dual square/saw oscillators with resonant 24dB low-pass filter and envelope modulation.
- **Bass Synth**: Punchy triangle/sub-sine with snappy decay for funk lines.
- **Pad Synth**: Swelling polyphonic filtered saws with stereo chorus delay.
- **Rhythm Engine**: Filtered noise bursts for hi-hats/snare and pitched sine sweeps for kicks.

### 5.1 Composed Musical Themes (8-16 Bar Loops at 125 BPM):
1. **The Lizards (Forest Theme)**:
   - Chords: `C - G/B - Am - F` with the joyful, lilting Phish brass/guitar melody line.
2. **Fly Famous Mockingbird (Flight / Sky Theme)**:
   - Chords: `D - G - A` with high-speed soaring arpeggios and whistling lead.
3. **The Sloth (Ghetto Theme)**:
   - Chords: `Em7 - A7` with the iconic syncopated, swaggering funk-rock bassline (`E - G - A - Bb - B`).
4. **Wilson (Castle Theme)**:
   - Driving heavy two-chord rock riff (`E5 - D5`) with dramatic drum hits and crowd chant accents.
5. **Colonel Forbin's Ascent (Mountain Theme)**:
   - Slow majestic progression in `G minor / Bb major`, building in intensity as the player climbs higher up the mountain.

### 5.2 Audio Routing & CD-i Mode:
- **Spatial Auto Mode (Default)**: Automatically cross-fades themes based on inverse square distance to the 4 biome centers.
- **Manual CD-i Deck Mode**: When the user selects a track on the HUD CD player, it locks to that track and highlights the spinning disc. Clicking "AUTO TOUR" re-engages spatial cross-fading.
- **Audio Lifecycle**: Starts cleanly on user interaction via a retro CD-i boot sequence to comply with browser autoplay security policies.

---

## 6. Neo-CD-i User Interface & Aesthetics

The UI fuses 1993 Philips CD-i / DBK multimedia software styling with modern translucent glassmorphism:

1. **Title / Disc Insertion Screen**:
   - 90s CD-i BIOS style splash: "PHILIPS CD-I INTERACTIVE COMPACT DISC SYSTEM".
   - "PHISH: THE MAN WHO STEPPED INTO YESTERDAY - 3D INTERACTIVE WORLD".
   - "PRESS START TO INSERT DISC" button (unlocks Web Audio and Pointer Lock).
2. **Live Radar Minimap**:
   - 160px circular green-phosphor radar on top-right drawn via HTML5 2D Canvas.
   - Rotates with player heading; shows colored pips for characters, landmarks, and biome zones.
3. **Interactive CD-i Player Deck**:
   - Positioned bottom-left: 3D-styled rotating holographic CD-ROM disc.
   - Track display (Track #, Title, Time elapsed, BPM visualizer).
   - Play, Pause, Next, Prev, and Auto/Manual spatial switch.
4. **Altimeter & Flight Telemetry**:
   - Top-center: Minimalist digital HUD showing Current Zone, Altitude (ft), Airspeed (knots), and Travel Mode (`[MOCKINGBIRD FLIGHT]` or `[FORBIN GROUND]`).
5. **Retro CRT Filter Toggle**:
   - Single-click toggle in top-left: applies retro phosphor scanlines, subtle curved barrel distortion vignette, and chromatic aberration via pure zero-overhead CSS/SVG overlay (`pointer-events: none`).

---

## 7. Technical Implementation Structure

```
d:/gamehenge/
├── index.html                 # Shell, splash screen, HUD overlays, radar canvas
├── css/
│   └── style.css              # Neo-CD-i styling, glassmorphism, responsive HUD, CRT filter
└── js/
    ├── config.js              # Biome coordinates, world bounds, colors, dialogue data
    ├── audio.js               # Web Audio API synth, 5 musical themes, sequencer & spatial mixer
    ├── world.js               # Heightmap terrain, biome scenery, castle, ghetto, lake, lighting
    ├── entities.js            # Procedural 3D character models (Bird, Forbin, Sloth, etc.)
    ├── controls.js            # Flight physics, ground walk physics, collision, camera manager
    ├── ui.js                  # Radar drawing, CD-i deck controls, dialogue dossier modals
    └── main.js                # App lifecycle, boot sequence, Three.js render loop
```

- **Runtime**: Vanilla ES6 modules running via any lightweight local web server (e.g., `python -m http.server 8000` or `npx serve`), with Three.js r128 loaded via CDN or local bundle.
- **Performance**: 60 FPS target on integrated GPUs via low-poly flat-shaded geometries and shared instanced materials.

