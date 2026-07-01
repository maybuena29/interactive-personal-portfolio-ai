import * as THREE from 'three';
import { getMaterial } from './Materials';
import { createBlock, createVoxelGroup } from './VoxelBuilder';

const W = 10;
const D = 10;
const H = 4;
const T = 0.5;

function markCollidable(obj: THREE.Object3D): void {
  obj.userData.collidable = true;
}

export function buildRoom(): THREE.Group {
  const room = createVoxelGroup();
  room.name = 'room';

  const wallMat = getMaterial('wall');
  const floorMat = getMaterial('floor');
  const ceilMat = getMaterial('ceiling');
  const ceilLightMat = getMaterial('ceilingLight');
  const doorMat = getMaterial('door');
  const doorFrameMat = getMaterial('doorFrame');
  const baseboardMat = getMaterial('wallDark');
  const trimMat = getMaterial('wallDark');

  const hw = W / 2;
  const hd = D / 2;
  const hh = H / 2;

  // Floor
  room.add(createBlock(W, T, D, floorMat, 0, T / 2, 0));

  // Ceiling — use DoubleSide so it's always visible from inside
  const ceilBlock = createBlock(W, T, D, ceilMat, 0, H - T / 2, 0);
  ceilBlock.material = getMaterial('ceiling', { side: THREE.DoubleSide });
  room.add(ceilBlock);

  // Ceiling lights — four warm emissive panels, positioned BELOW ceiling surface
  const lightY = H - T / 2 - T / 2 - 0.01;
  const lightPositions = [
    [-2.5, lightY, -2.5],
    [2.5, lightY, -2.5],
    [-2.5, lightY, 2.5],
    [2.5, lightY, 2.5],
  ];
  for (const [lx, ly, lz] of lightPositions) {
    const panel = createBlock(1.2, 0.05, 1.2, ceilLightMat, lx, ly, lz);
    panel.material = getMaterial('ceilingLight', { emissive: 0xffeecc, emissiveIntensity: 2.0 });
    room.add(panel);
  }

  // Left wall (x = -hw) — collidable
  const leftWall = createBlock(T, H, D, wallMat, -hw, hh, 0);
  markCollidable(leftWall);
  room.add(leftWall);

  // Right wall (x = hw) — collidable
  const rightWall = createBlock(T, H, D, wallMat, hw, hh, 0);
  markCollidable(rightWall);
  room.add(rightWall);

  // Back wall with window opening — collidable segments
  buildBackWall(room, wallMat, hw, hh, hd, T);

  // Front wall (z = -hd) with door opening — collidable segments
  buildFrontWall(room, wallMat, doorMat, doorFrameMat, hw, hh, hd, T);

  // Baseboards (interior, 0.1 thick, 0.2 high)
  const bbMat = baseboardMat;
  const bbH = 0.2;
  const bbT = 0.1;
  // Left wall baseboard
  room.add(createBlock(bbT, bbH, D - 1, bbMat, -hw + bbT / 2, bbH / 2, 0));
  // Right wall baseboard
  room.add(createBlock(bbT, bbH, D - 1, bbMat, hw - bbT / 2, bbH / 2, 0));
  // Back wall baseboard
  room.add(createBlock(W - 1, bbH, bbT, bbMat, 0, bbH / 2, hd - bbT / 2));
  // Front wall baseboards (left and right of door)
  room.add(createBlock(hw - 0.5, bbH, bbT, bbMat, -(hw + 0.5) / 2, bbH / 2, -hd + bbT / 2));
  room.add(createBlock(hw - 0.5, bbH, bbT, bbMat, (hw + 0.5) / 2, bbH / 2, -hd + bbT / 2));

  // Wainscoting — chair rail at y = 1.0
  const railT = 0.04;
  const railH = 0.04;
  const railY = 1.0;
  room.add(createBlock(railT, railH, D - 1, trimMat, -hw + railT / 2, railY, 0));
  room.add(createBlock(railT, railH, D - 1, trimMat, hw - railT / 2, railY, 0));
  room.add(createBlock(W - 1, railH, railT, trimMat, 0, railY, hd - railT / 2));
  room.add(createBlock(hw - 0.5, railH, railT, trimMat, -(hw + 0.5) / 2, railY, -hd + railT / 2));
  room.add(createBlock(hw - 0.5, railH, railT, trimMat, (hw + 0.5) / 2, railY, -hd + railT / 2));

  // Ceiling trim
  const ct = 0.08;
  const cH = 0.1;
  room.add(createBlock(ct, cH, D - 1, trimMat, -hw + ct / 2, H - cH / 2, 0));
  room.add(createBlock(ct, cH, D - 1, trimMat, hw - ct / 2, H - cH / 2, 0));
  room.add(createBlock(W - 1, cH, ct, trimMat, 0, H - cH / 2, hd - ct / 2));
  room.add(createBlock(hw - 0.5, cH, ct, trimMat, -(hw + 0.5) / 2, H - cH / 2, -hd + ct / 2));
  room.add(createBlock(hw - 0.5, cH, ct, trimMat, (hw + 0.5) / 2, H - cH / 2, -hd + ct / 2));

  // Ceiling cross-beams
  const beamH = 0.12;
  const beamT = 0.08;
  const beamY = H - T - beamH / 2;
  room.add(createBlock(W - 2 * T, beamH, beamT, trimMat, 0, beamY, -2.5));
  room.add(createBlock(W - 2 * T, beamH, beamT, trimMat, 0, beamY, 2.5));
  room.add(createBlock(beamT, beamH, D - 2 * T, trimMat, -2.5, beamY, 0));
  room.add(createBlock(beamT, beamH, D - 2 * T, trimMat, 2.5, beamY, 0));

  // LED strip perimeter accents — thin emissive strips at ceiling-wall junction
  const ledMat = getMaterial('ceilingLight', { emissive: 0x4488ff, emissiveIntensity: 0.3 });
  const ledY = H - T - 0.01;
  const ls = 0.015;
  room.add(createBlock(ls, ls, D - 2 * T + 0.04, ledMat, -hw + T, ledY, 0));
  room.add(createBlock(ls, ls, D - 2 * T + 0.04, ledMat, hw - T, ledY, 0));
  room.add(createBlock(W - 2 * T + 0.04, ls, ls, ledMat, 0, ledY, hd - T));
  room.add(createBlock(hw - 0.5, ls, ls, ledMat, -(hw + 0.5) / 2, ledY, -hd + T));
  room.add(createBlock(hw - 0.5, ls, ls, ledMat, (hw + 0.5) / 2, ledY, -hd + T));

  // Ventilation duct along back wall ceiling
  const ductMat = getMaterial('wallDark');
  room.add(createBlock(W - 2 * T - 0.5, 0.08, 0.18, ductMat, 0, H - T - 0.06, hd - T - 0.12));

  // Cable tray along left wall ceiling
  const trayMat = getMaterial('server');
  room.add(createBlock(0.1, 0.04, D - 2 * T - 0.5, trayMat, -hw + T + 0.08, H - T - 0.12, 0));

  // Corner trim — vertical strips at interior wall intersections
  const cornerMat = getMaterial('wallDark');
  const ct2 = 0.04;
  const corY = H / 2;
  // Left-back corner
  room.add(createBlock(ct2, H - 0.2, ct2, cornerMat, -hw + T / 2, corY, hd - T / 2));
  // Right-back corner
  room.add(createBlock(ct2, H - 0.2, ct2, cornerMat, hw - T / 2, corY, hd - T / 2));
  // Left-front corner (left of door)
  room.add(createBlock(ct2, H - 0.2, ct2, cornerMat, -hw + T / 2, corY, -hd + T / 2));
  // Right-front corner
  room.add(createBlock(ct2, H - 0.2, ct2, cornerMat, hw - T / 2, corY, -hd + T / 2));

  // Network wall port — small data jack plate on the back wall near workspace
  const dataMat = getMaterial('server');
  room.add(createBlock(0.04, 0.04, 0.02, dataMat, -2, 0.5, hd - T / 2 + 0.01));
  room.add(createBlock(0.015, 0.015, 0.01, getMaterial('serverLight'), -2, 0.5, hd - T / 2 + 0.02));

  // Small whiteboard / calendar square on the wall
  const boardMat = getMaterial('board');
  const frameMat = getMaterial('frame');
  room.add(createBlock(0.3, 0.25, 0.02, boardMat, 1.5, 2.0, hd - T / 2 + 0.01));
  room.add(createBlock(0.32, 0.27, 0.015, frameMat, 1.5, 2.0, hd - T / 2 - 0.005));

  return room;
}

