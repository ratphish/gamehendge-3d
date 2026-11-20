# Design Doc: Gamehendge 3D "Megabonk" Survivor Mode (High-Polish 3D Action Roguelike)

## 1. Intent & Overview
This project adds a high-polish, adrenaline-packed **3D action roguelike horde survivor mode** inspired by **Megabonk**, **Risk of Rain 2**, and **Vampire Survivors** to the Gamehendge 3D web application.

The goal is a visually dazzling, juicy, fast-paced arcade experience featuring:
- **High visual punch**: Glowing emissive materials, additive particle bursts, screen shake, and vibrant multi-tone terrain lighting.
- **Juicy combat feel**: Floating 60fps spring-animated damage numbers, white enemy flash on hit, knockback physics, and crystalline death explosions.
- **Fluid 3D movement**: Fast strafing, jumping, and momentum downhill slope-sliding with dust trails.
- **Automatic Phish-themed weaponry**: Up to 4 active weapons and 4 passive items with multi-level upgrade branches.
- **Epic horde waves**: Dynamic scaling waves culminating in *The Watchful Hosemaster* (05:00) and *King Wilson* (10:00).
- **Clean dual-mode architecture**: Title screen allows seamless selection between **SURVIVOR MODE** and the original **1993 EXPLORER TOUR**.

---

## 2. Core Roguelike Formulas & Player Base Stats

### 2.1 Player Base Stats
- **Health**: 100 HP base.
- **Movement Speed**: 22 units/sec running, 46 units/sec downhill sliding.
- **Jump Force**: 14 units/sec (gravity 36 units/sec²).
- **Invulnerability Time**: 0.5s after taking damage (visual player blink).
- **Contact Damage Cooldown**: Enemies inflict damage at most once every 0.5s on contact.

### 2.2 Mathematical Progression Curves
- **Level-Up XP Formula**:
  $$\text{XP Needed}(L) = \lfloor 15 \times L^{1.35} \rfloor$$
  *(Lv 1 $\to$ 2: 15 XP, Lv 2 $\to$ 3: 38 XP, Lv 3 $\to$ 4: 66 XP, Lv 4 $\to$ 5: 98 XP, Lv 5 $\to$ 6: 134 XP...)*
- **Gem XP Tiers**:
  - Cyan Flow Gem: 10 XP
  - Purple Flow Gem: 35 XP
  - Gold Flow Gem: 100 XP
- **Enemy Scaling Over Elapsed Time ($t$ in seconds)**:
  - $\text{HP Multiplier} = 1.0 + 0.12 \times \lfloor t / 30 \rfloor$
  - $\text{Speed Multiplier} = \min(1.4, 1.0 + 0.03 \times \lfloor t / 60 \rfloor)$

---

## 3. Playable Hero Roster & Controls

### 3.1 Hero Roster
| Character | Title | Passive Trait | Starting Weapon |
| :--- | :--- | :--- | :--- |
| **Colonel Forbin** | The Long Island Pilgrim | **Surrender to the Flow**: +40% XP Gem collection radius, +1.5 HP/sec regeneration. | **Pilgrim Staff** |
| **Tela** | Rebel of the Forest | **Multibeast Agility**: +20% Move Speed, +45% Downhill Slide Velocity. | **Rebel Recurve Bow** |
| **Rutherford the Brave** | Knight of the Lizards | **Plate of Lizards**: +60 Max HP, +35% Melee Knockback, starts with 5 Armor (flat damage reduction). | **Whirlwind Spear** |
| **The Famous Mockingbird** | Sacred Aviary Courier | **Featherfall Glide**: Low-gravity jump glide, +15% Weapon Attack Speed. | **Sky Dive Chimes** |

### 3.2 Survivor Controls (`SurvivorControls`)
- Built as an isolated controller in `js/combat/survivor-controls.js` (keeps `js/controls.js` Explorer Mode 100% untouched).
- `W` / `A` / `S` / `D`: 360-degree ground strafe/run.
- `Space`: Jump. (Mockingbird: hold space to glide).
- `Shift` / `C`: **Downhill Slope Slide**: Accelerates down terrain gradients up to 46 units/sec with trailing dust particle sprites.
- Mouse: 3rd-person isometric-tilt chase camera (orbiting 14 units behind, 8 units above player).

