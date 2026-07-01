import * as THREE from 'three';
import type { WorldObject } from '../types';
import { getMaterial } from './Materials';
import { createBlock, createVoxelGroup, registerVoxelBuilder } from './VoxelBuilder';

export function buildDecoration(def: WorldObject): THREE.Object3D {
  const group = createVoxelGroup();
  group.name = def.id;
  return group;
}

function register(id: string, fn: (def: WorldObject) => THREE.Object3D): void {
  registerVoxelBuilder(id, fn);
}

// --- RUG ---

register('desk-rug', () => {
  const g = createVoxelGroup();
  g.name = 'desk-rug';
  const rugMat = getMaterial('rug');

  const rug = createBlock(1.2, 0.02, 0.8, rugMat, 0, 0, 0);
  rug.material = getMaterial('rug', { roughness: 0.9 });
  g.add(rug);

  // Rug border
  g.add(createBlock(1.2, 0.003, 0.04, getMaterial('accentLine'), 0, 0.01, 0.38));
  g.add(createBlock(1.2, 0.003, 0.04, getMaterial('accentLine'), 0, 0.01, -0.38));
  g.add(createBlock(0.04, 0.003, 0.72, getMaterial('accentLine'), 0.58, 0.01, 0));
  g.add(createBlock(0.04, 0.003, 0.72, getMaterial('accentLine'), -0.58, 0.01, 0));

  return g;
});

register('wall-light', () => {
  const g = createVoxelGroup();
  g.name = 'wall-light';
  const metalMat = getMaterial('chairMetal');
  const ceilLightMat = getMaterial('ceilingLight');

  // Wall mount
  g.add(createBlock(0.03, 0.03, 0.06, metalMat, 0, 0.06, 0));
  // Arm
  g.add(createBlock(0.02, 0.02, 0.1, metalMat, 0, 0.04, 0));
  // Light shade
  g.add(createBlock(0.15, 0.08, 0.12, ceilLightMat, 0, 0.08, 0.06));
  // Glow
  const glow = createBlock(0.12, 0.06, 0.1, ceilLightMat, 0, 0.08, 0.06);
  glow.material = getMaterial('ceilingLight', { emissive: 0xffeecc, emissiveIntensity: 0.8 });
  g.add(glow);

  return g;
});

register('small-plant', () => {
  const g = createVoxelGroup();
  g.name = 'small-plant';
  const floorMat = getMaterial('floor');
  const bookGreen = getMaterial('bookGreen');

  // Pot
  g.add(createBlock(0.1, 0.08, 0.1, floorMat, 0, 0.04, 0));
  g.add(createBlock(0.08, 0.04, 0.08, floorMat, 0, 0.1, 0));
  // Stem
  g.add(createBlock(0.015, 0.08, 0.015, bookGreen, 0, 0.16, 0));
  // Leaves
  g.add(createBlock(0.08, 0.02, 0.06, bookGreen, 0.04, 0.2, 0));
  g.add(createBlock(0.06, 0.02, 0.08, bookGreen, -0.03, 0.22, 0.02));
  g.add(createBlock(0.07, 0.02, 0.05, bookGreen, 0.01, 0.24, -0.03));
  g.add(createBlock(0.05, 0.02, 0.06, bookGreen, -0.02, 0.26, 0.01));

  return g;
});

register('picture-frame', () => {
  const g = createVoxelGroup();
  g.name = 'picture-frame';
  const frameMat = getMaterial('frame');
  const matMat = getMaterial('frameMat');

  g.add(createBlock(0.3, 0.22, 0.04, frameMat, 0, 0, 0));
  g.add(createBlock(0.26, 0.18, 0.03, matMat, 0, 0, 0.035));
  g.add(createBlock(0.02, 0.22, 0.04, frameMat, -0.14, 0, 0));
  g.add(createBlock(0.02, 0.22, 0.04, frameMat, 0.14, 0, 0));
  g.add(createBlock(0.26, 0.02, 0.04, frameMat, 0, -0.1, 0));
  g.add(createBlock(0.26, 0.02, 0.04, frameMat, 0, 0.1, 0));

  return g;
});

