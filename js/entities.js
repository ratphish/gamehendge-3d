/**
 * Gamehendge Neo-CD-i Procedural 3D Character Entities
 * Pure procedural Three.js geometry & animations - Zero external model files
 */

import * as THREE from './vendor/three.module.js';
import { GAMEHENDGE_CONFIG } from './config.js';

/**
 * Creates the Famous Mockingbird 3D model with flapping wings
 */
export function createMockingbirdModel(isAvatar = false) {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x38c172,
    roughness: 0.4,
    metalness: 0.3,
    flatShading: true
  });
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0x50e3c2,
    roughness: 0.3,
    metalness: 0.4,
    side: THREE.DoubleSide,
    flatShading: true
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf5a623,
    metalness: 0.8,
    roughness: 0.2
  });

  // Torso / Body
  const bodyGeom = new THREE.ConeGeometry(0.8, 3.2, 5);
  bodyGeom.rotateX(Math.PI / 2);
  const body = new THREE.Mesh(bodyGeom, bodyMat);
  group.add(body);

  // Head & Beak
  const headGeom = new THREE.DodecahedronGeometry(0.7, 0);
  const head = new THREE.Mesh(headGeom, bodyMat);
  head.position.set(0, 0.4, 1.8);
  group.add(head);

  const beakGeom = new THREE.ConeGeometry(0.25, 0.9, 4);
  beakGeom.rotateX(Math.PI / 2);
  const beak = new THREE.Mesh(beakGeom, goldMat);
  beak.position.set(0, 0.3, 2.6);
  group.add(beak);

  // Crown feathers
  const crest = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.8, 3), goldMat);
  crest.position.set(0, 1.0, 1.6);
  crest.rotation.x = -0.4;
  group.add(crest);

  // Left Wing with pivot joint
  const leftWingPivot = new THREE.Group();
  leftWingPivot.position.set(0.6, 0.3, 0.2);
  const wingGeom = new THREE.BoxGeometry(2.8, 0.1, 1.2);
  wingGeom.translate(1.4, 0, 0);
  const leftWingMesh = new THREE.Mesh(wingGeom, wingMat);
  leftWingPivot.add(leftWingMesh);
  group.add(leftWingPivot);

  // Right Wing with pivot joint
  const rightWingPivot = new THREE.Group();
  rightWingPivot.position.set(-0.6, 0.3, 0.2);
  const rightWingMesh = new THREE.Mesh(wingGeom, wingMat);
  rightWingMesh.scale.x = -1;
  rightWingPivot.add(rightWingMesh);
  group.add(rightWingPivot);

  // Tail feathers
  const tailGeom = new THREE.BoxGeometry(1.2, 0.08, 2.0);
  const tail = new THREE.Mesh(tailGeom, goldMat);
  tail.position.set(0, 0.2, -2.0);
  tail.rotation.x = 0.2;
  group.add(tail);

  group.leftWing = leftWingPivot;
  group.rightWing = rightWingPivot;

  group.animate = (time, speed = 1.0) => {
    const flap = Math.sin(time * 14 * speed) * 0.65;
    leftWingPivot.rotation.z = flap;
    rightWingPivot.rotation.z = -flap;
    body.position.y = Math.sin(time * 6) * 0.15;
  };

  return group;
}

/**
 * Creates Colonel Forbin 3D model
 */
