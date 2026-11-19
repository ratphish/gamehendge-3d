# Gamehendge 3D — Neo-CD-i Virtual Reality Experience

A lightweight, interactive 3D web application bringing Trey Anastasio's early-1990s vision to life: the legendary **Gamehendge interactive CD-i / VR multimedia experience** (*The Man Who Stepped into Yesterday*).

> *"This technology would allow the user to enter the virtual reality of Gamehendge on their TV (or computer) and basically 'travel' around Gamehendge hearing different music and meeting different characters. For instance, you could 'fly' over the forest with the Famous Mockingbird, seeing everything from the bird's perspective and landing wherever you wanted to. You could climb the mountain with Col. Forbin, or venture into the ghetto and meet the sloth."*
> 
> — **Trey Anastasio, Phish Newsletter (1993)**

---

## Features

- **Small Footprint & Zero External Assets**: Pure procedural low-poly 3D models and procedural Web Audio synthesis. No heavy 3D asset downloads, no external audio files. Loads instantly in any modern browser.
- **Dual Travel Modes**:
  - **The Famous Mockingbird (Flight Mode)**: Fly freely over the canopy, swoop between mountain spires, banking turns, speed boosts, and airbrakes.
  - **Colonel Forbin (Ground Walk Mode)**: Climb the sacred mountain path on foot, explore the cobblestone alleys of the Ghetto, jump, and interact with characters. Seamless mode switching with `[T]`!
- **Interactive Character Encounters**:
  - **The Famous Mockingbird**: Sacred avian courier sent by Icculus.
  - **Colonel Forbin**: Traveler on the pilgrim mountain trail.
  - **The Sloth**: Lurking contract hitman in the shadowy ghetto.
  - **Rutherford the Brave**: Armored Lizard knight by Lizard Lake.
  - **Tela**: Rebel insurgent in the Sacred Forest.
  - **King Wilson**: Tyrant Duke atop his basalt fortress.
  - **Icculus**: Ancient philosopher meditating before the floating Helping Friendly Book.
- **Procedural Web Audio Engine**:
  - Synthesizes iconic Phish musical themes directly using the Web Audio API:
    - *The Lizards* (Sacred Forest theme)
    - *Fly Famous Mockingbird* (Sky / Flight theme)
    - *The Sloth* (The Ghetto funk theme)
    - *Wilson* (Castle rock theme)
    - *Colonel Forbin's Ascent* (Mountain theme)
  - Seamless spatial cross-fading as you travel between regions.
- **Neo-CD-i HUD & Retro CRT Aesthetic**:
  - Interactive spinning holographic CD-ROM disc player with play/pause and track controls.
  - Live rotating phosphor radar minimap with compass heading and landmark pips.
  - Altimeter, airspeed, and telemetry dashboard.
  - Toggleable vintage CRT scanline and phosphor glow filter.

---

## Controls

| Key / Action | Flight Mode (Mockingbird) | Walk Mode (Colonel Forbin) |
| :--- | :--- | :--- |
| **W / S** (or Up / Down) | Pitch Down / Pitch Up | Walk Forward / Backward |
| **A / D** (or Left / Right) | Bank & Steer Left / Right | Strafe Left / Right |
| **Space** | Speed Boost Throttle | Jump |
| **Shift** | Airbrake / Glide | - |
| **T** | Land & Switch to Walk Mode | Take Off & Switch to Flight Mode |
| **V** | Toggle 1st / 3rd Person View | Toggle 1st / 3rd Person View |
| **E** | - | Interact with Nearby Character |
| **Mouse Drag** | Look / Orbit Camera | Look / Orbit Camera |
| **CRT FX Button** | Toggle CRT Scanlines | Toggle CRT Scanlines |

---

## Quick Start (Run Locally)

This is a modern ES-module web application. To run it locally, serve it using any standard static file server:

### Option 1: Using Python (Pre-installed on most systems)
```bash
python -m http.server 8000
```
Then open: **`http://localhost:8000`**

### Option 2: Using Node.js / npx
```bash
npx serve .
```
Then open the local URL printed in the console (e.g. **`http://localhost:3000`**).

---

## Automated Verification Tests

Run the test suite using Node.js's built-in test runner:

```bash
npm test
```

This verifies:
- Topography calculations and biome coordinates (`tests/world.test.js`)
- Web Audio synthesizer math, note frequencies, and spatial logic (`tests/audio.test.js`)
- Character placement and proximity detection (`tests/entities.test.js`)
- Flight and ground physics clamping and transitions (`tests/controls.test.js`)
- Configuration consistency (`tests/config.test.js`)