register('ceiling-light', () => {
  const g = createVoxelGroup();
  g.name = 'ceiling-light';
  const ceilMat = getMaterial('ceiling');
  const ceilLightMat = getMaterial('ceilingLight');

  // Mount
  g.add(createBlock(0.08, 0.02, 0.08, ceilMat, 0, -0.01, 0));
  // Light fixture
  g.add(createBlock(0.3, 0.06, 0.3, ceilLightMat, 0, -0.04, 0));
  // Glow panel
  const glow = createBlock(0.25, 0.03, 0.25, ceilLightMat, 0, -0.065, 0);
  glow.material = getMaterial('ceilingLight', { emissive: 0xffeecc, emissiveIntensity: 1.2 });
  g.add(glow);

  return g;
});

register('cabinet', () => {
  const g = createVoxelGroup();
  g.name = 'cabinet';
  const cabinetMat = getMaterial('cabinet');
  const metalMat = getMaterial('chairMetal');

  // Body
  g.add(createBlock(0.5, 0.7, 0.35, cabinetMat, 0, 0.35, 0));
  // Door panels
  g.add(createBlock(0.22, 0.6, 0.02, cabinetMat, -0.13, 0.37, 0.17));
  g.add(createBlock(0.22, 0.6, 0.02, cabinetMat, 0.13, 0.37, 0.17));
  // Handles
  g.add(createBlock(0.005, 0.02, 0.02, metalMat, -0.13, 0.37, 0.18));
  g.add(createBlock(0.005, 0.02, 0.02, metalMat, 0.13, 0.37, 0.18));
  // Top
  g.add(createBlock(0.52, 0.02, 0.37, cabinetMat, 0, 0.71, 0));

  g.userData.collidable = true;
  return g;
});

register('router', () => {
  const g = createVoxelGroup();
  g.name = 'router';
  const serverMat = getMaterial('server');
  const accentMat = getMaterial('serverAccent');
  const lightMat = getMaterial('serverLight');

  g.add(createBlock(0.2, 0.03, 0.14, serverMat, 0, 0, 0));
  g.add(createBlock(0.18, 0.02, 0.12, accentMat, 0, 0.025, 0));

  // Antennas
  g.add(createBlock(0.01, 0.08, 0.01, serverMat, -0.07, 0.07, -0.05));
  g.add(createBlock(0.01, 0.08, 0.01, serverMat, 0.07, 0.07, -0.05));
  g.add(createBlock(0.01, 0.08, 0.01, serverMat, -0.07, 0.07, 0.05));
  g.add(createBlock(0.01, 0.08, 0.01, serverMat, 0.07, 0.07, 0.05));

  // LED
  const led = createBlock(0.015, 0.01, 0.015, lightMat, -0.05, 0.035, 0.06);
  led.material = getMaterial('serverLight', { emissive: 0x00ff00, emissiveIntensity: 0.4 });
  g.add(led);

  return g;
});

register('ups', () => {
  const g = createVoxelGroup();
  g.name = 'ups';
  const serverMat = getMaterial('server');
  const accentMat = getMaterial('serverAccent');
  const lightMat = getMaterial('serverLight');

  g.add(createBlock(0.25, 0.12, 0.18, serverMat, 0, 0.06, 0));
  g.add(createBlock(0.23, 0.02, 0.16, accentMat, 0, 0.13, 0));

  // Power LED
  const led = createBlock(0.02, 0.01, 0.02, lightMat, -0.06, 0.14, 0.07);
  led.material = getMaterial('serverLight', { emissive: 0x00ff00, emissiveIntensity: 0.3 });
  g.add(led);
  // Fault LED
  const fault = createBlock(0.02, 0.01, 0.02, lightMat, 0.06, 0.14, 0.07);
  fault.material = getMaterial('serverLight', { emissive: 0xff0000, emissiveIntensity: 0.1 });
  g.add(fault);

  // Outlets
  for (let i = 0; i < 4; i++) {
    g.add(createBlock(0.02, 0.015, 0.02, serverMat, -0.08 + i * 0.05, 0.03, 0.08));
  }

  return g;
});

