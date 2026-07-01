import * as THREE from 'three';
import { ConfigLoader } from '../loaders/ConfigLoader';
import { LightingSystem } from './LightingSystem';
import { AudioManager } from '../audio/AudioManager';
import { UnlockSystem } from './UnlockSystem';
import type { Area, WorldMap } from '../types';

interface AreaTransition {
  active: boolean;
  progress: number;
  duration: number;
  toArea: Area;
}

export class AreaSystem {
  private configLoader: ConfigLoader;
  private lightingSystem: LightingSystem;
  private audioManager: AudioManager;
  private unlockSystem: UnlockSystem;
  private areas: Area[] = [];
  private currentArea: Area | null = null;
  private transition: AreaTransition | null = null;
  private initialized = false;
  private worldMap!: WorldMap;

  constructor(
    configLoader: ConfigLoader,
    lightingSystem: LightingSystem,
    audioManager: AudioManager,
    unlockSystem: UnlockSystem
  ) {
    this.configLoader = configLoader;
    this.lightingSystem = lightingSystem;
    this.audioManager = audioManager;
    this.unlockSystem = unlockSystem;
  }

  async init(): Promise<void> {
    try {
      this.worldMap = await this.configLoader.loadWorldMap();
      this.areas = this.worldMap?.areas ?? [];
    } catch (err) {
      console.warn('AreaSystem: failed to load world map, no areas available', err);
      this.areas = [];
    }
    this.initialized = true;
  }

  update(cameraPosition: THREE.Vector3, delta: number): void {
    if (!this.initialized || this.areas.length === 0) return;

    if (this.transition && this.transition.active) {
      this.transition.progress += delta / this.transition.duration;
      if (this.transition.progress >= 1) {
        this.transition.active = false;
        this.currentArea = this.transition.toArea;
        this.applyArea(this.transition.toArea);
        this.transition = null;
      }
      return;
    }

    const nearest = this.findNearestArea(cameraPosition);

    if (!nearest) return;

    if (!this.currentArea) {
      this.currentArea = nearest;
      this.applyArea(nearest);
      return;
    }

    if (nearest.id !== this.currentArea.id) {
      this.startTransition(nearest);
    }
  }

  getCurrentArea(): Area | null {
    return this.currentArea;
  }

  getAreaById(areaId: string): Area | undefined {
    return this.areas.find(a => a.id === areaId);
  }

  getObjectArea(objectId: string): Area | undefined {
    return this.areas.find(a => a.objects.includes(objectId));
  }

  isAreaAccessible(areaId: string): boolean {
    const area = this.getAreaById(areaId);
    if (!area) return false;
    return this.unlockSystem.isAreaUnlocked(area);
  }

  isObjectAccessible(objectId: string): boolean {
    const area = this.getObjectArea(objectId);
    if (!area) return true;
    if (!area.unlockCondition) return true;
    return this.unlockSystem.isConditionFulfilled(area.unlockCondition);
  }

  getObjectLockCondition(objectId: string): string | null {
    const area = this.getObjectArea(objectId);
    if (!area) return null;
    return area.unlockCondition || null;
  }

  getAreaSpawnId(areaId: string): string {
    const area = this.getAreaById(areaId);
    if (!area) return 'spawn-main';
    const areaSpawnMap: Record<string, string> = {
      entrance: 'spawn-main',
      workspace: 'spawn-workspace',
      library: 'spawn-library',
      'architecture-zone': 'spawn-architecture',
      'certificate-wall': 'spawn-certificate',
      'window-area': 'spawn-window',
      'secret-lab': 'spawn-lab',
    };
    return areaSpawnMap[areaId] || 'spawn-main';
  }

  getAreas(): Area[] {
    return this.areas;
  }

  getStartingAreaId(): string {
    return this.worldMap.startingArea;
  }

  getWorldMap(): WorldMap {
    return this.worldMap;
  }

  private findNearestArea(position: THREE.Vector3): Area | null {
    let nearest: Area | null = null;
    let nearestDist = Infinity;

    for (const area of this.areas) {
      if (area.hidden && !this.unlockSystem.isAreaUnlocked(area)) continue;

      const center = area.position || { x: 0, y: 0, z: 0 };
      const dx = position.x - center.x;
      const dz = position.z - center.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const radius = area.radius || 2.5;

      if (dist < radius && dist < nearestDist) {
        nearestDist = dist;
        nearest = area;
      }
    }

    return nearest;
  }

  private startTransition(area: Area): void {
    this.transition = {
      active: true,
      progress: 0,
      duration: 0.8,
      toArea: area,
    };

    this.lightingSystem.transitionToPreset(area.lighting, 0.8);

    if (area.music) {
      this.audioManager.fadeToAmbient(area.music, 0.8);
    }
  }

  private applyArea(area: Area): void {
    this.lightingSystem.applyPreset(area.lighting);

    if (area.music) {
      this.audioManager.playAmbient(area.music);
    }
  }

  destroy(): void {
    this.initialized = false;
    this.currentArea = null;
    this.transition = null;
  }
}
