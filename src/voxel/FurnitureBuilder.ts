import * as THREE from 'three';
import type { WorldObject } from '../types';
import { getMaterial } from './Materials';
import { createBlock, createVoxelGroup, registerVoxelBuilder } from './VoxelBuilder';

export function buildFurniture(def: WorldObject): THREE.Object3D {
  const group = createVoxelGroup();
  group.name = def.id;
  return group;
}

function register(id: string, fn: (def: WorldObject) => THREE.Object3D): void {
  registerVoxelBuilder(id, fn);
}

register('main-door', () => {
  const g = createVoxelGroup();
  g.name = 'main-door';
  const doorMat = getMaterial('door');
  const frameMat = getMaterial('doorFrame');
  const wallMat = getMaterial('wall');
  g.add(createBlock(0.08, 2.4, 0.15, doorMat, 0, 1.2, 0));
  g.add(createBlock(0.04, 2.5, 0.04, frameMat, -0.42, 1.25, 0));
  g.add(createBlock(0.04, 2.5, 0.04, frameMat, 0.42, 1.25, 0));
  g.add(createBlock(0.04, 0.04, 0.04, frameMat, -0.42, 0.05, 0));
  g.add(createBlock(0.04, 0.04, 0.04, frameMat, 0.42, 0.05, 0));
  g.add(createBlock(0.04, 0.04, 0.04, frameMat, -0.42, 2.46, 0));
  g.add(createBlock(0.04, 0.04, 0.04, frameMat, 0.42, 2.46, 0));
  g.add(createBlock(0.08, 0.04, 0.12, wallMat, 0.42, 1.2, 0));
  g.userData.collidable = true;
  return g;
});

register('main-desk', () => {
  const g = createVoxelGroup();
  g.name = 'main-desk';
  const deskTopMat = getMaterial('deskTop');
  const metalMat = getMaterial('chairMetal');
  const top = createBlock(2.0, 0.08, 0.9, deskTopMat, 0, 0.75, 0);
  g.add(top);
  const legPositions = [[-0.9, -0.38], [-0.9, 0.38], [0.9, -0.38], [0.9, 0.38]];
  for (const [lx, lz] of legPositions) {
    g.add(createBlock(0.08, 0.7, 0.08, metalMat, lx, 0.35, lz));
  }
  const legBase = getMaterial('desk');
  for (const [lx, lz] of legPositions) {
    g.add(createBlock(0.12, 0.04, 0.12, legBase, lx, 0.02, lz));
  }
  g.userData.collidable = true;
  return g;
});

register('main-desk-2', () => {
  const g = createVoxelGroup();
  g.name = 'main-desk-2';
  const deskTopMat = getMaterial('deskTop');
  const metalMat = getMaterial('chairMetal');
  const top = createBlock(2.0, 0.08, 0.9, deskTopMat, 0, 0.75, 0);
  g.add(top);
  const legPositions = [[-0.9, -0.38], [-0.9, 0.38], [0.9, -0.38], [0.9, 0.38]];
  for (const [lx, lz] of legPositions) {
    g.add(createBlock(0.08, 0.7, 0.08, metalMat, lx, 0.35, lz));
  }
  const legBase = getMaterial('desk');
  for (const [lx, lz] of legPositions) {
    g.add(createBlock(0.12, 0.04, 0.12, legBase, lx, 0.02, lz));
  }
  g.userData.collidable = true;
  return g;
});

register('developer-chair', () => {
  const g = createVoxelGroup();
  g.name = 'developer-chair';
  const seatMat = getMaterial('chair');
  const metalMat = getMaterial('chairMetal');
  g.add(createBlock(0.45, 0.08, 0.45, seatMat, 0, 0.45, 0));
  g.add(createBlock(0.45, 0.06, 0.08, seatMat, 0, 0.77, -0.22));
  g.add(createBlock(0.04, 0.45, 0.04, metalMat, 0, 0.22, 0));
  const wheelPos = [[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]];
  for (const [wx, wz] of wheelPos) {
    g.add(createBlock(0.04, 0.04, 0.04, metalMat, wx, 0.02, wz));
  }
  g.add(createBlock(0.06, 0.06, 0.06, metalMat, 0, 0.06, 0));
  g.add(createBlock(0.04, 0.04, 0.04, metalMat, -0.18, 0.02, 0));
  g.add(createBlock(0.04, 0.04, 0.04, metalMat, 0.18, 0.02, 0));
  g.add(createBlock(0.04, 0.04, 0.04, metalMat, 0, 0.02, -0.18));
  g.add(createBlock(0.04, 0.04, 0.04, metalMat, 0, 0.02, 0.18));
  g.userData.collidable = true;
  return g;
});