// --- Multi-instance aliases ---

register('wall-light-1', () => {
  const g = createVoxelGroup();
  g.name = 'wall-light-1';
  const metalMat = getMaterial('chairMetal');
  const ceilLightMat = getMaterial('ceilingLight');
  g.add(createBlock(0.03, 0.03, 0.06, metalMat, 0, 0.06, 0));
  g.add(createBlock(0.02, 0.02, 0.1, metalMat, 0, 0.04, 0));
  g.add(createBlock(0.15, 0.08, 0.12, ceilLightMat, 0, 0.08, 0.06));
  const glow = createBlock(0.12, 0.06, 0.1, ceilLightMat, 0, 0.08, 0.06);
  glow.material = getMaterial('ceilingLight', { emissive: 0xffeecc, emissiveIntensity: 1.5 });
  g.add(glow);
  return g;
});

register('wall-light-2', () => {
  const g = createVoxelGroup();
  g.name = 'wall-light-2';
  const metalMat = getMaterial('chairMetal');
  const ceilLightMat = getMaterial('ceilingLight');
  g.add(createBlock(0.03, 0.03, 0.06, metalMat, 0, 0.06, 0));
  g.add(createBlock(0.02, 0.02, 0.1, metalMat, 0, 0.04, 0));
  g.add(createBlock(0.15, 0.08, 0.12, ceilLightMat, 0, 0.08, 0.06));
  const glow = createBlock(0.12, 0.06, 0.1, ceilLightMat, 0, 0.08, 0.06);
  glow.material = getMaterial('ceilingLight', { emissive: 0xffeecc, emissiveIntensity: 1.5 });
  g.add(glow);
  return g;
});

register('wall-light-3', () => {
  const g = createVoxelGroup();
  g.name = 'wall-light-3';
  const metalMat = getMaterial('chairMetal');
  const ceilLightMat = getMaterial('ceilingLight');
  g.add(createBlock(0.03, 0.03, 0.06, metalMat, 0, 0.06, 0));
  g.add(createBlock(0.02, 0.02, 0.1, metalMat, 0, 0.04, 0));
  g.add(createBlock(0.15, 0.08, 0.12, ceilLightMat, 0, 0.08, 0.06));
  const glow = createBlock(0.12, 0.06, 0.1, ceilLightMat, 0, 0.08, 0.06);
  glow.material = getMaterial('ceilingLight', { emissive: 0xffeecc, emissiveIntensity: 1.5 });
  g.add(glow);
  return g;
});

register('small-plant-1', () => {
  const g = createVoxelGroup();
  g.name = 'small-plant-1';
  const floorMat = getMaterial('floor');
  const bookGreen = getMaterial('bookGreen');
  g.add(createBlock(0.1, 0.08, 0.1, floorMat, 0, 0.04, 0));
  g.add(createBlock(0.08, 0.04, 0.08, floorMat, 0, 0.1, 0));
  g.add(createBlock(0.015, 0.08, 0.015, bookGreen, 0, 0.16, 0));
  g.add(createBlock(0.08, 0.02, 0.06, bookGreen, 0.04, 0.2, 0));
  g.add(createBlock(0.06, 0.02, 0.08, bookGreen, -0.03, 0.22, 0.02));
  g.add(createBlock(0.07, 0.02, 0.05, bookGreen, 0.01, 0.24, -0.03));
  g.add(createBlock(0.05, 0.02, 0.06, bookGreen, -0.02, 0.26, 0.01));
  return g;
});

