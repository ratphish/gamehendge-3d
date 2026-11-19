/**
 * Gamehendge Neo-CD-i Configuration & Lore Data
 */

export const GAMEHENDGE_CONFIG = {
  world: {
    size: 600,
    minX: -300,
    maxX: 300,
    minZ: -300,
    maxZ: 300,
    boundaryDamping: 280,
    waterLevel: 2.0,
    mountainPeakY: 90
  },

  biomes: {
    mountain: {
      name: "The Mountain of Icculus",
      x: 0,
      z: 0,
      radius: 70,
      theme: "forbin",
      ambientColor: 0x8a99b5,
      fogColor: 0xb4c2d6,
      desc: "The sacred, craggy peak where the great prophet Icculus resides in holy solitude."
    },
    forest: {
      name: "The Sacred Forest",
      x: -140,
      z: 140,
      radius: 80,
      theme: "lizards",
      ambientColor: 0x3d7e50,
      fogColor: 0x224830,
      desc: "A lush, canopy-rich primeval woodland inhabited by the peaceful Lizards."
    },
    ghetto: {
      name: "The Ghetto of Gamehendge",
      x: 150,
      z: 120,
      radius: 65,
      theme: "sloth",
      ambientColor: 0x5a4860,
      fogColor: 0x2d2235,
      desc: "A misty, claustrophobic slum of leaning wooden tenements where outlaws and hitmen linger."
    },
    castle: {
      name: "Wilson's Fortress",
      x: 140,
      z: -140,
      radius: 75,
      theme: "wilson",
      ambientColor: 0x7a3030,
      fogColor: 0x351717,
      desc: "The dark stone citadel where the cruel usurper King Wilson hoards the Helping Friendly Book."
    },
    lake: {
      name: "Lizard Lake",
      x: -60,
      z: 40,
      radius: 55,
      theme: "lizards",
      ambientColor: 0x2a5f78,
      fogColor: 0x183b4b,
      desc: "A serene, mystical body of water reflecting the sacred mountain above."
    }
  },

  characters: {
    mockingbird: {
      id: "mockingbird",
      name: "The Famous Mockingbird",
      title: "Sacred Courier of Icculus",
      color: 0x50e3c2,
      position: [0, 65, 30],
      dialogue: "Sent forth from the mountain crags by the almighty Icculus to retrieve the sacred Helping Friendly Book from the high castle.",
      quote: "Fly famous Mockingbird, fly!",
      choices: [
        { label: "Soar with the Mockingbird", action: "takeoff" },
        { label: "Listen to the birdsong", action: "audio_mockingbird" }
      ]
    },
    forbin: {
      id: "forbin",
      name: "Colonel Forbin",
      title: "The Traveler from Long Island",
      color: 0x5294e2,
      position: [-20, 15, 10],
      dialogue: "A retired colonel who stepped through a door into yesterday, seeking the truth behind the enslaved Lizards.",
      quote: "Why am I here? To climb the sacred mountain and plead for the Lizards.",
      choices: [
        { label: "Accompany on the mountain path", action: "walk_forbin" },
        { label: "Discuss the mission", action: "lore_forbin" }
      ]
    },
    sloth: {
      id: "sloth",
      name: "The Sloth",
      title: "The Ruthless Hitman",
      color: 0x8b572a,
      position: [145, 5, 115],
      dialogue: "They call me The Sloth... I work for Wilson, or whoever pays the coin. Bad news arrives slowly, but it always arrives.",
      quote: "Piece of cake. Consider Wilson handled.",
      choices: [
        { label: "Ask about the contract", action: "sloth_contract" },
        { label: "Back away slowly", action: "close" }
      ]
    },
    rutherford: {
      id: "rutherford",
      name: "Rutherford the Brave",
      title: "Knight of the Lizards",
      color: 0x9013fe,
      position: [-55, 3, 45],
      dialogue: "A courageous Lizard chieftain who led the failed charge against Wilson's fortress.",
      quote: "Our people have forgotten how to live without the Book. We do not know who wrote it or why.",
      choices: [
        { label: "Ask about the Lizards", action: "lore_lizards" },
        { label: "Salute the knight", action: "close" }
      ]
    },
    tela: {
      id: "tela",
      name: "Tela",
      title: "Jewel of Wilson's Foul Domain",
      color: 0xe91e63,
      position: [-130, 8, 130],
      dialogue: "A rebel insurgent on her multibeast, whose true loyalties remain clouded in mystery.",
      quote: "Wilson stole our freedom when he locked the Book in his high tower.",
      choices: [
        { label: "Hear her warning", action: "tela_warning" },
        { label: "Inspect multibeast", action: "close" }
      ]
    },
    wilson: {
      id: "wilson",
      name: "King Wilson",
      title: "The Duke of Lizards",
      color: 0xd0021b,
      position: [140, 32, -140],
      dialogue: "The tyrant who enslaved the Lizards and locked the Helping Friendly Book behind iron gates.",
      quote: "I am the Duke of Lizards! None shall touch the Book!",
      choices: [
        { label: "Chant 'WIL-SON!'", action: "wilson_chant" },
        { label: "Defy the tyrant", action: "close" }
      ]
    },
    icculus: {
      id: "icculus",
      name: "Icculus",
      title: "Author of the Helping Friendly Book",
      color: 0xf5a623,
      position: [0, 92, 0],
      dialogue: "The ancient philosopher and author of the Helping Friendly Book, perched high atop the holy mountain.",
      quote: "The trick was to surrender to the flow... Read the Book!",
      choices: [
        { label: "Read the Helping Friendly Book", action: "read_book" },
        { label: "Bow in reverence", action: "close" }
      ]
    }
  },

  audio: {
    themes: {
      lizards: {
        id: "lizards",
        title: "The Lizards",
        bpm: 124,
        key: "C",
        // Melodic sequence: [note, durationInSixteenths]
        melody: [
          ["E4", 2], ["G4", 2], ["C5", 4],
          ["B4", 2], ["A4", 2], ["G4", 4],
          ["A4", 2], ["G4", 2], ["E4", 2], ["D4", 2],
          ["C4", 8]
        ],
        bass: ["C3", "G2", "A2", "F2"]
      },
      mockingbird: {
        id: "mockingbird",
        title: "Fly Famous Mockingbird",
        bpm: 136,
        key: "D",
        melody: [
          ["D5", 1], ["F#5", 1], ["A5", 2],
          ["G5", 1], ["B5", 1], ["D6", 2],
          ["C#6", 2], ["A5", 2], ["F#5", 2], ["D5", 2],
          ["E5", 4], ["D5", 4]
        ],
        bass: ["D3", "G3", "A3", "D3"]
      },
      sloth: {
        id: "sloth",
        title: "The Sloth",
        bpm: 108,
        key: "Em",
        melody: [
          ["E3", 2], ["G3", 2], ["A3", 2], ["Bb3", 2],
          ["B3", 4], ["D4", 2], ["E4", 2],
          ["D4", 2], ["B3", 2], ["G3", 4]
        ],
        bass: ["E2", "E2", "G2", "A2"]
      },
      wilson: {
        id: "wilson",
        title: "Wilson",
        bpm: 128,
        key: "E",
        melody: [
          ["E4", 4], ["E4", 4], ["D4", 4], ["E4", 4],
          ["G4", 2], ["F#4", 2], ["E4", 8]
        ],
        bass: ["E2", "E2", "D2", "E2"]
      },
      forbin: {
        id: "forbin",
        title: "Colonel Forbin's Ascent",
        bpm: 112,
        key: "Gm",
        melody: [
          ["G4", 4], ["Bb4", 4], ["D5", 4], ["C5", 2], ["Bb4", 2],
          ["A4", 4], ["F4", 4], ["G4", 8]
        ],
        bass: ["G2", "Bb2", "F2", "G2"]
      }
    }
  }
};
