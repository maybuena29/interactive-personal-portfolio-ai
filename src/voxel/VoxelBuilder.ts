import * as THREE from 'three';
import type { WorldObject } from '../types';

export type VoxelBuilderFn = (def: WorldObject) => THREE.Object3D;

const registry = new Map<string, VoxelBuilderFn>();

export function registerVoxelBuilder(id: string, fn: VoxelBuilderFn): void {
  registry.set(id, fn);
}

export function getVoxelBuilder(id: string): VoxelBuilderFn | undefined {
  return registry.get(id);
}

export function hasVoxelBuilder(id: string): boolean {
  return registry.has(id);
}

export function createBlock(
  w: number,
  h: number,
  d: number,
  material: THREE.Material,
  x: number,
  y: number,
  z: number
): THREE.Mesh {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function createVoxelGroup(...children: THREE.Object3D[]): THREE.Group {
  const group = new THREE.Group();
  for (let i = 0; i < children.length; i++) {
    group.add(children[i]);
  }
  return group;
}