register('small-plant-2', () => {
  const g = createVoxelGroup();
  g.name = 'small-plant-2';
  const floorMat = getMaterial('floor');
  const bookGreen = getMaterial('bookGreen');
  g.add(createBlock(0.1, 0.08, 0.1, floorMat, 0, 0.04, 0));
  g.add(createBlock(0.08, 0.04, 0.08, floorMat, 0, 0.1, 0));
  g.add(createBlock(0.015, 0.08, 0.015, bookGreen, 0, 0.16, 0));
  g.add(createBlock(0.08, 0.02, 0.06, bookGreen, 0.04, 0.2, 0));
  g.add(createBlock(0.06, 0.02, 0.08, bookGreen, -0.03, 0.22, 0.02));
  g.add(createBlock(0.07, 0.02, 0.05, bookGreen, 0.01, 0.24, -0.03));
  g.add(createBlock(0.05, 0.02, 0.06, bookGreen, -0.02, 0.26, 0.01));
  return g;
});

register('picture-frame-1', () => {
  const g = createVoxelGroup();
  g.name = 'picture-frame-1';
  const frameMat = getMaterial('frame');
  const matMat = getMaterial('frameMat');
  g.add(createBlock(0.3, 0.22, 0.04, frameMat, 0, 0, 0));
  g.add(createBlock(0.26, 0.18, 0.03, matMat, 0, 0, 0.035));
  g.add(createBlock(0.02, 0.22, 0.04, frameMat, -0.14, 0, 0));
  g.add(createBlock(0.02, 0.22, 0.04, frameMat, 0.14, 0, 0));
  g.add(createBlock(0.26, 0.02, 0.04, frameMat, 0, -0.1, 0));
  g.add(createBlock(0.26, 0.02, 0.04, frameMat, 0, 0.1, 0));
  return g;
});

register('picture-frame-2', () => {
  const g = createVoxelGroup();
  g.name = 'picture-frame-2';
  const frameMat = getMaterial('frame');
  const matMat = getMaterial('frameMat');
  g.add(createBlock(0.3, 0.22, 0.04, frameMat, 0, 0, 0));
  g.add(createBlock(0.26, 0.18, 0.03, matMat, 0, 0, 0.035));
  g.add(createBlock(0.02, 0.22, 0.04, frameMat, -0.14, 0, 0));
  g.add(createBlock(0.02, 0.22, 0.04, frameMat, 0.14, 0, 0));
  g.add(createBlock(0.26, 0.02, 0.04, frameMat, 0, -0.1, 0));
  g.add(createBlock(0.26, 0.02, 0.04, frameMat, 0, 0.1, 0));
  return g;
});

// --- WALL DECORATIONS ---

register('wall-clock', () => {
  const g = createVoxelGroup();
  g.name = 'wall-clock';
  const frameMat = getMaterial('frame');
  const matMat = getMaterial('frameMat');
  const accentMat = getMaterial('accentLine');

  g.add(createBlock(0.2, 0.2, 0.03, matMat, 0, 0, 0));
  g.add(createBlock(0.22, 0.22, 0.025, frameMat, 0, 0, -0.01));
  g.add(createBlock(0.005, 0.06, 0.005, accentMat, 0, 0.03, 0.015));
  g.add(createBlock(0.04, 0.005, 0.005, accentMat, 0.02, 0, 0.015));
  g.add(createBlock(0.01, 0.01, 0.005, accentMat, 0, 0, 0.015));

  return g;
});

register('framed-sprite', () => {
  const g = createVoxelGroup();
  g.name = 'framed-sprite';
  const frameMat = getMaterial('frame');
  const bookColors = ['bookRed', 'bookBlue', 'bookGreen', 'bookYellow', 'bookPurple'];

  g.add(createBlock(0.3, 0.3, 0.03, frameMat, 0, 0, 0));
  const ps = 0.05;
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const ci = (i + j) % bookColors.length;
      g.add(createBlock(ps, ps, 0.01, getMaterial(bookColors[ci] as any), -0.1 + i * ps, -0.1 + j * ps, 0.02));
    }
  }

  return g;
});