export function createForbinModel(isAvatar = false) {
  const group = new THREE.Group();

  const coatMat = new THREE.MeshStandardMaterial({ color: 0x4a6572, roughness: 0.8, flatShading: true });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xf6d8ae, roughness: 0.7, flatShading: true });
  const bootMat = new THREE.MeshStandardMaterial({ color: 0x2e1c11, roughness: 0.9, flatShading: true });
  const staffMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.6, roughness: 0.3 });

  // Torso / Greatcoat
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 1.8, 6), coatMat);
  torso.position.y = 2.0;
  group.add(torso);

  // Head with traveler hat
  const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5, 0), skinMat);
  head.position.y = 3.2;
  group.add(head);

  const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.1, 8), coatMat);
  hatBrim.position.y = 3.5;
  const hatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.6, 6), coatMat);
  hatTop.position.y = 3.8;
  group.add(hatBrim);
  group.add(hatTop);

  // Left Leg
  const leftLegPivot = new THREE.Group();
  leftLegPivot.position.set(0.35, 1.1, 0);
  const legGeom = new THREE.BoxGeometry(0.35, 1.1, 0.35);
  legGeom.translate(0, -0.55, 0);
  const leftLegMesh = new THREE.Mesh(legGeom, bootMat);
  leftLegPivot.add(leftLegMesh);
  group.add(leftLegPivot);

  // Right Leg
  const rightLegPivot = new THREE.Group();
  rightLegPivot.position.set(-0.35, 1.1, 0);
  const rightLegMesh = new THREE.Mesh(legGeom, bootMat);
  rightLegPivot.add(rightLegMesh);
  group.add(rightLegPivot);

  // Walking Staff in hand
  const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.2, 5), staffMat);
  staff.position.set(0.9, 1.8, 0.4);
  staff.rotation.x = 0.15;
  group.add(staff);

  group.leftLeg = leftLegPivot;
  group.rightLeg = rightLegPivot;

  group.animate = (time, isMoving = false) => {
    if (isMoving) {
      const swing = Math.sin(time * 8) * 0.6;
      leftLegPivot.rotation.x = swing;
      rightLegPivot.rotation.x = -swing;
      torso.position.y = 2.0 + Math.abs(Math.sin(time * 8)) * 0.1;
      head.position.y = 3.2 + Math.abs(Math.sin(time * 8)) * 0.1;
    } else {
      leftLegPivot.rotation.x = 0;
      rightLegPivot.rotation.x = 0;
      torso.position.y = 2.0 + Math.sin(time * 2) * 0.04;
      head.position.y = 3.2 + Math.sin(time * 2) * 0.04;
    }
  };

  return group;
}

/**
 * Creates The Sloth model
 */
export function createSlothModel() {
  const group = new THREE.Group();
  const furMat = new THREE.MeshStandardMaterial({ color: 0x6e523f, roughness: 0.95, flatShading: true });
  const faceMat = new THREE.MeshStandardMaterial({ color: 0xc8b6a6, roughness: 0.8, flatShading: true });
  const clawMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f, metalness: 0.4, roughness: 0.5 });

  // Chunky slouching body
  const body = new THREE.Mesh(new THREE.DodecahedronGeometry(1.5, 1), furMat);
  body.scale.set(1.1, 0.9, 1.2);
  body.position.set(0, 1.2, 0);
  group.add(body);

  // Mask face
  const face = new THREE.Mesh(new THREE.SphereGeometry(0.8, 6, 6), faceMat);
  face.position.set(0, 1.8, 0.8);
  group.add(face);

  // Long hooked arms
  const armGeom = new THREE.CylinderGeometry(0.3, 0.25, 2.0, 5);
  armGeom.translate(0, -1.0, 0);

  const leftArm = new THREE.Mesh(armGeom, furMat);
  leftArm.position.set(1.2, 1.8, 0.4);
  leftArm.rotation.z = -0.5;
  leftArm.rotation.x = 0.4;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeom, furMat);
  rightArm.position.set(-1.2, 1.8, 0.4);
  rightArm.rotation.z = 0.5;
  rightArm.rotation.x = 0.4;
  group.add(rightArm);

  // Claws
  const claw = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.6, 4), clawMat);
  claw.position.set(1.7, 0.3, 1.2);
  claw.rotation.x = 1.0;
  group.add(claw);

  group.animate = (time) => {
    // Heavy, slow breathing motion
    body.scale.y = 0.9 + Math.sin(time * 1.5) * 0.05;
    leftArm.rotation.x = 0.4 + Math.sin(time * 1.2) * 0.1;
  };

  return group;
}

/**
 * Creates Rutherford the Brave model
 */
export function createRutherfordModel() {
  const group = new THREE.Group();
  const armorMat = new THREE.MeshStandardMaterial({ color: 0x9013fe, metalness: 0.7, roughness: 0.3, flatShading: true });
  const lizardMat = new THREE.MeshStandardMaterial({ color: 0x48bb78, roughness: 0.6, flatShading: true });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8 });

  // Lizard Knight Body & Armor
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.7, 2.0, 6), armorMat);
  torso.position.y = 2.0;
  group.add(torso);

  // Snouted Lizard Head with helmet
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.4, 5), lizardMat);
  head.position.set(0, 3.4, 0.4);
  head.rotation.x = Math.PI / 2.8;
  group.add(head);

  const helm = new THREE.Mesh(new THREE.SphereGeometry(0.7, 6, 6), armorMat);
  helm.position.set(0, 3.4, 0);
  group.add(helm);

  // Knight Shield
  const shield = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.6, 1.2), goldMat);
  shield.position.set(1.0, 2.0, 0.4);
  group.add(shield);

  // Spear
  const spear = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.0, 5), goldMat);
  spear.position.set(-1.0, 2.5, 0.2);
  group.add(spear);

  group.animate = (time) => {
    torso.position.y = 2.0 + Math.sin(time * 2.2) * 0.05;
    spear.rotation.z = Math.sin(time * 1.5) * 0.05;
  };

  return group;
}