---

## 4. Weapons & Passives System (4 Weapon Slots + 4 Passive Slots)

Weapons fire automatically at the nearest enemy in range. If no enemy is in range, directional weapons fire in the player's movement direction.

### 4.1 Weapons (Levels 1 to 8)
1. **Pilgrim Staff**: Launches homing arcane energy orbs with splash damage.
   - *Base*: Cooldown 1.2s, Damage 26, Speed 32, Orbs 1, Radius 2.5.
   - *Upgrades*: +1 orb at Lv 3, 5, 7; +20% damage at Lv 2, 4, 6, 8.
2. **Rebel Recurve Bow**: Rapid piercing arrows.
   - *Base*: Cooldown 0.8s, Damage 18, Speed 52, Pierces 3.
   - *Upgrades*: +1 arrow at Lv 3, 6; +1 pierce at Lv 2, 5; -0.06s cooldown per level.
3. **Whirlwind Spear**: 360° spinning melee arc dealing heavy knockback.
   - *Base*: Cooldown 1.4s, Damage 36, Radius 7.0, Knockback 14.
   - *Upgrades*: +15% radius & +20% damage per level.
4. **Helping Friendly Runes**: Ancient glowing runic pages orbiting the player.
   - *Base*: Orbiting count 2, Damage 16 per tick, Orbit Radius 3.8.
   - *Upgrades*: +1 rune at Lv 3, 5, 7; +15% damage & +0.4 orbit radius per level.
5. **Divided Sky Lightning**: Calls down thunderbolts that chain between foes.
   - *Base*: Cooldown 2.2s, Damage 55, Chains 2.
   - *Upgrades*: +1 chain target at Lv 3, 6; +20 damage per level; -0.15s cooldown.
6. **Electrolux Vortex**: Deploys a mini vacuum that damages, pulls enemies, and vacuums all XP gems across the arena.
   - *Base*: Cooldown 6.0s, Duration 2.2s, DPS 22, Pull Radius 14.
   - *Upgrades*: +0.5s duration, +12 DPS, -0.4s cooldown per level.
7. **The Sloth's Cleaver**: Throws heavy rotating cleavers in high parabolic arcs with area blast.
   - *Base*: Cooldown 2.6s, Damage 80, Blast Radius 5.5.
   - *Upgrades*: +1 cleaver at Lv 4, 7; +25 damage & +1.0 radius per level.

### 4.2 Passive Items (Levels 1 to 5)
1. **Trey's Guitar Pick**: +15% / 30% / 45% / 60% / 75% Damage to all weapons.
2. **Mike's Bassline**: -10% / 18% / 26% / 34% / 42% Attack Cooldown (CDR).
3. **Page's Organ Boost**: +1 Projectile count to multi-projectile weapons (Lv 1, 3, 5).
4. **Fishman's Doughnut**: +12% / 24% / 36% / 48% / 60% Move Speed & Slide Speed.
5. **Lizard Heart**: +30 / 60 / 90 / 120 / 150 Max HP & +1 / 2 / 3 / 4 / 5 HP/sec Regeneration.
6. **Icculus's Glasses**: +12% / 24% / 36% / 48% / 60% Critical Hit Chance (2.0x Damage).

### 4.3 Card Drafting Rules
- Max 4 weapons and 4 passives.
- Unowned weapons do not appear in drafts once all 4 weapon slots are occupied.
- Max-level items are excluded from drafts.
- If all equipped items are maxed, drafts offer **Lizard Rations** (instant +35 HP heal) and **King's Bounty** (+100 XP).
- Card Rarities: Common 70% (Standard upgrade), Rare 25% (Boosts stat + grants +50 XP), Legendary 5% (Grants 2 instant levels to the rolled item).

---

## 5. Enemy Hordes, Arena Bounds & Boss Encounters

### 5.1 Combat Arena & Spawn Volumes
- Combat takes place within a 200-unit circular radius around the center of Gamehendge (`Math.hypot(x, z) <= 200`). A shimmering runic barrier softly repels the player if they touch the boundary.
- Enemies spawn in rings 38 to 55 units away from the player (just outside camera view).
- Active Enemy Cap: 60 simultaneous enemies maximum to guarantee 60 FPS performance.