register('floating-shelf', () => {
  const g = createVoxelGroup();
  g.name = 'floating-shelf';
  const shelfMat = getMaterial('bookshelf');

  g.add(createBlock(0.5, 0.04, 0.12, shelfMat, 0, 0, 0));
  g.add(createBlock(0.02, 0.02, 0.06, getMaterial('chairMetal'), 0, -0.03, 0));

  return g;
});

register('acoustic-panel', () => {
  const g = createVoxelGroup();
  g.name = 'acoustic-panel';
  const panelMat = getMaterial('accentLine');
  const altMat = getMaterial('wallDark');

  g.add(createBlock(0.4, 0.6, 0.03, panelMat, 0, 0, 0));
  for (let i = 0; i < 5; i++) {
    g.add(createBlock(0.06, 0.5, 0.01, altMat, -0.18 + i * 0.09, 0, 0.02));
  }

  return g;
});

register('wall-tv', () => {
  const g = createVoxelGroup();
  g.name = 'wall-tv';
  const bezelMat = getMaterial('monitorBezel');
  const screenMat = getMaterial('monitorScreen');

  g.add(createBlock(1.2, 0.7, 0.05, bezelMat, 0, 0, 0));
  const screen = createBlock(1.12, 0.62, 0.02, screenMat, 0, 0, 0.035);
  screen.material = getMaterial('monitorScreen', { emissive: 0x224466, emissiveIntensity: 0.3 });
  g.add(screen);
  g.add(createBlock(0.04, 0.06, 0.08, getMaterial('chairMetal'), 0, -0.38, 0));

  return g;
});

register('game-console', () => {
  const g = createVoxelGroup();
  g.name = 'game-console';
  const serverMat = getMaterial('server');
  const lightMat = getMaterial('serverLight');
  const accentMat = getMaterial('accentLine');

  g.add(createBlock(0.25, 0.04, 0.18, serverMat, 0, 0, 0));
  g.add(createBlock(0.22, 0.01, 0.15, accentMat, 0, 0.025, 0));
  const led = createBlock(0.015, 0.01, 0.015, lightMat, -0.1, 0.03, 0.07);
  led.material = getMaterial('serverLight', { emissive: 0x00ff00, emissiveIntensity: 0.5 });
  g.add(led);

  return g;
});

function buildSpeaker(): THREE.Group {
  const g = createVoxelGroup();
  const cabinetMat = getMaterial('cabinet');
  const accentMat = getMaterial('accentLine');
  const serverMat = getMaterial('server');

  g.add(createBlock(0.2, 0.3, 0.12, cabinetMat, 0, 0, 0));
  g.add(createBlock(0.12, 0.12, 0.02, serverMat, 0, 0.05, 0.07));
  g.add(createBlock(0.04, 0.04, 0.02, serverMat, 0, 0.14, 0.07));
  g.add(createBlock(0.18, 0.01, 0.02, accentMat, 0, -0.12, 0.07));

  return g;
}

register('decorative-speaker-1', () => buildSpeaker());
register('decorative-speaker-2', () => buildSpeaker());

register('pegboard', () => {
  const g = createVoxelGroup();
  g.name = 'pegboard';
  const boardMat = getMaterial('board');
  const accentMat = getMaterial('accentLine');
  const lightMat = getMaterial('serverLight');

  g.add(createBlock(0.4, 0.5, 0.03, boardMat, 0, 0, 0));
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      g.add(createBlock(0.015, 0.02, 0.015, accentMat, -0.15 + i * 0.1, -0.15 + j * 0.1, 0.02));
    }
  }
  g.add(createBlock(0.02, 0.08, 0.02, lightMat, -0.15, 0.01, 0.03));
  g.add(createBlock(0.08, 0.02, 0.02, lightMat, 0.05, 0.05, 0.03));

  return g;
});

