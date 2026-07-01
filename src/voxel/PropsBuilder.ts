import * as THREE from 'three';
import type { WorldObject } from '../types';
import { getMaterial } from './Materials';
import { createBlock, createVoxelGroup, registerVoxelBuilder } from './VoxelBuilder';

export function buildProp(def: WorldObject): THREE.Object3D {
  const group = createVoxelGroup();
  group.name = def.id;
  return group;
}

function register(id: string, fn: (def: WorldObject) => THREE.Object3D): void {
  registerVoxelBuilder(id, fn);
}

register('keyboard', () => {
  const g = createVoxelGroup();
  g.name = 'keyboard';
  const kbMat = getMaterial('keyboard');
  const keyMat = getMaterial('keycap');

  g.add(createBlock(0.35, 0.03, 0.12, kbMat, 0, 0, 0));

  // Key rows
  const rowPositions: [number, number, number][] = [
    [-0.12, 0.03, 0.04], [-0.06, 0.03, 0.04], [0, 0.03, 0.04], [0.06, 0.03, 0.04], [0.12, 0.03, 0.04],
    [-0.12, 0.03, 0], [-0.06, 0.03, 0], [0, 0.03, 0], [0.06, 0.03, 0], [0.12, 0.03, 0],
    [-0.12, 0.03, -0.04], [-0.06, 0.03, -0.04], [0, 0.03, -0.04], [0.06, 0.03, -0.04], [0.12, 0.03, -0.04],
    [-0.12, 0.03, -0.08], [-0.06, 0.03, -0.08], [0, 0.03, -0.08], [0.06, 0.03, -0.08],
  ];
  for (const [kx, ky, kz] of rowPositions) {
    g.add(createBlock(0.035, 0.02, 0.025, keyMat, kx, ky + 0.02, kz));
  }
  // Space bar
  g.add(createBlock(0.1, 0.02, 0.025, keyMat, 0, 0.03, -0.08));

  return g;
});

register('mouse', () => {
  const g = createVoxelGroup();
  g.name = 'mouse';
  const mouseMat = getMaterial('mouse');

  // Main body
  g.add(createBlock(0.06, 0.03, 0.1, mouseMat, 0, 0, 0));
  // Top dome
  g.add(createBlock(0.05, 0.02, 0.08, mouseMat, 0, 0.02, 0.01));
  // Scroll wheel
  g.add(createBlock(0.015, 0.02, 0.015, getMaterial('keycap'), 0, 0.025, 0.02));
  // Left/right buttons (subtle line)
  g.add(createBlock(0.023, 0.001, 0.06, getMaterial('keyboard'), -0.013, 0.035, 0.01));
  g.add(createBlock(0.023, 0.001, 0.06, getMaterial('keyboard'), 0.013, 0.035, 0.01));
  // Cable (small stub)
  g.add(createBlock(0.01, 0.01, 0.04, getMaterial('keyboard'), 0, 0.015, -0.07));

  return g;
});

register('coffee-mug', () => {
  const g = createVoxelGroup();
  g.name = 'coffee-mug';
  const mugMat = getMaterial('coffee');
  const lidMat = getMaterial('coffeeLid');

  // Cup body
  g.add(createBlock(0.06, 0.08, 0.06, mugMat, 0, 0, 0));
  // Handle
  g.add(createBlock(0.025, 0.04, 0.025, mugMat, 0.04, 0.01, 0));
  // Lid
  g.add(createBlock(0.065, 0.015, 0.065, lidMat, 0, 0.045, 0));
  // Steam (small translucent blocks)
  const steamMat = getMaterial('ceiling');
  const steam = createBlock(0.01, 0.02, 0.01, steamMat, -0.01, 0.07, 0);
  steam.material = getMaterial('ceiling', { transparent: true, opacity: 0.3 });
  g.add(steam);
  const steam2 = createBlock(0.01, 0.02, 0.01, steamMat, 0.015, 0.08, -0.005);
  steam2.material = getMaterial('ceiling', { transparent: true, opacity: 0.25 });
  g.add(steam2);

  return g;
});