### 5.2 Enemy Types
1. **Wilson's Foot Soldiers (00:00–02:30)**: HP 35, Speed 16, Damage 8. Swarm in clusters of 6–12.
2. **Corrupted Multibeasts (02:30–05:00)**: HP 90, Speed 21, Damage 16. Fast charging quadrupeds.
3. **Citadel Royal Guards (05:00–09:30)**: HP 240, Speed 13, Damage 24. Heavy armored lizards with front shields.

### 5.3 Boss Encounters
1. **Mini-Boss: The Watchful Hosemaster (05:00 Spawn)**:
   - HP: 3,500. Speed: 14.
   - Attack: Every 4 seconds, fires a telegraphed high-pressure water stream dealing 20 damage + 25 knockback.
   - Defeat: Explodes into a **Legendary Treasure Chest** that instantly opens a 3-choice upgrade modal without spending XP!
2. **Final Boss: King Wilson, Duke of Lizards (10:00 Spawn)**:
   - HP: 12,000. Towering 12-unit-high royal boss.
   - *Phase 1 (100%–50% HP)*: Sweeping crimson eye-laser barrage (30 damage) + summons 4 Royal Guards every 18s.
   - *Phase 2 (50%–0% HP)*: Enraged speed (+25%), ground shockwave stomps (40 damage, jump to avoid).
   - Defeating Wilson triggers the **Gamehendge Liberation** victory sequence!

---

## 6. Visual Effects Engine ("Juice") & Web Audio FX

### 6.1 60 FPS Combat FX Canvas
- A single full-viewport 2D overlay `<canvas id="combat-fx-canvas">` receives 3D screen-projected coordinates:
  - **Damage Numbers**: Floating numbers popping upward with spring easing, colored white for standard hits, glowing gold/red for crits (`"124 CRIT!"`).
  - **Screen Shake**: Decaying offset vector applied to camera position on heavy hits.
  - **Crit Flash**: Subtle white vignetting on massive strikes.

### 6.2 Three.js Additive Particle Engine
- Custom instanced particle system using Three.js `Points` and `AdditiveBlending`:
  - 120 reusable particle pool for enemy death crystalline shards.
  - Projectile trail ribbons and spark motes.
  - Downhill slope-sliding dust puffs.

### 6.3 Procedural Combat Sound FX
- Synthesized via Web Audio API `AudioContext`:
  - Laser/Staff projectile shot (quick high-pitch sweep).
  - Bow arrow twang (resonant noise sweep).
  - Melee whoosh (filtered low-mid sweep).
  - Enemy hit impact (snappy thud/crunch).
  - Flow Gem pickup (ascending pentatonic chimes).
  - Level-Up (glorious synthesized brass fanfare).
  - Player hurt (grunty low buzz).

---

## 7. Technical Implementation Structure

```
d:/gamehenge/
├── index.html                 # Title screen mode selector, Survivor HUD, XP bar, Card modal
├── css/
│   ├── style.css              # Base styling & retro effects
│   └── survivor.css           # High-polish Survivor HUD, damage numbers, glowing cards, XP bar
└── js/
    ├── combat/
    │   ├── combat-fx.js       # 2D canvas damage numbers, screenshake, crit pops
    │   ├── particles.js       # Additive particle pool for explosions, trails, slide dust
    │   ├── weapons.js         # Weapon behaviors, firing cooldowns, projectile pooling, targeting
    │   ├── enemies.js         # Enemy horde spawner, enemy types, AI pathing, boss logic
    │   ├── gems.js            # Flow XP gems, magnet pull physics, pooling
    │   ├── upgrades.js        # Upgrade card database, card drafting UI, stat calculations
    │   └── survivor-controls.js # Dedicated survivor movement & slope sliding controller
    ├── survivor-manager.js    # Survivor state machine, game timer, kill counter, level-up loop
    └── main.js                # Mode switcher: Survivor Mode vs Explorer Tour Mode
```

- **Headless Node.js Unit Testing**: All combat math, weapon cooldown logic, enemy scaling, and card drafting are pure JavaScript functions decoupled from Three.js scene graphs, allowing 100% test coverage with `npm test`.