register('pegboard-2', () => {
  const g = createVoxelGroup();
  g.name = 'pegboard-2';
  const boardMat = getMaterial('board');
  const accentMat = getMaterial('accentLine');
  const lightMat = getMaterial('serverLight');

  g.add(createBlock(0.4, 0.5, 0.03, boardMat, 0, 0, 0));
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      g.add(createBlock(0.015, 0.02, 0.015, accentMat, -0.15 + i * 0.1, -0.15 + j * 0.1, 0.02));
    }
  }
  g.add(createBlock(0.02, 0.08, 0.02, lightMat, -0.15, 0.01, 0.03));
  g.add(createBlock(0.08, 0.02, 0.02, lightMat, 0.05, 0.05, 0.03));

  return g;
});

register('miniature-pc', () => {
  const g = createVoxelGroup();
  g.name = 'miniature-pc';
  const serverMat = getMaterial('server');
  const lightMat = getMaterial('serverLight');
  const accentMat = getMaterial('serverAccent');

  g.add(createBlock(0.12, 0.15, 0.1, serverMat, 0, 0, 0));
  g.add(createBlock(0.01, 0.13, 0.08, accentMat, 0.06, 0, 0));
  const led = createBlock(0.02, 0.02, 0.02, lightMat, 0, 0.04, 0.04);
  led.material = getMaterial('serverLight', { emissive: 0x00ff00, emissiveIntensity: 1.0 });
  g.add(led);
  g.add(createBlock(0.06, 0.01, 0.06, serverMat, 0, 0.08, 0));

  return g;
});

register('gaming-collectible', () => {
  const g = createVoxelGroup();
  g.name = 'gaming-collectible';
  const accentMat = getMaterial('accentLine');
  const ceilLightMat = getMaterial('ceilingLight');
  const chairMetal = getMaterial('chairMetal');

  g.add(createBlock(0.08, 0.02, 0.08, chairMetal, 0, -0.04, 0));
  g.add(createBlock(0.05, 0.08, 0.05, accentMat, 0, 0.02, 0));
  g.add(createBlock(0.04, 0.04, 0.04, ceilLightMat, 0, 0.08, 0));
  g.add(createBlock(0.02, 0.04, 0.02, getMaterial('bookRed'), 0.03, 0.04, 0));

  return g;
});

register('led-sign', () => {
  const g = createVoxelGroup();
  g.name = 'led-sign';
  const signMat = getMaterial('server');
  const glowMat = getMaterial('aiGlow');

  g.add(createBlock(0.3, 0.12, 0.03, signMat, 0, 0, 0));
  const glow = createBlock(0.26, 0.08, 0.01, glowMat, 0, 0, 0.02);
  glow.material = getMaterial('aiGlow', { emissive: 0xff4488, emissiveIntensity: 1.5 });
  g.add(glow);
  g.add(createBlock(0.02, 0.04, 0.06, getMaterial('chairMetal'), 0, -0.08, 0));

  return g;
});

register('wall-plant', () => {
  const g = createVoxelGroup();
  g.name = 'wall-plant';
  const plantMat = getMaterial('bookGreen');
  const potMat = getMaterial('floor');

  g.add(createBlock(0.1, 0.06, 0.08, potMat, 0, -0.03, 0));
  g.add(createBlock(0.08, 0.02, 0.06, plantMat, 0, 0.05, 0));
  g.add(createBlock(0.06, 0.02, 0.08, plantMat, 0.02, 0.1, 0.01));
  g.add(createBlock(0.07, 0.02, 0.05, plantMat, -0.02, 0.14, -0.01));
  g.add(createBlock(0.04, 0.02, 0.06, plantMat, 0.01, 0.18, 0));

  return g;
});

register('hanging-vines', () => {
  const g = createVoxelGroup();
  g.name = 'hanging-vines';
  const plantMat = getMaterial('bookGreen');

  for (let i = 0; i < 5; i++) {
    const vx = -0.4 + i * 0.2;
    const vineLen = 0.3 + (i % 3) * 0.05;
    for (let j = 0; j < 4; j++) {
      if (j * 0.08 < vineLen) {
        g.add(createBlock(0.015, 0.08, 0.015, plantMat, vx, -j * 0.08, 0));
      }
    }
    g.add(createBlock(0.04, 0.01, 0.03, plantMat, vx + 0.01, -vineLen - 0.01, 0));
  }

  return g;
});

