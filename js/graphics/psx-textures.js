/**
 * Gamehendge PSX Texture Generator
 * Generates crunchy 32x32 & 64x64 pixelated textures with restricted 16-color retro palettes
 */

import * as THREE from '../vendor/three.module.js';

export const PALETTES = {
  terrain: [
    [42, 54, 38],   // Dark moss
    [58, 74, 48],   // Olive green
    [78, 98, 62],   // Forest grass
    [98, 82, 58],   // Dry dirt
    [120, 102, 74]  // Earthen clay
  ],
  stone: [
    [32, 36, 44],   // Deep slate
    [54, 60, 72],   // Weathered granite
    [78, 86, 98],   // Stone face
    [108, 116, 128], // Highlight stone
    [46, 68, 52]    // Mossy crack
  ],
  bark: [
    [34, 22, 16],   // Shadow bark
    [56, 38, 28],   // Core trunk
    [82, 58, 42],   // Dry bark
    [112, 84, 62]   // Bark ridge
  ],
  foliage: [
    [24, 46, 28],   // Dark pine
    [38, 72, 42],   // Mid pine
    [58, 104, 62],  // Highlight needles
    [82, 138, 84]   // Sunlit tip
  ],
  lizard: [
    [18, 52, 38],   // Deep scale
    [32, 84, 58],   // Emerald hide
    [52, 126, 84],  // Ridge scale
    [88, 168, 112]  // Underbelly highlight
  ]
};

export function generatePixelGrid(width, height, pixelFn) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const [r, g, b, a = 255] = pixelFn(x, y);
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = a;
    }
  }
  return { width, height, data };
}

// Pseudo-random noise helper based on coordinate hash
function hash2d(x, y, seed = 1) {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return n - Math.floor(n);
}

export function createTerrainPixels(width = 32, height = 32) {
  const pal = PALETTES.terrain;
  return generatePixelGrid(width, height, (x, y) => {
    const n = hash2d(x, y, 13.37);
    const n2 = hash2d(x * 2, y * 2, 42.1);
    const blend = (n + n2) * 0.5;
    const colorIndex = Math.min(pal.length - 1, Math.floor(blend * pal.length));
    const [r, g, b] = pal[colorIndex];
    return [r, g, b, 255];
  });
}

export function createCobblestonePixels(width = 32, height = 32) {
  const pal = PALETTES.stone;
  return generatePixelGrid(width, height, (x, y) => {
    const stoneSize = 8;
    const sx = Math.floor(x / stoneSize);
    const sy = Math.floor(y / stoneSize);
    const inTileX = x % stoneSize;
    const inTileY = y % stoneSize;

    // Mortar border
    const isMortar = (inTileX === 0 || inTileY === 0 || (inTileX === stoneSize - 1 && inTileY === stoneSize - 1));
    if (isMortar) {
      return [24, 26, 32, 255];
    }

    const n = hash2d(sx * 7 + x, sy * 5 + y, 99);
    const centerDist = Math.hypot(inTileX - stoneSize / 2, inTileY - stoneSize / 2) / (stoneSize * 0.7);
    const tone = Math.max(0, Math.min(pal.length - 1, Math.floor((1.0 - centerDist * 0.5 + n * 0.4) * pal.length)));
    const [r, g, b] = pal[tone] || pal[1];
    return [r, g, b, 255];
  });
}

export function createBarkPixels(width = 32, height = 32) {
  const pal = PALETTES.bark;
  return generatePixelGrid(width, height, (x, y) => {
    const verticalGrain = hash2d(x * 3, Math.floor(y / 4), 77);
    const n = hash2d(x, y, 12);
    const idx = Math.min(pal.length - 1, Math.floor((verticalGrain * 0.7 + n * 0.3) * pal.length));
    const [r, g, b] = pal[idx];
    return [r, g, b, 255];
  });
}

export function createPineFoliagePixels(width = 32, height = 32) {
  const pal = PALETTES.foliage;
  return generatePixelGrid(width, height, (x, y) => {
    const n = hash2d(x, y, 44.5);
    if (n < 0.15) {
      return [0, 0, 0, 0]; // Alpha cutout
    }
    const idx = Math.min(pal.length - 1, Math.floor(n * pal.length));
    const [r, g, b] = pal[idx];
    return [r, g, b, 255];
  });
}

export function createRuinStonePixels(width = 32, height = 32) {
  const pal = PALETTES.stone;
  return generatePixelGrid(width, height, (x, y) => {
    const row = Math.floor(y / 8);
    const offset = (row % 2) * 8;
    const col = Math.floor((x + offset) / 16);
    const inBlockX = (x + offset) % 16;
    const inBlockY = y % 8;

    if (inBlockX === 0 || inBlockY === 0) {
      return [20, 22, 26, 255]; // Deep dark mortar groove
    }

    const crack = hash2d(x, y, 51.2) > 0.88;
    if (crack) {
      return [46, 68, 52, 255]; // Moss inside crack
    }

    const n = hash2d(col * 3 + x, row * 7 + y, 31);
    const idx = Math.min(pal.length - 1, Math.floor(n * pal.length));
    const [r, g, b] = pal[idx];
    return [r, g, b, 255];
  });
}

export function createLizardSkinPixels(width = 32, height = 32) {
  const pal = PALETTES.lizard;
  return generatePixelGrid(width, height, (x, y) => {
    const hex = ((x + (y % 2) * 2) % 4 === 0) || ((y % 4) === 0);
    if (hex) {
      return [12, 34, 24, 255]; // Scale shadow
    }
    const n = hash2d(x, y, 82.1);
    const idx = Math.min(pal.length - 1, Math.floor(n * pal.length));
    const [r, g, b] = pal[idx];
    return [r, g, b, 255];
  });
}

export function createTweedPixels(width = 32, height = 32, baseHex = 0x4a6572) {
  const baseCol = new THREE.Color(baseHex);
  return generatePixelGrid(width, height, (x, y) => {
    const weave = (x + y) % 2 === 0 ? 0.88 : 1.12;
    const thread = hash2d(x, y, 19.8) * 0.2 - 0.1;
    const lum = Math.max(0.1, Math.min(1.4, weave + thread));
    return [
      Math.floor(baseCol.r * 255 * lum),
      Math.floor(baseCol.g * 255 * lum),
      Math.floor(baseCol.b * 255 * lum),
      255
    ];
  });
}

// Browser Canvas Texture Factory
const textureCache = new Map();

export function getPSXCanvasTexture(name, param = null) {
  if (typeof document === 'undefined') return null;

  const cacheKey = `${name}_${param || ''}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey);
  }

  let pixelData;
  switch (name) {
    case 'terrain': pixelData = createTerrainPixels(32, 32); break;
    case 'cobblestone': pixelData = createCobblestonePixels(32, 32); break;
    case 'bark': pixelData = createBarkPixels(32, 32); break;
    case 'foliage': pixelData = createPineFoliagePixels(32, 32); break;
    case 'ruins': pixelData = createRuinStonePixels(32, 32); break;
    case 'lizard': pixelData = createLizardSkinPixels(32, 32); break;
    case 'tweed': pixelData = createTweedPixels(32, 32, param || 0x4a6572); break;
    default: pixelData = createTerrainPixels(32, 32);
  }

  const canvas = document.createElement('canvas');
  canvas.width = pixelData.width;
  canvas.height = pixelData.height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(pixelData.width, pixelData.height);
  imgData.data.set(pixelData.data);
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;

  textureCache.set(cacheKey, tex);
  return tex;
}