register('monitor-center', () => {
  const g = createVoxelGroup();
  g.name = 'monitor-center';
  const bezelMat = getMaterial('monitorBezel');
  const screenMat = getMaterial('monitorScreen');
  const standMat = getMaterial('chairMetal');
  g.add(createBlock(0.06, 0.35, 0.06, standMat, 0, 0.2, 0));
  g.add(createBlock(0.15, 0.04, 0.04, standMat, 0, 0.38, 0));
  g.add(createBlock(0.6, 0.35, 0.05, bezelMat, 0, 0.55, 0));
  const screenBlock = createBlock(0.56, 0.3, 0.03, screenMat, 0, 0.55, 0.04);
  screenBlock.material = getMaterial('monitorScreen', { emissive: 0x44ddff, emissiveIntensity: 0.8 });
  g.add(screenBlock);
  g.userData.collidable = true;
  return g;
});

register('monitor-left', () => {
  const g = createVoxelGroup();
  g.name = 'monitor-left';
  const bezelMat = getMaterial('monitorBezel');
  const screenMat = getMaterial('monitorScreen');
  const standMat = getMaterial('chairMetal');
  g.add(createBlock(0.05, 0.3, 0.05, standMat, 0, 0.18, 0));
  g.add(createBlock(0.12, 0.03, 0.03, standMat, 0, 0.34, 0));
  g.add(createBlock(0.5, 0.3, 0.04, bezelMat, 0, 0.48, 0));
  const screenBlock = createBlock(0.46, 0.26, 0.025, screenMat, 0, 0.48, 0.03);
  screenBlock.material = getMaterial('monitorScreen', { emissive: 0x44ddff, emissiveIntensity: 0.8 });
  g.add(screenBlock);
  g.userData.collidable = true;
  return g;
});

register('monitor-right', () => {
  const g = createVoxelGroup();
  g.name = 'monitor-right';
  const bezelMat = getMaterial('monitorBezel');
  const screenMat = getMaterial('monitorScreen');
  const standMat = getMaterial('chairMetal');
  g.add(createBlock(0.05, 0.3, 0.05, standMat, 0, 0.18, 0));
  g.add(createBlock(0.12, 0.03, 0.03, standMat, 0, 0.34, 0));
  g.add(createBlock(0.5, 0.3, 0.04, bezelMat, 0, 0.48, 0));
  const screenBlock = createBlock(0.46, 0.26, 0.025, screenMat, 0, 0.48, 0.03);
  screenBlock.material = getMaterial('monitorScreen', { emissive: 0x44ddff, emissiveIntensity: 0.8 });
  g.add(screenBlock);
  g.userData.collidable = true;
  return g;
});

