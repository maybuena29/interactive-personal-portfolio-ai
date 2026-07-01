import * as THREE from 'three';
import { BLOCK_COLORS } from './Palette';

const cache = new Map<string, THREE.MeshStandardMaterial>();

export type BlockColorKey = keyof typeof BLOCK_COLORS;

export function getMaterial(
  key: BlockColorKey,
  extra?: Partial<THREE.MeshStandardMaterialParameters>
): THREE.MeshStandardMaterial {
  const hash = key + (extra ? JSON.stringify(extra) : '');
  const existing = cache.get(hash);
  if (existing) return existing;

  const color = BLOCK_COLORS[key];

  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.8,
    metalness: 0.1,
    ...extra,
  });

  cache.set(hash, mat);
  return mat;
}

export function clearMaterialCache(): void {
  cache.clear();
}