function markWallSeg(room: THREE.Group, block: THREE.Mesh): void {
  markCollidable(block);
  room.add(block);
}

function buildFrontWall(
  room: THREE.Group,
  wallMat: THREE.Material,
  doorMat: THREE.Material,
  doorFrameMat: THREE.Material,
  hw: number,
  hh: number,
  hd: number,
  _t: number
): void {
  const doorW = 1;
  const doorH = 2.5;
  const halfDoor = doorW / 2;

  // Left of door
  const leftSegW = hw - halfDoor;
  if (leftSegW > 0) {
    const leftCx = -(hw + halfDoor) / 2;
    markWallSeg(room, createBlock(leftSegW, H, T, wallMat, leftCx, hh, -hd));
  }

  // Right of door
  const rightSegW = hw - halfDoor;
  if (rightSegW > 0) {
    const rightCx = (hw + halfDoor) / 2;
    markWallSeg(room, createBlock(rightSegW, H, T, wallMat, rightCx, hh, -hd));
  }

  // Above door
  const aboveH = H - doorH;
  if (aboveH > 0) {
    markWallSeg(room, createBlock(doorW, aboveH, T, wallMat, 0, H - aboveH / 2, -hd));
  }

  // Door frame side pillars — thin collidable pillars
  const frameW = 0.1;
  const leftPillar = createBlock(frameW, doorH, T, doorFrameMat, -halfDoor, doorH / 2, -hd);
  markCollidable(leftPillar);
  room.add(leftPillar);

  const rightPillar = createBlock(frameW, doorH, T, doorFrameMat, halfDoor, doorH / 2, -hd);
  markCollidable(rightPillar);
  room.add(rightPillar);

  // Door panel — collidable (closed position)
  const doorPanel = createBlock(doorW - 0.2, doorH - 0.1, T * 0.4, doorMat, 0, doorH / 2, -hd - 0.05);
  markCollidable(doorPanel);
  room.add(doorPanel);
}