register('bookshelf', () => {
  const g = createVoxelGroup();
  g.name = 'bookshelf';
  const shelfMat = getMaterial('bookshelf');
  const bookColors = ['bookRed', 'bookBlue', 'bookGreen', 'bookYellow', 'bookPurple'];
  const getBook = (i: number) => getMaterial(bookColors[i % bookColors.length] as any);

  // Dimensions
  const OW = 0.9;   // outer width
  const OH = 1.8;   // outer height
  const OD = 0.25;  // outer depth
  const t = 0.04;   // wall thickness
  const IW = OW - 2 * t; // interior width
  const ID = OD - 0.03;  // interior depth
  const midY = OH / 2;

  // Back panel
  g.add(createBlock(IW, OH - 2 * t, 0.02, shelfMat, 0, midY, -OD / 2 + 0.01));
  // Side panels
  g.add(createBlock(t, OH - 2 * t, ID, shelfMat, -OW / 2 + t / 2, midY, 0));
  g.add(createBlock(t, OH - 2 * t, ID, shelfMat, OW / 2 - t / 2, midY, 0));
  // Top panel
  g.add(createBlock(OW - 0.01, t, OD - 0.01, shelfMat, 0, OH - t / 2, 0));
  // Bottom
  g.add(createBlock(OW - 0.01, t, OD - 0.01, shelfMat, 0, t / 2, 0));

  // Shelf boards at y = 0.28, 0.62, 1.00, 1.38
  const shelfYs = [0.28, 0.62, 1.00, 1.38];
  for (const sy of shelfYs) {
    g.add(createBlock(IW - 0.02, t, ID - 0.02, shelfMat, 0, sy, 0));
  }

  // Helper: add a standing book on a shelf
  const addBook = (shelfY: number, bx: number, bw: number, bh: number, ci: number) => {
    const top = shelfY + t / 2;
    g.add(createBlock(bw, bh, 0.1, getBook(ci), bx, top + bh / 2, 0.02));
  };
  // Helper: add a horizontally stacked book
  const addStack = (shelfY: number, bx: number, bw: number, bh: number, ci: number, layer = 0) => {
    const top = shelfY + t / 2;
    g.add(createBlock(bw, bh, 0.1, getBook(ci), bx, top + bh / 2 + layer * bh, 0.02));
  };

  // Shelf 1 (y=0.28) — 5 standing books
  addBook(0.28, -0.28, 0.07, 0.18, 0);
  addBook(0.28, -0.16, 0.07, 0.22, 1);
  addBook(0.28, -0.03, 0.07, 0.16, 2);
  addBook(0.28, 0.08, 0.07, 0.20, 3);
  addBook(0.28, 0.20, 0.07, 0.18, 4);

  // Shelf 2 (y=0.62) — 2 standing + 3 stacked + decorative box
  addBook(0.62, -0.28, 0.07, 0.20, 0);
  addBook(0.62, -0.16, 0.07, 0.18, 2);
  addStack(0.62, 0.04, 0.14, 0.05, 1, 0);
  addStack(0.62, 0.04, 0.14, 0.05, 3, 1);
  addStack(0.62, 0.04, 0.14, 0.05, 4, 2);
  // Decorative box
  g.add(createBlock(0.08, 0.08, 0.08, getMaterial('accentLine'), 0.26, 0.66, 0.02));

  // Shelf 3 (y=1.00) — 3 standing + 2 stacked pair
  addBook(1.00, -0.28, 0.07, 0.22, 4);
  addBook(1.00, -0.16, 0.07, 0.20, 1);
  addBook(1.00, -0.03, 0.07, 0.18, 3);
  addStack(1.00, 0.15, 0.15, 0.05, 0, 0);
  addStack(1.00, 0.15, 0.15, 0.05, 2, 1);

  // Shelf 4 (y=1.38) — 3 standing books + small plant on top
  addBook(1.38, -0.25, 0.07, 0.18, 2);
  addBook(1.38, -0.12, 0.07, 0.20, 0);
  addBook(1.38, 0.01, 0.07, 0.16, 4);
  // Small plant on top of bookshelf
  const plantMat = getMaterial('bookGreen');
  const potMat = getMaterial('floor');
  g.add(createBlock(0.10, 0.06, 0.10, potMat, 0.26, 1.44, 0));
  g.add(createBlock(0.06, 0.04, 0.06, potMat, 0.26, 1.51, 0));
  g.add(createBlock(0.015, 0.08, 0.015, plantMat, 0.26, 1.57, 0));
  g.add(createBlock(0.08, 0.02, 0.05, plantMat, 0.30, 1.61, 0));
  g.add(createBlock(0.05, 0.02, 0.07, plantMat, 0.23, 1.63, 0.02));

  g.userData.collidable = true;
  return g;
});

register('timeline-books', () => {
  const g = createVoxelGroup();
  g.name = 'timeline-books';
  const bookColors = ['bookRed', 'bookBlue', 'bookGreen', 'bookYellow', 'bookPurple'];
  const positions: [number, number, number][] = [
    [-0.2, 0.12, 0], [-0.05, 0.15, 0], [0.1, 0.1, 0], [0.25, 0.13, 0],
    [-0.15, 0.35, 0], [0.05, 0.38, 0], [0.2, 0.33, 0],
  ];
  for (let i = 0; i < positions.length; i++) {
    const [bx, by, bz] = positions[i];
    const col = bookColors[i % bookColors.length];
    g.add(createBlock(0.08, 0.15, 0.1, getMaterial(col as any), bx, by, bz));
  }
  return g;
});

