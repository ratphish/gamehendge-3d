/**
 * Gamehendge Neo-CD-i 3D Procedural World
 * Topography, Biomes, Landmarks, and Collision
 */

import * as THREE from './vendor/three.module.js';
import { GAMEHENDGE_CONFIG } from './config.js';

/**
 * Procedural heightmap calculation for Gamehendge
 */
export function calculateTerrainHeight(x, z) {
  // Base rolling hills
  let h = 4.0 + Math.sin(x * 0.02) * 2.5 + Math.cos(z * 0.02) * 2.5;

  // 1. The Mountain of Icculus at (0, 0)
  const distFromCenter = Math.hypot(x, z);
  if (distFromCenter < 100) {
    // Steep exponential crag up to ~90
    const mFactor = Math.max(0, 1 - distFromCenter / 100);
    h += Math.pow(mFactor, 2.0) * 85.0;
    // Craggy spiral ridge
    const angle = Math.atan2(z, x);
    h += Math.sin(angle * 3 + distFromCenter * 0.15) * 3.5 * mFactor;
  }

  // 2. Wilson's Castle Plateau at (140, -140)
  const distFromCastle = Math.hypot(x - 140, z - (-140));
  if (distFromCastle < 70) {
    const cFactor = Math.max(0, 1 - distFromCastle / 70);
    h += cFactor * 26.0;
  }

  // 3. Lizard Lake Basin at (-60, 40)
  const distFromLake = Math.hypot(x - (-60), z - 40);
  if (distFromLake < 65) {
    const lFactor = Math.max(0, 1 - distFromLake / 65);
    h -= lFactor * 16.0;
  }

  // 4. Sacred Forest at (-140, 140)
  const distFromForest = Math.hypot(x - (-140), z - 140);
  if (distFromForest < 80) {
    const fFactor = Math.max(0, 1 - distFromForest / 80);
    h += Math.sin(x * 0.08) * Math.cos(z * 0.08) * 3.0 * fFactor + 6.5 * fFactor;
  }

  // 5. The Ghetto at (150, 120)
  const distFromGhetto = Math.hypot(x - 150, z - 120);
  if (distFromGhetto < 60) {
    const gFactor = Math.max(0, 1 - distFromGhetto / 60);
    h = h * (1 - gFactor * 0.5) + 4.5 * gFactor; // Flattens into river mudflat
  }

  return h;
}

export class GameWorld {
  constructor(scene) {
    this.scene = scene;
    this.colliders = [];
    this.animatedObjects = [];

    this.terrainMesh = null;
    this.waterMesh = null;
    this.castleGroup = new THREE.Group();
    this.forestGroup = new THREE.Group();
    this.ghettoGroup = new THREE.Group();
    this.mountainAltar = new THREE.Group();

    this.initLighting();
    this.buildTerrain();
    this.buildWater();
    this.buildCastle();
    this.buildSacredForest();
    this.buildGhetto();
    this.buildMountainAltar();

    this.scene.add(this.castleGroup);
    this.scene.add(this.forestGroup);
    this.scene.add(this.ghettoGroup);
    this.scene.add(this.mountainAltar);
  }

  initLighting() {
    // Ambient light
    const ambient = new THREE.AmbientLight(0xdde8ff, 0.65);
    this.scene.add(ambient);

    // Directional sunlight
    this.sunLight = new THREE.DirectionalLight(0xfffaed, 1.2);
    this.sunLight.position.set(150, 250, 100);
    this.sunLight.castShadow = true;
    this.scene.add(this.sunLight);

    // Atmospheric mist / fog
    this.scene.fog = new THREE.FogExp2(0x202b38, 0.0035);
  }

