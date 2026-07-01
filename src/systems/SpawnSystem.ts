import * as THREE from 'three';
import type { SpawnPointDefinition } from '../types';

export interface SpawnPoint {
  id: string;
  position: THREE.Vector3;
  rotation: number;
}

export class SpawnSystem {
  private spawnPoints = new Map<string, SpawnPoint>();

  constructor() {
  }

  init(spawnPointDefs?: Record<string, SpawnPointDefinition>): void {
    this.spawnPoints.clear();

    if (spawnPointDefs) {
      for (const [id, def] of Object.entries(spawnPointDefs)) {
        this.spawnPoints.set(id, {
          id,
          position: new THREE.Vector3(def.position.x, def.position.y, def.position.z),
          rotation: def.rotation,
        });
      }
    }

    if (!this.spawnPoints.has('spawn-main')) {
      this.spawnPoints.set('spawn-main', {
        id: 'spawn-main',
        position: new THREE.Vector3(0, 1.72, 0),
        rotation: 0,
      });
    }
  }

  getSpawn(spawnId: string): SpawnPoint {
    return this.spawnPoints.get(spawnId) || this.spawnPoints.get('spawn-main')!;
  }

  getDefaultSpawn(): SpawnPoint {
    return this.spawnPoints.get('spawn-main')!;
  }

  registerSpawn(id: string, position: THREE.Vector3, rotation: number): void {
    this.spawnPoints.set(id, { id, position, rotation });
  }

  teleportToSpawn(camera: THREE.PerspectiveCamera, spawnId: string): void {
    const spawn = this.getSpawn(spawnId);
    camera.position.copy(spawn.position);
    const euler = new THREE.Euler(0, spawn.rotation, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler);
  }

  getAllSpawnIds(): string[] {
    return Array.from(this.spawnPoints.keys());
  }
}