register('server-rack', () => {
  const g = createVoxelGroup();
  g.name = 'server-rack';
  const serverMat = getMaterial('server');
  const accentMat = getMaterial('serverAccent');
  const lightMat = getMaterial('serverLight');

  g.add(createBlock(0.5, 1.4, 0.4, serverMat, 0, 0.7, 0));
  g.add(createBlock(0.02, 1.4, 0.4, accentMat, 0.24, 0.7, 0));
  g.add(createBlock(0.02, 1.4, 0.4, accentMat, -0.24, 0.7, 0));

  const serverYs = [0.15, 0.45, 0.75, 1.05, 1.3];
  for (const sy of serverYs) {
    g.add(createBlock(0.42, 0.06, 0.32, accentMat, 0, sy, 0));
    // LED indicator
    g.add(createBlock(0.02, 0.02, 0.02, lightMat, 0.15, sy, 0.16));
  }

  // Top accent light
  const topLight = createBlock(0.06, 0.02, 0.06, lightMat, 0, 1.38, 0);
  topLight.material = getMaterial('serverLight', { emissive: 0x00ff00, emissiveIntensity: 2.0 });
  g.add(topLight);

  g.userData.collidable = true;
  return g;
});

register('network-board', () => {
  const g = createVoxelGroup();
  g.name = 'network-board';
  const serverMat = getMaterial('server');
  const accentMat = getMaterial('serverAccent');
  const lightMat = getMaterial('serverLight');

  g.add(createBlock(0.3, 0.04, 0.2, serverMat, 0, 0, 0));
  g.add(createBlock(0.28, 0.02, 0.18, accentMat, 0, 0.03, 0));

  // Port LEDs
  for (let i = 0; i < 4; i++) {
    const px = -0.1 + i * 0.065;
    const led = createBlock(0.015, 0.015, 0.015, lightMat, px, 0.05, 0.08);
    led.material = getMaterial('serverLight', { emissive: 0x00ff00, emissiveIntensity: 1.5 });
    g.add(led);
  }

  return g;
});

register('terminal-console', () => {
  const g = createVoxelGroup();
  g.name = 'terminal-console';
  const terminalMat = getMaterial('terminal');
  const textMat = getMaterial('terminalText');
  const metalMat = getMaterial('chairMetal');

  g.add(createBlock(0.35, 0.08, 0.25, metalMat, 0, 0.04, 0));
  g.add(createBlock(0.3, 0.2, 0.04, terminalMat, 0, 0.18, 0));
  const screen = createBlock(0.28, 0.16, 0.02, textMat, 0, 0.18, 0.03);
  screen.material = getMaterial('terminalText', { emissive: 0x00ff00, emissiveIntensity: 2.0 });
  g.add(screen);
  // Keyboard part
  g.add(createBlock(0.25, 0.04, 0.1, terminalMat, 0, 0.04, -0.12));

  return g;
});

register('certificate-frame', () => {
  const g = createVoxelGroup();
  g.name = 'certificate-frame';
  const frameMat = getMaterial('frame');
  const matMat = getMaterial('frameMat');

  g.add(createBlock(0.6, 0.45, 0.04, frameMat, 0, 0, 0));
  g.add(createBlock(0.56, 0.41, 0.03, matMat, 0, 0, 0.035));
  g.add(createBlock(0.02, 0.45, 0.04, frameMat, -0.29, 0, 0));
  g.add(createBlock(0.02, 0.45, 0.04, frameMat, 0.29, 0, 0));
  g.add(createBlock(0.56, 0.02, 0.04, frameMat, 0, -0.215, 0));
  g.add(createBlock(0.56, 0.02, 0.04, frameMat, 0, 0.215, 0));

  return g;
});

register('diploma-frame', () => {
  const g = createVoxelGroup();
  g.name = 'diploma-frame';
  const frameMat = getMaterial('frame');
  const matMat = getMaterial('frameMat');

  g.add(createBlock(0.7, 0.5, 0.04, frameMat, 0, 0, 0));
  g.add(createBlock(0.66, 0.46, 0.03, matMat, 0, 0, 0.035));
  g.add(createBlock(0.02, 0.5, 0.04, frameMat, -0.34, 0, 0));
  g.add(createBlock(0.02, 0.5, 0.04, frameMat, 0.34, 0, 0));
  g.add(createBlock(0.66, 0.02, 0.04, frameMat, 0, -0.24, 0));
  g.add(createBlock(0.66, 0.02, 0.04, frameMat, 0, 0.24, 0));

  // Gloss highlight
  const gloss = createBlock(0.6, 0.4, 0.02, matMat, 0, 0, 0.05);
  gloss.material = getMaterial('frameMat', { emissive: 0xeeddbb, emissiveIntensity: 0.05 });
  g.add(gloss);

  return g;
});

