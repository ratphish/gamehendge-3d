# Design Doc: Gamehendge Neo-CD-i 3D Interactive Web App

## 1. Intent & Context
In an early-1990s Phish newsletter / note, Trey Anastasio detailed his vision for releasing the Gamehendge narrative (*The Man Who Stepped into Yesterday*) as an interactive virtual reality CD-ROM or Philips CD-i DBK disc. In his words:
> *"This technology would allow the user to enter the virtual reality of Gamehendge on their TV (or computer) and basically 'travel' around Gamehendge hearing different music and meeting different characters. For instance, you could 'fly' over the forest with the Famous Mockingbird, seeing everything from the bird's perspective and landing wherever you wanted to. You could climb the mountain with Col. Forbin, or venture into the ghetto and meet the sloth."*

The goal of this project is to realize Trey's vision as a lightweight, interactive 3D web application with a **Neo-CD-i** aesthetic—blending 1993 CD-ROM interactive multimedia nostalgia with modern low-poly 3D graphics, dynamic lighting, and responsive web technology.

---

## 2. Goals, Non-Goals, & Anti-Goals

### Goals
- **Instant, Small Footprint**: Zero heavy build pipeline or multi-hundred-megabyte downloads. Runs directly in any modern web browser via static server or file open.
- **Interactive 3D Gamehendge World**:
  - **The Sacred Forest**: Lush low-poly pine and mystical trees, glowing spores, and the Lizards' campfire.
  - **The Mountain of Icculus**: Towering rugged peak with a spiraling path leading to the summit shrine of the Helping Friendly Book.
  - **The Ghetto**: Dark, misty cobblestone alleys with flickering lanterns where The Sloth resides.
  - **Wilson's Castle**: Imposing dark fortress with bastions and iron gates.
  - **Lizard Lake & River**: Reflective water body dividing the biomes.
- **Dual Travel Modes**:
  - **Famous Mockingbird Flight Mode**: Free 3D flight with banking, pitching, acceleration, swooping over the forest canopy, and landing.
  - **Ground Exploration Mode (Col. Forbin / Walk)**: Smooth 3rd/1st-person exploration with WASD/mouse controls, jumping, and ground collision.
- **Interactive Character Encounters**:
  - Proximity-based encounters with animated 3D characters: The Famous Mockingbird, Colonel Forbin, The Sloth, Rutherford the Brave, Tela, King Wilson, and Icculus.
  - Interactive dialogue cards evoking early-90s CD-i multimedia dossiers with lore, music stings, and quotes.