register('posters', () => {
  const g = createVoxelGroup();
  g.name = 'posters';
  const frameMat = getMaterial('frame');
  const bookColors = ['bookRed', 'bookBlue', 'bookGreen', 'bookYellow', 'bookPurple'];

  g.add(createBlock(0.35, 0.45, 0.02, getMaterial(bookColors[2] as any), 0, 0, 0));
  g.add(createBlock(0.37, 0.47, 0.015, frameMat, 0, 0, -0.01));
  g.add(createBlock(0.3, 0.05, 0.005, getMaterial(bookColors[0] as any), 0, 0.15, 0.015));
  g.add(createBlock(0.2, 0.1, 0.005, getMaterial(bookColors[3] as any), 0, 0, 0.015));
  g.add(createBlock(0.25, 0.04, 0.005, getMaterial(bookColors[4] as any), 0, -0.12, 0.015));

  return g;
});

register('rgb-strip', () => {
  const g = createVoxelGroup();
  g.name = 'rgb-strip';
  const stripMat = getMaterial('ceilingLight', { emissive: 0xff4488, emissiveIntensity: 0.8 });

  g.add(createBlock(0.6, 0.01, 0.01, stripMat, 0, 0, 0));

  return g;
});

// --- DESK DECORATIONS ---

register('desk-notebook', () => {
  const g = createVoxelGroup();
  g.name = 'desk-notebook';
  const coverMat = getMaterial('bookBlue');
  const pageMat = getMaterial('frameMat');

  g.add(createBlock(0.14, 0.008, 0.1, coverMat, 0, 0, 0));
  g.add(createBlock(0.12, 0.006, 0.09, pageMat, 0, 0.007, 0));

  return g;
});

// --- ROOM CORNER DECORATIONS ---

register('floor-lamp', () => {
  const g = createVoxelGroup();
  g.name = 'floor-lamp';
  const metalMat = getMaterial('chairMetal');
  const ceilLightMat = getMaterial('ceilingLight');

  g.add(createBlock(0.02, 0.6, 0.02, metalMat, 0, 0.3, 0));
  g.add(createBlock(0.15, 0.02, 0.15, metalMat, 0, 0.01, 0));
  g.add(createBlock(0.18, 0.12, 0.18, ceilLightMat, 0, 0.66, 0));
  const glow = createBlock(0.14, 0.1, 0.14, ceilLightMat, 0, 0.66, 0);
  glow.material = getMaterial('ceilingLight', { emissive: 0xffeecc, emissiveIntensity: 0.5 });
  g.add(glow);

  return g;
});

register('tall-plant', () => {
  const g = createVoxelGroup();
  g.name = 'tall-plant';
  const plantMat = getMaterial('bookGreen');
  const potMat = getMaterial('floor');

  g.add(createBlock(0.18, 0.12, 0.18, potMat, 0, 0.06, 0));
  g.add(createBlock(0.14, 0.04, 0.14, potMat, 0, 0.14, 0));
  g.add(createBlock(0.02, 0.3, 0.02, plantMat, 0, 0.35, 0));
  g.add(createBlock(0.12, 0.02, 0.06, plantMat, 0.05, 0.4, 0));
  g.add(createBlock(0.08, 0.02, 0.1, plantMat, -0.03, 0.45, 0.02));
  g.add(createBlock(0.1, 0.02, 0.08, plantMat, 0.02, 0.52, -0.02));
  g.add(createBlock(0.06, 0.02, 0.1, plantMat, -0.02, 0.58, 0.01));

  return g;
});

register('waste-bin', () => {
  const g = createVoxelGroup();
  g.name = 'waste-bin';
  const binMat = getMaterial('server');
  const accentMat = getMaterial('accentLine');

  g.add(createBlock(0.15, 0.2, 0.15, binMat, 0, 0.1, 0));
  g.add(createBlock(0.17, 0.02, 0.17, accentMat, 0, 0.21, 0));

  return g;
});