register('award-frame', () => {
  const g = createVoxelGroup();
  g.name = 'award-frame';
  const frameMat = getMaterial('frame');
  const matMat = getMaterial('frameMat');
  const accentMat = getMaterial('accentLine');

  g.add(createBlock(0.45, 0.35, 0.04, frameMat, 0, 0, 0));
  g.add(createBlock(0.41, 0.31, 0.03, matMat, 0, 0, 0.035));
  g.add(createBlock(0.02, 0.35, 0.04, frameMat, -0.215, 0, 0));
  g.add(createBlock(0.02, 0.35, 0.04, frameMat, 0.215, 0, 0));
  g.add(createBlock(0.41, 0.02, 0.04, frameMat, 0, -0.165, 0));
  g.add(createBlock(0.41, 0.02, 0.04, frameMat, 0, 0.165, 0));
  // Award accent star (small block)
  g.add(createBlock(0.08, 0.08, 0.02, accentMat, 0, 0, 0.05));

  return g;
});

register('future-board', () => {
  const g = createVoxelGroup();
  g.name = 'future-board';
  const boardMat = getMaterial('board');
  const frameMat = getMaterial('boardFrame');
  const futureMat = getMaterial('future');

  g.add(createBlock(0.8, 0.55, 0.04, frameMat, 0, 0, 0));
  g.add(createBlock(0.76, 0.51, 0.03, boardMat, 0, 0, 0.035));
  g.add(createBlock(0.02, 0.55, 0.04, frameMat, -0.39, 0, 0));
  g.add(createBlock(0.02, 0.55, 0.04, frameMat, 0.39, 0, 0));
  g.add(createBlock(0.76, 0.02, 0.04, frameMat, 0, -0.255, 0));
  g.add(createBlock(0.76, 0.02, 0.04, frameMat, 0, 0.255, 0));
  // Accent line on board
  g.add(createBlock(0.5, 0.02, 0.02, futureMat, 0, 0, 0.05));
  g.add(createBlock(0.02, 0.2, 0.02, futureMat, 0.2, 0.1, 0.05));

  return g;
});

register('window', () => {
  const g = createVoxelGroup();
  g.name = 'window';
  const frameMat = getMaterial('windowFrame');
  const glassMat = getMaterial('window');
  const wallMat = getMaterial('wall');

  // Window frame
  g.add(createBlock(1.8, 0.04, 0.04, frameMat, 0, 1.2, 0));
  g.add(createBlock(1.8, 0.04, 0.04, frameMat, 0, 0, 0));
  g.add(createBlock(0.04, 1.2, 0.04, frameMat, -0.88, 0.6, 0));
  g.add(createBlock(0.04, 1.2, 0.04, frameMat, 0.88, 0.6, 0));
  // Center divider
  g.add(createBlock(0.04, 1.2, 0.04, frameMat, 0, 0.6, 0));

  // Glass panes (4 panes) — Minecraft-style transparent glass
  const glassOpts = { transparent: true, opacity: 0.4, emissive: 0x88ccff, emissiveIntensity: 0.05 };
  const glass = createBlock(0.82, 0.54, 0.02, glassMat, -0.44, 0.87, 0.03);
  glass.material = getMaterial('window', glassOpts);
  g.add(glass);

  const glass2 = createBlock(0.82, 0.54, 0.02, glassMat, 0.44, 0.87, 0.03);
  glass2.material = getMaterial('window', glassOpts);
  g.add(glass2);

  const glass3 = createBlock(0.82, 0.54, 0.02, glassMat, -0.44, 0.33, 0.03);
  glass3.material = getMaterial('window', glassOpts);
  g.add(glass3);

  const glass4 = createBlock(0.82, 0.54, 0.02, glassMat, 0.44, 0.33, 0.03);
  glass4.material = getMaterial('window', glassOpts);
  g.add(glass4);

  // Sill
  g.add(createBlock(1.9, 0.06, 0.1, wallMat, 0, -0.03, 0));

  g.userData.collidable = true;
  return g;
});