- **Dynamic Procedural Web Audio Engine**:
  - Zero audio asset downloads: Built entirely using the Web Audio API (oscillators, envelopes, filters, delays).
  - Plays stylized Gamehendge musical themes (*The Lizards*, *Fly Famous Mockingbird*, *The Sloth*, *Wilson*, *Colonel Forbin's Ascent*) that spatially cross-fade as the user moves between zones.
- **Neo-CD-i HUD & Interface**:
  - Re-imagined CD-i interactive deck: CD-ROM disc spinning indicator, track selector, live radar minimap, camera switcher, and an optional CRT scanline/chromatic aberration toggle.

### Non-Goals
- Multi-gigabyte photorealistic asset packs or Unreal/Unity WebGL exports that take 5 minutes to load.
- Full length 2-hour narrative campaign; the focus is an open-world explorable sandbox highlighting the core scenarios Trey described.

### Anti-Goals
- Clunky or fragile external asset dependencies (avoiding external 3D models or audio files that can fail to fetch or violate CORS).
- Heavy CPU/GPU hogging: must maintain 60 FPS on standard laptops and integrated graphics.

---

## 3. Approaches Considered & Trade-offs

1. **Approach 1: Neo-CD-i / Modern Low-Poly (Selected)**
   - Crisp, stylized low-poly 3D world with vibrant modern lighting, smooth post-processing, and a modernized CD-i glassmorphism interface.
   - *Why chosen*: Captures the exact playful spirit of Trey's 1993 vision while looking beautiful and feeling buttery smooth on modern devices.
2. **Approach 2: High-Def Dithered Retro (PS1 / CD-i Hardware Emulation)**
   - Strict affine texture warping, 32-color dithering, pixelated 320x240 buffer.
   - *Trade-off*: Authentic to 1993 hardware limits, but can feel overly crunchy or harsh.
3. **Approach 3: Modern Minimalist Isometric**
   - Diorama style, static camera angles.
   - *Trade-off*: Misses the visceral thrill of "flying over the forest from the bird's perspective" or "climbing the mountain" described by Trey.

---

## 4. Technical Architecture & File Structure

```
d:/gamehenge/
├── index.html                 # HTML shell, UI overlays, HUD, CD-i deck, minimap
├── css/
│   └── style.css              # Neo-CD-i styling, glassmorphism, CRT filter overlays
├── js/
│   ├── main.js                # App lifecycle, animation loop, state machine
│   ├── world.js               # 3D terrain generation, biomes, landmarks, lighting, water
│   ├── entities.js            # 3D character models (Mockingbird, Forbin, Sloth, Lizards, Wilson)
│   ├── controls.js            # Flight physics (Mockingbird) & ground walk physics (Forbin)
│   ├── audio.js               # Web Audio API synthesizer, musical themes, spatial crossfader
│   └── ui.js                  # CD-i HUD, disc player controls, radar minimap, dialogues
└── README.md                  # Project overview, controls, and running instructions
```

---

## 5. Subsystem Specifications

### 5.1 3D World & Biomes (`world.js`)
- Procedural heightmap terrain rendered with low-poly flat-shaded styling.
- Distinct thematic biomes arranged radially around the center:
  - Center/North: The Mountain of Icculus (high elevation, snow-dusted peak, summit pedestal with the Helping Friendly Book).
  - South/South-West: The Sacred Forest (dense clusters of low-poly pines, glowing blue/purple mushrooms, campfire).
  - East: The Ghetto (cobblestone ground, leaning rustic timber houses, streetlamps, foggy atmosphere).
  - North-East: Wilson's Castle (dark stone fortress, high towers, battlements, crimson banners).
  - Low valleys: Reflective river / lake with animated low-poly water waves.

### 5.2 Flight & Walk Physics (`controls.js`)
- **Mode 1: The Famous Mockingbird (Flight)**
  - Dynamic pitch, yaw, roll, smooth banking into turns.
  - Throttle up/down (W/S or Shift/Space), flap burst, glide mechanics.
  - Animated flapping wings and trailing wind ribbons.
  - Seamless "Land" action transitions to Ground Mode.
- **Mode 2: Colonel Forbin (Ground Walk)**
  - WASD + Mouse look (pointer lock or drag-to-look).
  - Jump (Space), ground clamping with terrain collision.
  - Camera follows in smooth third-person or first-person view.

### 5.3 Web Audio Engine (`audio.js`)
- Uses Web Audio `AudioContext`, oscillators (Sawtooth, Triangle, Square), 24dB Moog-style biquad lowpass filter, ADSR envelopes, and feedback delay.
- 5 distinct musical themes composed as looping MIDI-style note arrays:
  1. *The Lizards* (Warm pastoral brass/lead, Major arpeggios, bouncy bassline)
  2. *Fly Famous Mockingbird* (Soaring melodic flight lead, fast arpeggios, airy resonance)
  3. *The Sloth* (Funky, gritty syncopated bass riff, menacing groove)
  4. *Wilson* (Heavy driving rock riff, pounding rhythm)
  5. *Colonel Forbin's Ascent* (Noble, mystical climbing sequence)
- Cross-fading based on proximity to biome centers with master volume and mute controls.

### 5.4 Neo-CD-i User Interface (`ui.js` & `style.css`)
- **Interactive CD-i Player Deck**:
  - Spinning holographic CD-ROM disc.
  - Track name display with live playback visualizer.
  - Play / Pause / Next Track / Mute buttons.
- **Flight & Nav Instruments**:
  - Altimeter, Airspeed indicator, Compass heading, Flight/Walk mode toggle.
- **Radar Minimap**:
  - Top-down circular radar displaying player position, heading, and markers for characters/landmarks.
- **Character Encounter Dossiers**:
  - Interactive popup modal when approaching characters with character portrait, lore quote, and interactive choices.
- **Retro CRT Toggle**:
  - Optional toggle for scanlines, curved screen vignette, and slight RGB chromatic aberration.

---

## 6. Verification Plan
1. **Visual & Rendering Check**: Verify all 4 biomes, terrain elevation, water, and landmarks render smoothly at 60 FPS in modern browsers.
2. **Flight & Walk Controls Check**: Test smooth transition between Famous Mockingbird flight and ground walking, ensuring responsive turning, collision, and no jitter.
3. **Audio Synthesis Check**: Test that Web Audio initializes cleanly on user interaction (browser audio policy compliant), themes play correctly, and cross-fading occurs as the player moves between biomes.
4. **UI & Character Dialogue Check**: Verify radar tracking, CD-i HUD controls, character proximity triggers, and CRT filter toggle.
5. **Zero-Dependency Self-Containment**: Ensure the app runs instantly with standard Three.js without requiring external build tools.
