# Design Doc: Gamehendge 3D "Megabonk" Survivor Mode (High-Polish 3D Action Roguelike)

## 1. Intent & Overview
This project upgrades the Gamehendge 3D web application with a high-polish, adrenaline-packed **3D action roguelike horde survivor mode** inspired by **Megabonk**, **Risk of Rain 2**, and **Vampire Survivors**. 

The goal is a visually dazzling, juicy, fast-paced arcade experience featuring:
- High visual punch: glowing emissive materials, particle bursts, screen shake, bloom glow, and dynamic lighting.
- Juicy combat feel: floating spring-animated damage numbers, white enemy flash on hit, knockback physics, and crystalline death explosions.
- Fluid 3D movement: fast strafing, jumping, and momentum downhill slope-sliding with dust trails.
- Automatic Phish-themed weaponry with synergistic upgrades across 4 active weapon slots and 4 passive item slots.
- Epic horde waves culminating in mid-run boss encounters (*The Watchful Hosemaster*) and a 10-minute final showdown with *King Wilson*.
- Clean dual-mode architecture: A unified title screen allowing the player to enter **SURVIVOR MODE** or the peaceful **1993 EXPLORER TOUR**.

---

## 2. Visual Systems & Game Feel ("Juice")

### 2.1 Post-Processing & Lighting
- **Bloom & Glow**: Emissive materials on magical projectiles, XP gems, weapon runes, and enemy eyes with post-processing bloom for neon-glow aesthetics.
- **Dynamic Shadows & Rim Lighting**: High-contrast directional lighting with Fresnel rim highlights on character models and enemies, ensuring clean readability even with 50+ enemies on screen.
- **Atmospheric Palette**:
  - Sky/Fog: Deep twilight synthwave gradient (indigo, magenta, amber horizon).
  - Biome-specific mood lights (sacred emerald forest glow, misty purple ghetto lanterns, volcanic crimson fortress spotlights).

### 2.2 Combat Hit Feedback & Particle Systems
- **Enemy Hit Reaction**: Instant white-flash shader toggle on damage + directional physics knockback impulse.
- **Screen Shake Engine**: Exponential trauma decay camera shake on heavy attacks, player damage, and boss spawns.
- **Floating Damage Numbers**:
  - Rendered in a high-performance 2D/WebGL billboard layer.
  - White for standard hits, bold glowing gold/red for critical strikes (`"142 CRIT!"`).
  - Spring-physics pop: numbers launch upward, scale up quickly, and fade out over 0.6s.
- **Particle System**:
  - *Enemy Shatter*: Defeated enemies explode into 12-20 glowing geometric shards that scatter with physics before dissipating.
  - *Projectile Trails*: Flowing ribbon trails, sparks, and energy motes behind arrows and staff bolts.
  - *Slide Dust*: When holding Slide (`Shift`) down mountain slopes, a plume of dust particles and speedlines trails behind the character.

---

## 3. Playable Hero Roster

Each character features a distinct, high-quality 3D model, animated running/sliding poses, and unique starting weapons/passives:

| Character | Title | Passive Trait | Starting Weapon |
| :--- | :--- | :--- | :--- |
| **Colonel Forbin** | The Long Island Pilgrim | **Surrender to the Flow**: +40% XP Gem collection radius, +15% Health regeneration. | **Mystic Staff**: Homing golden orbs. |
| **Tela** | Rebel of the Forest | **Multibeast Agility**: +25% Move Speed, +50% Downhill Slide Velocity. | **Rebel Recurve Bow**: Rapid piercing arrows. |
| **Rutherford the Brave** | Knight of the Lizards | **Plate of Lizards**: +60 Max HP, +35% Melee Knockback, starts with 5 Armor. | **Whirlwind Spear**: 360° sweeping cleave. |
| **The Famous Mockingbird** | Sacred Aviary Courier | **Featherfall Glide**: Low-gravity jump glide, +20% Attack Speed. | **Sky Dive Chimes**: Aerial chain lightning strikes. |

---

## 4. Arsenal & Upgrade Card Drafting

Players can equip up to **4 Weapons** and **4 Passive Items**. Weapons fire automatically on internal cooldowns, auto-targeting the nearest enemies in range.

### 4.1 Weapons (Levels 1 to 8)
1. **Pilgrim Staff**: Launches 1–5 homing arcane orbs with explosive impact radius.
2. **Rebel Recurve Bow**: Shoots rapid piercing arrows in player facing direction, penetrating 3–8 enemies.
3. **Whirlwind Spear**: Rapid 360° circular sweep dealing high knockback to all nearby enemies.
4. **Helping Friendly Runes**: 2–6 glowing ancient runic book pages orbiting the player as a protective buzzsaw.
5. **Divided Sky Lightning**: Calls down thunderbolts from the heavens that fork between 2–5 foes.
6. **Electrolux Vortex**: Deploys a spinning vacuum vortex that damages, pulls in enemies, and vacuums all XP gems across the arena.
7. **The Sloth's Cleaver**: Hurls heavy spinning meat cleavers in high parabolic arcs with massive area damage.