register('prototype-table', () => {
  const g = createVoxelGroup();
  g.name = 'prototype-table';
  const tableMat = getMaterial('labTable');
  const metalMat = getMaterial('chairMetal');

  g.add(createBlock(1.0, 0.06, 0.6, tableMat, 0, 0.75, 0));
  g.add(createBlock(0.06, 0.72, 0.06, metalMat, -0.45, 0.36, -0.25));
  g.add(createBlock(0.06, 0.72, 0.06, metalMat, 0.45, 0.36, -0.25));
  g.add(createBlock(0.06, 0.72, 0.06, metalMat, -0.45, 0.36, 0.25));
  g.add(createBlock(0.06, 0.72, 0.06, metalMat, 0.45, 0.36, 0.25));

  g.userData.collidable = true;
  return g;
});

register('floating-display', () => {
  const g = createVoxelGroup();
  g.name = 'floating-display';
  const baseMat = getMaterial('labTable');
  const hologramMat = getMaterial('hologram');
  const accentMat = getMaterial('aiGlow');

  // Pedestal
  g.add(createBlock(0.15, 0.3, 0.15, baseMat, 0, 0.15, 0));
  g.add(createBlock(0.2, 0.04, 0.2, baseMat, 0, 0.32, 0));

  // Floating hologram rings
  const ring1 = createBlock(0.35, 0.02, 0.35, hologramMat, 0, 0.5, 0);
  ring1.material = getMaterial('hologram', { transparent: true, opacity: 0.5, emissive: 0x44ddff, emissiveIntensity: 2.0 });
  g.add(ring1);

  const ring2 = createBlock(0.25, 0.02, 0.25, hologramMat, 0, 0.6, 0);
  ring2.material = getMaterial('hologram', { transparent: true, opacity: 0.4, emissive: 0x44ddff, emissiveIntensity: 1.5 });
  g.add(ring2);

  const ring3 = createBlock(0.15, 0.02, 0.15, hologramMat, 0, 0.7, 0);
  ring3.material = getMaterial('hologram', { transparent: true, opacity: 0.3, emissive: 0x44ddff, emissiveIntensity: 1.0 });
  g.add(ring3);

  // Core crystal
  const core = createBlock(0.08, 0.12, 0.08, accentMat, 0, 0.48, 0);
  core.material = getMaterial('aiGlow', { emissive: 0x44ffaa, emissiveIntensity: 2.5 });
  g.add(core);

  return g;
});

register('ai-terminal', () => {
  const g = createVoxelGroup();
  g.name = 'ai-terminal';
  const termMat = getMaterial('aiTerminal');
  const glowMat = getMaterial('aiGlow');
  const accentMat = getMaterial('serverAccent');

  // Base
  g.add(createBlock(0.4, 0.06, 0.3, termMat, 0, 0.03, 0));
  // Main body
  g.add(createBlock(0.35, 0.25, 0.25, termMat, 0, 0.18, 0));
  // Screen area
  const screen = createBlock(0.3, 0.18, 0.03, glowMat, 0, 0.2, 0.14);
  screen.material = getMaterial('aiGlow', { emissive: 0x44ffaa, emissiveIntensity: 2.0 });
  g.add(screen);
  // Accent lines
  g.add(createBlock(0.3, 0.02, 0.02, accentMat, 0, 0.06, 0.14));
  g.add(createBlock(0.3, 0.02, 0.02, accentMat, 0, 0.1, 0.14));
  g.add(createBlock(0.3, 0.02, 0.02, accentMat, 0, 0.3, 0.14));
  // Top glow node
  const topNode = createBlock(0.08, 0.06, 0.08, glowMat, 0, 0.35, 0);
  topNode.material = getMaterial('aiGlow', { emissive: 0x44ffaa, emissiveIntensity: 2.5 });
  g.add(topNode);

  g.userData.collidable = true;
  return g;
});

register('welcome-sign', () => {
  const g = createVoxelGroup();
  g.name = 'welcome-sign';
  const frameMat = getMaterial('frame');
  const matMat = getMaterial('frameMat');
  const deskMat = getMaterial('desk');

  g.add(createBlock(0.4, 0.15, 0.03, frameMat, 0, 0, 0));
  g.add(createBlock(0.36, 0.11, 0.02, matMat, 0, 0, 0.025));
  // Post
  g.add(createBlock(0.03, 0.2, 0.03, deskMat, 0, -0.17, 0));
  // Base
  g.add(createBlock(0.12, 0.03, 0.08, deskMat, 0, -0.28, 0));

  return g;
});