  buildTerrain() {
    const size = GAMEHENDGE_CONFIG.world.size;
    const segments = 120;
    const geom = new THREE.PlaneGeometry(size, size, segments, segments);
    geom.rotateX(-Math.PI / 2);

    const pos = geom.attributes.position;
    const count = pos.count;
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      const vy = calculateTerrainHeight(vx, vz);
      pos.setY(i, vy);

      // Vertex color gradient
      let r = 0.22, g = 0.45, b = 0.24; // Lush grassland

      if (vy > 75) {
        // Mountain snow peak
        r = 0.92; g = 0.95; b = 1.0;
      } else if (vy > 45) {
        // Rocky high crags
        r = 0.52; g = 0.52; b = 0.58;
      } else if (vy < 2.5) {
        // Sandy beach / riverbed
        r = 0.55; g = 0.52; b = 0.38;
      } else if (vx > 90 && vz > 60) {
        // Ghetto murky cobblestone
        r = 0.35; g = 0.32; b = 0.35;
      } else if (vx > 90 && vz < -90) {
        // Wilson's dark volcanic bedrock
        r = 0.28; g = 0.24; b = 0.28;
      }

      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }

    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geom.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.85,
      metalness: 0.1,
      flatShading: true
    });

    this.terrainMesh = new THREE.Mesh(geom, mat);
    this.terrainMesh.receiveShadow = true;
    this.scene.add(this.terrainMesh);
  }

  buildWater() {
    const waterGeom = new THREE.PlaneGeometry(160, 160, 24, 24);
    waterGeom.rotateX(-Math.PI / 2);

    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x1d789e,
      roughness: 0.2,
      metalness: 0.7,
      transparent: true,
      opacity: 0.82,
      flatShading: true
    });

    this.waterMesh = new THREE.Mesh(waterGeom, waterMat);
    this.waterMesh.position.set(-60, GAMEHENDGE_CONFIG.world.waterLevel, 40);
    this.scene.add(this.waterMesh);
  }

  buildCastle() {
    const cx = 140, cz = -140;
    const baseElevation = calculateTerrainHeight(cx, cz);
    this.castleGroup.position.set(cx, baseElevation, cz);

    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x2c2c34,
      roughness: 0.9,
      flatShading: true
    });

    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x8a1c1c,
      roughness: 0.7,
      flatShading: true
    });

    // Central Keep
    const keepGeom = new THREE.BoxGeometry(28, 32, 28);
    const keep = new THREE.Mesh(keepGeom, stoneMat);
    keep.position.y = 16;
    this.castleGroup.add(keep);

    // 4 Corner Bastion Towers
    const towerGeom = new THREE.CylinderGeometry(4.5, 5.5, 42, 8);
    const roofGeom = new THREE.ConeGeometry(5.5, 10, 8);
    const offsets = [
      [-16, -16], [16, -16],
      [-16, 16], [16, 16]
    ];

    offsets.forEach(([ox, oz]) => {
      const tower = new THREE.Mesh(towerGeom, stoneMat);
      tower.position.set(ox, 21, oz);
      const roof = new THREE.Mesh(roofGeom, roofMat);
      roof.position.set(ox, 47, oz);
      this.castleGroup.add(tower);
      this.castleGroup.add(roof);
    });

    // Crimson Flag Banners
    const flagMat = new THREE.MeshStandardMaterial({ color: 0xd0021b, side: THREE.DoubleSide });
    const flagGeom = new THREE.PlaneGeometry(6, 4);
    const flag = new THREE.Mesh(flagGeom, flagMat);
    flag.position.set(0, 36, 14.5);
    this.castleGroup.add(flag);

    // Register Castle Collider (radius 35)
    this.colliders.push({
      tag: 'castle_keep',
      x: cx,
      z: cz,
      radius: 35
    });
  }

  buildSacredForest() {
    const fx = -140, fz = 140;
    this.forestGroup.position.set(0, 0, 0);

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a2e18, roughness: 0.9, flatShading: true });
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x1f5c2b, roughness: 0.8, flatShading: true });
    const foliageMat2 = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.8, flatShading: true });

    const trunkGeom = new THREE.CylinderGeometry(0.8, 1.2, 7, 5);
    const foliageGeom1 = new THREE.ConeGeometry(4.5, 9, 6);
    const foliageGeom2 = new THREE.ConeGeometry(3.5, 7, 6);

    // Scatter 45 procedural trees around forest center
    for (let i = 0; i < 45; i++) {
      const radius = 10 + Math.random() * 65;
      const angle = Math.random() * Math.PI * 2;
      const tx = fx + Math.cos(angle) * radius;
      const tz = fz + Math.sin(angle) * radius;
      const ty = calculateTerrainHeight(tx, tz);

      const tree = new THREE.Group();
      tree.position.set(tx, ty, tz);

      const trunk = new THREE.Mesh(trunkGeom, trunkMat);
      trunk.position.y = 3.5;
      tree.add(trunk);

      const f1 = new THREE.Mesh(foliageGeom1, Math.random() > 0.5 ? foliageMat : foliageMat2);
      f1.position.y = 9;
      tree.add(f1);

      const f2 = new THREE.Mesh(foliageGeom2, foliageMat);
      f2.position.y = 13.5;
      tree.add(f2);

      const scale = 0.7 + Math.random() * 0.6;
      tree.scale.set(scale, scale, scale);
      this.forestGroup.add(tree);
    }

    // Sacred Lizards Campfire
    const campX = fx + 5, campZ = fz - 5;
    const campY = calculateTerrainHeight(campX, campZ);

    const fireLight = new THREE.PointLight(0xff7700, 2.0, 30);
    fireLight.position.set(campX, campY + 2.0, campZ);
    this.forestGroup.add(fireLight);
    this.campfireLight = fireLight;
    this.animatedObjects.push({
      update: (time) => {
        fireLight.intensity = 1.8 + Math.sin(time * 12) * 0.4;
      }
    });

    // Glowing mystical mushrooms
    const shroomMat = new THREE.MeshStandardMaterial({
      color: 0x50e3c2,
      emissive: 0x50e3c2,
      emissiveIntensity: 0.8
    });
    const shroomGeom = new THREE.SphereGeometry(0.8, 6, 6);
    for (let m = 0; m < 12; m++) {
      const sx = campX + (Math.random() - 0.5) * 20;
      const sz = campZ + (Math.random() - 0.5) * 20;
      const sy = calculateTerrainHeight(sx, sz);
      const shroom = new THREE.Mesh(shroomGeom, shroomMat);
      shroom.position.set(sx, sy + 0.4, sz);
      this.forestGroup.add(shroom);
    }
  }

  buildGhetto() {
    const gx = 150, gz = 120;
    const houseMat = new THREE.MeshStandardMaterial({ color: 0x3d352e, roughness: 0.95, flatShading: true });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x221d1a, roughness: 0.9, flatShading: true });

    // Cluster of 8 crooked slum dwellings
    const buildingCoords = [
      [135, 110, 10, 12, 10],
      [155, 105, 12, 14, 11],
      [140, 130, 9, 11, 9],
      [160, 128, 11, 15, 10],
      [170, 115, 8, 10, 8],
      [125, 120, 10, 12, 9],
      [148, 142, 11, 13, 10],
      [168, 138, 9, 11, 9]
    ];

    buildingCoords.forEach(([bx, bz, w, h, d]) => {
      const by = calculateTerrainHeight(bx, bz);
      const bGeom = new THREE.BoxGeometry(w, h, d);
      const bMesh = new THREE.Mesh(bGeom, houseMat);
      bMesh.position.set(bx, by + h / 2, bz);

      const rGeom = new THREE.ConeGeometry(Math.max(w, d) * 0.75, 5, 4);
      rGeom.rotateY(Math.PI / 4);
      const rMesh = new THREE.Mesh(rGeom, roofMat);
      rMesh.position.set(bx, by + h + 2.5, bz);

      this.ghettoGroup.add(bMesh);
      this.ghettoGroup.add(rMesh);

      // Register collision box
      this.colliders.push({
        tag: 'ghetto_building',
        x: bx,
        z: bz,
        radius: Math.max(w, d) * 0.55
      });
    });

    // Flickering streetlamp near The Sloth's alleyway
    const lampX = 145, lampZ = 115;
    const lampY = calculateTerrainHeight(lampX, lampZ);
    const lampLight = new THREE.PointLight(0xffb74d, 1.6, 25);
    lampLight.position.set(lampX, lampY + 5.0, lampZ);
    this.ghettoGroup.add(lampLight);
  }

  buildMountainAltar() {
    // Summit altar for Icculus and the Helping Friendly Book
    const peakY = calculateTerrainHeight(0, 0);
    this.mountainAltar.position.set(0, peakY, 0);

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x9e9e9e, roughness: 0.7, flatShading: true });
    const altarGeom = new THREE.CylinderGeometry(6, 7.5, 3, 8);
    const altar = new THREE.Mesh(altarGeom, stoneMat);
    altar.position.y = 1.5;
    this.mountainAltar.add(altar);

    // Sacred Pedestal
    const pedGeom = new THREE.BoxGeometry(2, 4, 2);
    const ped = new THREE.Mesh(pedGeom, stoneMat);
    ped.position.y = 4.5;
    this.mountainAltar.add(ped);

    // Floating Golden Helping Friendly Book
    const bookGroup = new THREE.Group();
    bookGroup.position.set(0, 7.5, 0);

    const coverMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.8,
      roughness: 0.2
    });
    const pageMat = new THREE.MeshStandardMaterial({ color: 0xffffff });

    const cover = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.4, 3.2), coverMat);
    const pages = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.35, 3.0), pageMat);
    bookGroup.add(cover);
    bookGroup.add(pages);

    // Glowing holy aura
    const bookLight = new THREE.PointLight(0xffe082, 2.5, 20);
    bookLight.position.set(0, 8.5, 0);
    this.mountainAltar.add(bookLight);
    this.mountainAltar.add(bookGroup);

    this.animatedObjects.push({
      update: (time) => {
        bookGroup.rotation.y = time * 0.8;
        bookGroup.position.y = 7.5 + Math.sin(time * 2) * 0.4;
      }
    });

    this.colliders.push({
      tag: 'mountain_altar',
      x: 0,
      z: 0,
      radius: 6.0
    });
  }

  getTerrainHeight(x, z) {
    return calculateTerrainHeight(x, z);
  }

  checkCollision(x, z, radius = 2.0) {
    for (const c of this.colliders) {
      const dist = Math.hypot(x - c.x, z - c.z);
      if (dist < (c.radius + radius)) {
        return true;
      }
    }
    return false;
  }

  update(delta, timeSec = 0) {
    // Animate water subtle surface pulsing
    if (this.waterMesh) {
      this.waterMesh.position.y = GAMEHENDGE_CONFIG.world.waterLevel + Math.sin(timeSec * 1.5) * 0.15;
    }

    // Animate campfire, book hover, etc.
    for (const obj of this.animatedObjects) {
      obj.update(timeSec);
    }
  }
}