/**
 * Creates Tela model
 */
export function createTelaModel() {
  const group = new THREE.Group();
  const cloakMat = new THREE.MeshStandardMaterial({ color: 0xe91e63, roughness: 0.7, flatShading: true });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf5a623, metalness: 0.6 });

  // Flowing rebel cloak
  const cloak = new THREE.Mesh(new THREE.ConeGeometry(1.0, 2.8, 6), cloakMat);
  cloak.position.y = 1.4;
  group.add(cloak);

  // Hooded head
  const hood = new THREE.Mesh(new THREE.DodecahedronGeometry(0.65, 0), cloakMat);
  hood.position.y = 2.9;
  group.add(hood);

  // Ornate bow
  const bow = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.06, 4, 12, Math.PI), goldMat);
  bow.position.set(0, 2.0, -0.6);
  bow.rotation.y = Math.PI / 2;
  group.add(bow);

  group.animate = (time) => {
    cloak.rotation.y = Math.sin(time * 1.5) * 0.1;
  };

  return group;
}

/**
 * Creates King Wilson model
 */
export function createWilsonModel() {
  const group = new THREE.Group();
  const royalMat = new THREE.MeshStandardMaterial({ color: 0xd0021b, roughness: 0.6, flatShading: true });
  const crownMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.2 });

  // Imposing royal mantle
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.3, 3.0, 7), royalMat);
  torso.position.y = 2.2;
  group.add(torso);

  // Head with jagged crown
  const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7, 0), new THREE.MeshStandardMaterial({ color: 0xf4d0b0 }));
  head.position.y = 4.0;
  group.add(head);

  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.7, 0.6, 6), crownMat);
  crown.position.y = 4.6;
  group.add(crown);

  group.animate = (time) => {
    torso.position.y = 2.2 + Math.sin(time * 1.8) * 0.06;
  };

  return group;
}

/**
 * Creates Icculus model
 */
export function createIcculusModel() {
  const group = new THREE.Group();
  const robeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffe082,
    emissiveIntensity: 0.35,
    roughness: 0.5,
    flatShading: true
  });
  const beardMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f0 });

  // Floating sage robe
  const robe = new THREE.Mesh(new THREE.ConeGeometry(1.2, 3.5, 7), robeMat);
  robe.position.y = 1.8;
  group.add(robe);

  // Head with long beard
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.65, 7, 7), new THREE.MeshStandardMaterial({ color: 0xf5deb3 }));
  head.position.y = 3.6;
  group.add(head);

  const beard = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.4, 5), beardMat);
  beard.position.set(0, 2.9, 0.45);
  beard.rotation.x = -0.2;
  group.add(beard);

  group.animate = (time) => {
    // Ethereal levitation
    robe.position.y = 1.8 + Math.sin(time * 2.0) * 0.12;
    head.position.y = 3.6 + Math.sin(time * 2.0) * 0.12;
    beard.position.y = 2.9 + Math.sin(time * 2.0) * 0.12;
    robe.rotation.y = time * 0.3;
  };

  return group;
}

export class EntityManager {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.characters = new Map();

    this.mockingbirdAvatar = createMockingbirdModel(true);
    this.forbinAvatar = createForbinModel(true);

    this.initCharacters();
  }

  initCharacters() {
    const registry = {
      mockingbird: () => createMockingbirdModel(),
      forbin: () => createForbinModel(),
      sloth: () => createSlothModel(),
      rutherford: () => createRutherfordModel(),
      tela: () => createTelaModel(),
      wilson: () => createWilsonModel(),
      icculus: () => createIcculusModel()
    };

    for (const [id, config] of Object.entries(GAMEHENDGE_CONFIG.characters)) {
      const createFn = registry[id];
      if (!createFn) continue;

      const group = createFn();
      const [x, defaultY, z] = config.position;
      const terrainY = this.world.getTerrainHeight(x, z);
      const actualY = Math.max(defaultY, terrainY);

      group.position.set(x, actualY, z);
      this.scene.add(group);

      this.characters.set(id, {
        id,
        config,
        group,
        position: group.position
      });
    }
  }

  getNearbyCharacter(playerPos, threshold = 15) {
    for (const [id, char] of this.characters.entries()) {
      const dist = playerPos.distanceTo(char.group.position);
      if (dist <= threshold) {
        return char;
      }
    }
    return null;
  }

  update(delta, playerPos, timeSec = 0) {
    for (const char of this.characters.values()) {
      if (char.group.animate) {
        char.group.animate(timeSec);
      }
    }
  }
}