### 4.2 Passive Items (Levels 1 to 5)
- **Trey's Guitar Pick**: +15% / 30% / 45% / 60% / 75% Damage to all weapons.
- **Mike's Bassline**: +10% / 20% / 30% / 40% / 50% Attack Speed (CDR).
- **Page's Organ Boost**: +1 Projectile count to all multi-shot weapons.
- **Fishman's Doughnut**: +15% Move Speed & +25% Slide Speed.
- **Lizard Heart**: +30 Max HP & +2 HP/sec Regeneration.
- **Icculus's Glasses**: +30% Critical Hit Chance (2x damage).

### 4.3 Level-Up Drafting UI
- When the XP bar fills, gameplay smoothly freezes with a cinematic time-stop effect.
- A 3D holographic card deck appears presenting **3 randomized cards**.
- Cards have rarity borders (*Common Cyan, Rare Gold, Legendary Prismatic*), animated 3D hover tilt, and crisp stat descriptions.
- Selecting a card instantly applies the upgrade with a satisfying audio chime and resumes gameplay.

---

## 5. Enemy Hordes & Boss Encounters

Enemies spawn in scaling clusters around the arena perimeter, using spatial flocking AI to swarm the player while navigating around terrain obstacles:

1. **Wilson's Foot Soldiers (00:00–02:30)**:
   - Fast, low HP, swarming in large packs of 15–30.
2. **Corrupted Multibeasts (02:30–05:00)**:
   - Quadruped predators that leap toward the player in sudden bursts.
3. **Mini-Boss: The Watchful Hosemaster (05:00 Spawn)**:
   - Massive armored hound guardian with 4,000 HP.
   - Sprays high-pressure water stream causing heavy knockback.
   - Defeating him spawns a **Legendary Treasure Chest** containing 3 random upgrades!
4. **Citadel Royal Guards (05:00–09:30)**:
   - Heavy shielded lizard warriors with high armor and blocking front shields.
5. **Final Boss: King Wilson, Duke of Lizards (10:00 Spawn)**:
   - Gargantuan tyrant towering 12 units high with glowing royal mantle.
   - Multi-phase attack pattern: Crimson eye-beams, seismic shockwave stomps, and royal guard summons.
   - Victory upon defeating Wilson triggers the Gamehendge Liberation sequence!

---

## 6. Architecture & File Structure

```
d:/gamehenge/
├── index.html                 # Title screen mode selector, Survivor HUD, XP bar, Card modal
├── css/
│   ├── style.css              # Base styling & retro effects
│   └── survivor.css           # High-polish Survivor HUD, damage numbers, glowing cards, XP bar
└── js/
    ├── combat/
    │   ├── damage-text.js     # Floating spring-animated damage numbers & critical hit FX
    │   ├── particles.js       # Shard explosions, projectile trails, slide dust particles
    │   ├── weapons.js         # Weapon behaviors, firing cooldowns, projectile pooling, targeting
    │   ├── enemies.js         # Enemy horde spawner, flocking AI, collision, boss logic
    │   ├── gems.js            # Flow XP gems, magnet pull physics, pooling
    │   └── upgrades.js        # Upgrade card database, card drafting UI, stat calculations
    ├── survivor-manager.js    # Survivor state machine, game timer, kill counter, level-up loop
    ├── controls.js            # Enhanced with momentum downhill slope sliding (Shift)
    └── main.js                # Mode switcher: Survivor Mode vs Explorer Tour Mode
```

---

## 7. Verification Plan
1. **Automated Unit Tests**:
   - `tests/weapons.test.js`: Weapon cooldowns, auto-targeting math, projectile damage.
   - `tests/enemies.test.js`: Wave progression timer, enemy HP scaling, boss spawn triggers.
   - `tests/upgrades.test.js`: Leveling XP curve, card pool filtering, passive stat boosts.
2. **Live Visual & Browser Gameplay Verification**:
   - Verify character selection screen and smooth entry into 3D arena.
   - Verify 3D slope-sliding down mountain slopes with dust particle effects.
   - Verify auto-firing weapons hit enemy swarms with white flash, floating damage numbers, and particle shard explosions.
   - Verify XP gems vacuum to player, level-up card drafting modal appears, and upgrades apply cleanly.
   - Verify 60 FPS performance with 50+ active enemies and particles.