function buildBackWall(
  room: THREE.Group,
  wallMat: THREE.Material,
  hw: number,
  hh: number,
  hd: number,
  T: number
): void {
  const winW = 1.8;
  const winH = 1.2;
  const winBottom = 1.5;
  const halfWin = winW / 2;
  const winTop = winBottom + winH;

  // Left of window
  const leftW = hw - halfWin;
  if (leftW > 0) {
    markWallSeg(room, createBlock(leftW, H, T, wallMat, -(hw + halfWin) / 2, hh, hd));
  }

  // Right of window
  const rightW = hw - halfWin;
  if (rightW > 0) {
    markWallSeg(room, createBlock(rightW, H, T, wallMat, (hw + halfWin) / 2, hh, hd));
  }

  // Above window
  const aboveH = H - winTop;
  if (aboveH > 0) {
    markWallSeg(room, createBlock(winW, aboveH, T, wallMat, 0, H - aboveH / 2, hd));
  }

  // Below window
  if (winBottom > 0) {
    markWallSeg(room, createBlock(winW, winBottom, T, wallMat, 0, winBottom / 2, hd));
  }

  // Window sill — extends slightly into the room and past the wall
  const sillMat = getMaterial('windowFrame');
  const sill = createBlock(winW + 0.3, 0.06, T + 0.15, sillMat, 0, winBottom, hd + 0.03);
  markCollidable(sill);
  room.add(sill);

  // Interior window frame trim around the opening
  const trimMat = getMaterial('wallDark');
  const ft = 0.04;
  // Top trim
  room.add(createBlock(winW + 0.12, ft, ft, trimMat, 0, winTop, hd - T / 2 + 0.02));
  // Bottom trim
  room.add(createBlock(winW + 0.12, ft, ft, trimMat, 0, winBottom, hd - T / 2 + 0.02));
  // Left trim
  room.add(createBlock(ft, winH + 0.1, ft, trimMat, -halfWin - 0.06, winBottom + winH / 2, hd - T / 2 + 0.02));
  // Right trim
  room.add(createBlock(ft, winH + 0.1, ft, trimMat, halfWin + 0.06, winBottom + winH / 2, hd - T / 2 + 0.02));

  // Exterior depth — a thin reveal on the outer side of the opening
  const extMat = getMaterial('wallDark');
  const revealD = 0.06;
  // Top exterior reveal
  room.add(createBlock(winW + 0.08, revealD, revealD, extMat, 0, winTop, hd + T / 2 - 0.02));
  // Left exterior reveal
  room.add(createBlock(revealD, winH + 0.08, revealD, extMat, -halfWin - 0.04, winBottom + winH / 2, hd + T / 2 - 0.02));
  // Right exterior reveal
  room.add(createBlock(revealD, winH + 0.08, revealD, extMat, halfWin + 0.04, winBottom + winH / 2, hd + T / 2 - 0.02));
}
