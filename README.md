# Gamehendge 3D — Survivor Roguelike & Neo-CD-i Experience

A high-polish, interactive 3D web application bringing Trey Anastasio's legendary Gamehendge narrative (*The Man Who Stepped into Yesterday*) to life with two complete game modes:

1. 🔥 **SURVIVOR MODE (Megabonk 3D Roguelike)**: Fast-paced 3D horde-survival action. Select a Phish champion, sprint and slide down mountain slopes, auto-fire devastating Phish weapons, collect Flow XP gems, draft holographic upgrade cards, and defeat King Wilson!
2. 🕊️ **1993 EXPLORER TOUR (CD-i VR Experience)**: The original virtual reality CD-i multimedia vision. Soar through the forest with the Famous Mockingbird, climb the mountain with Col. Forbin, meet The Sloth in the ghetto, and listen to procedural 16-bit Phish synth motifs.

---

## 🎮 Survivor Mode Features (*Megabonk* Style)

- **4 Playable Champions**:
  - **Colonel Forbin**: *Surrender to the Flow* (+40% Magnet Radius, +1.5 HP/sec Regen). Starting weapon: *Pilgrim Staff*.
  - **Tela**: *Multibeast Agility* (+20% Move Speed, +45% Slope Slide Speed). Starting weapon: *Rebel Recurve Bow*.
  - **Rutherford the Brave**: *Plate of Lizards* (+60 Max HP, 5 Flat Armor, +35% Knockback). Starting weapon: *Whirlwind Spear*.
  - **The Famous Mockingbird**: *Featherfall Glide* (Low-gravity glide jump, +15% Attack Speed). Starting weapon: *Divided Sky Lightning*.
- **7 Auto-Firing Weapons (Levels 1–8)**:
  - *Pilgrim Staff* (Homing arcane energy orbs)
  - *Rebel Recurve Bow* (Rapid piercing arrows)
  - *Whirlwind Spear* (360° sweeping melee cleave)
  - *Helping Friendly Runes* (Orbiting runic buzzsaw)
  - *Divided Sky Lightning* (Chain lightning strikes)
  - *Electrolux Vortex* (Vacuum pulls enemies and all XP gems across the arena)
  - *The Sloth's Cleaver* (Heavy parabolic meat cleavers with explosive splash)
- **6 Passive Upgrades (Levels 1–5)**:
  - *Trey's Guitar Pick* (+Damage)
  - *Mike's Bassline* (-Cooldown CDR)
  - *Page's Organ Boost* (+Projectiles)
  - *Fishman's Doughnut* (+Move & Slide Speed)
  - *Lizard Heart* (+Max HP & Regen)
  - *Icculus's Glasses* (+Crit Chance)
- **Visual Juice & Game Feel**:
  - Floating spring-animated damage numbers (`"45"`, `"128 CRIT!"`) on an optimized 60 FPS 2D canvas overlay.
  - Screen shake trauma engine on critical hits and boss attacks.
  - Additive Three.js particle bursts when enemies shatter into crystalline shards.
  - Downhill momentum slope-sliding (`Shift`) down mountain crags with speedlines and dust plumes.
- **Epic Scaling Waves & Boss Battles**:
  - Foot Soldiers (00:00) $\to$ Corrupted Multibeasts (02:30) $\to$ Royal Guards (05:00)
  - 05:00 Mini-Boss: **The Watchful Hosemaster** (sprays high-pressure water stream; defeat drops a 3-upgrade chest!)
  - 10:00 Final Boss: **King Wilson, Duke of Lizards** (eye-beam laser barrages and seismic shockwaves)

---

## 🕹️ Controls Guide

| Action | Survivor Mode | Explorer Tour Mode |
| :--- | :--- | :--- |
| **Move / Steer** | <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> / Arrows | <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> / Arrows |
| **Jump** | <kbd>Space</kbd> | <kbd>Space</kbd> (Boost in Flight) |
| **Slide / Airbrake** | <kbd>Shift</kbd> (Downhill Slope Slide) | <kbd>Shift</kbd> (Airbrake in Flight) |
| **Mode Switch** | - | <kbd>T</kbd> (Switch Flight / Walk) |
| **Camera View** | Isometric-Tilt Chase Cam | <kbd>V</kbd> (Toggle 1st / 3rd Person) |
| **Interact** | Auto-attacks on nearest foe | <kbd>E</kbd> (Open Character Dossier) |
| **Look Orbit** | Mouse Drag | Mouse Drag |

---

## 🚀 How to Launch

Serve the project folder with any standard web server:

```bash
# Option 1: Python
python -m http.server 8000

# Option 2: Node / npx
npx serve .
```

Then open: **`http://localhost:8000`** in your browser.

---

## 🧪 Automated Test Suite

Run the full test suite with Node's built-in test runner:

```bash
npm test
```

Verifies:
- All 21 original Explorer VR Tour tests (topography, biomes, CD-i audio sequencer, controls, collision)
- Roguelike XP leveling curve and card drafting limits (`tests/survivor-upgrades.test.js`)
- Procedural combat Web Audio synthesis (`tests/survivor-audio.test.js`)
- Floating damage numbers and particle pooling (`tests/survivor-fx.test.js`)
- Auto-firing weapons targeting and cooldowns (`tests/survivor-weapons.test.js`)
- Scaling enemy waves, active cap (60), and boss spawns (`tests/survivor-enemies.test.js`)
- Flow XP gems and magnetic suction physics (`tests/survivor-gems.test.js`)
- Downhill slope-sliding controls and arena boundary (`tests/survivor-controls.test.js`)
