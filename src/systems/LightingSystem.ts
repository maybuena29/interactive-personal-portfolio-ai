import * as THREE from 'three';
import { ConfigLoader } from '../loaders/ConfigLoader';
import type { LightingConfig } from '../types';
import { lerp, easeInOutCubic } from '../utils';

export class LightingSystem {
  private scene: THREE.Scene;
  private configLoader: ConfigLoader;
  private config!: LightingConfig;
  private ambientLight: THREE.AmbientLight;
  private directionalLight: THREE.DirectionalLight;
  private hemisphereLight: THREE.HemisphereLight;
  private ceilingFill: THREE.PointLight;
  private activePreset: string = '';
  private spotlights: Map<string, THREE.SpotLight> = new Map();
  private activeSpotlights: THREE.SpotLight[] = [];
  private emissiveObjects: Map<string, THREE.Object3D> = new Map();
  private transitionState: {
    active: boolean;
    fromAmbient: number;
    toAmbient: number;
    progress: number;
    duration: number;
    targetPresetId: string;
    targetPreset: { ambient: number; spotlights?: string[]; emissive?: string[] } | null;
  } | null = null;

  constructor(scene: THREE.Scene, configLoader: ConfigLoader) {
    this.scene = scene;
    this.configLoader = configLoader;

    this.ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    this.scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.directionalLight.position.set(5, 10, 5);
    this.directionalLight.castShadow = true;
    this.scene.add(this.directionalLight);

    this.hemisphereLight = new THREE.HemisphereLight(0xffeedd, 0x445566, 0.8);
    this.hemisphereLight.position.set(0, 3, 0);
    this.scene.add(this.hemisphereLight);

    this.ceilingFill = new THREE.PointLight(0xffffff, 1.0, 8);
    this.ceilingFill.position.set(0, 2.8, 0);
    this.scene.add(this.ceilingFill);
  }

  async init(): Promise<void> {
    try {
      this.config = await this.configLoader.loadLightingConfig();
    } catch (err) {
      console.warn('LightingSystem: failed to load config, using defaults', err);
      this.config = {
        version: 1,
        global: { environmentIntensity: 1.0, exposure: 1.0 },
        weatherLighting: {
          'clear-night': {
            environmentIntensity: 0.55, exposure: 0.82,
            backgroundColor: '#07111c',
            ambientLight: { intensity: 0.22, color: '#7f9cc4' },
            bloom: true, contactShadows: true, softShadows: true,
          },
        },
        presets: [],
        effects: { monitorGlow: false, bloom: false, contactShadows: false, softShadows: false, autoExposure: false, volumetricLight: false },
      };
    }
    const weatherEntry = this.config.weatherLighting?.['clear-night'];
    this.scene.background = new THREE.Color(weatherEntry?.backgroundColor || '#07111c');
    this.createSpotlightDefinitions();
  }

  private createSpotlightDefinitions(): void {
    const positions: Record<string, { pos: THREE.Vector3; target: THREE.Vector3; color: number; intensity: number; angle: number; distance: number }> = {
      'entrance-spot': { pos: new THREE.Vector3(0, 4, 0), target: new THREE.Vector3(0, 0, 0), color: 0xffeedd, intensity: 0.8, angle: 0.6, distance: 8 },
      'desk-light': { pos: new THREE.Vector3(0, 3, 0), target: new THREE.Vector3(0, 0, 0), color: 0xffffff, intensity: 1.2, angle: 0.5, distance: 6 },
      'bookshelf-light': { pos: new THREE.Vector3(-2, 3.5, 0), target: new THREE.Vector3(-2, 1, 0), color: 0xffeedd, intensity: 1.0, angle: 0.7, distance: 7 },
      'server-light': { pos: new THREE.Vector3(2, 3, 0), target: new THREE.Vector3(2, 0.5, 0), color: 0x4488ff, intensity: 0.9, angle: 0.6, distance: 6 },
      'certificate-light': { pos: new THREE.Vector3(0, 4, -3), target: new THREE.Vector3(0, 1.5, -3), color: 0xffeedd, intensity: 1.5, angle: 0.5, distance: 5 },
      'prototype-light': { pos: new THREE.Vector3(0, 3, 2), target: new THREE.Vector3(0, 0.5, 2), color: 0x88ddff, intensity: 1.0, angle: 0.6, distance: 6 },
      'terminal-light': { pos: new THREE.Vector3(0, 3, -2), target: new THREE.Vector3(0, 0.5, -2), color: 0x33ff33, intensity: 0.7, angle: 0.5, distance: 5 },
    };

    for (const [id, def] of Object.entries(positions)) {
      const light = new THREE.SpotLight(def.color, def.intensity, def.distance, def.angle, 0.5, 1);
      light.position.copy(def.pos);
      light.target.position.copy(def.target);
      light.castShadow = true;
      light.shadow.mapSize.width = 512;
      light.shadow.mapSize.height = 512;
      this.scene.add(light);
      this.scene.add(light.target);
      light.visible = false;
      this.spotlights.set(id, light);
    }
  }

  applyWeather(weatherPresetName: string): void {
    if (!this.config?.weatherLighting) {
      console.warn(`LightingSystem: weatherLighting not loaded, cannot apply "${weatherPresetName}"`);
      return;
    }
    const weather = this.config.weatherLighting[weatherPresetName];
    if (!weather) {
      console.warn(`LightingSystem: unknown weather preset "${weatherPresetName}"`);
      return;
    }

    this.scene.background = new THREE.Color(weather.backgroundColor);
    const clamped = Math.max(weather.ambientLight.intensity, 0.35);
    this.ambientLight.intensity = clamped;
    this.ambientLight.color.set(weather.ambientLight.color);

    const dirLight = weather.directionalLight || weather.moonLight;
    if (dirLight?.enabled) {
      this.directionalLight.intensity = dirLight.intensity;
      this.directionalLight.color.set(dirLight.color);
      this.directionalLight.position.set(
        Math.sin((dirLight.angle || 45) * Math.PI / 180) * 10,
        Math.cos((dirLight.angle || 45) * Math.PI / 180) * 10,
        5
      );
    }

    const isNight = weatherPresetName.includes('night');
    this.hemisphereLight.intensity = isNight ? 0.5 : 0.8;
    this.ceilingFill.intensity = isNight ? 0.8 : 1.0;
  }

  update(delta: number): void {
    if (!this.transitionState || !this.transitionState.active) return;

    this.transitionState.progress += delta / this.transitionState.duration;
    const t = easeInOutCubic(Math.min(1, this.transitionState.progress));
    this.ambientLight.intensity = lerp(
      this.transitionState.fromAmbient,
      this.transitionState.toAmbient,
      t
    );

    if (this.transitionState.progress >= 1) {
      this.transitionState.active = false;
      this.applyPresetInstant(this.transitionState.targetPresetId, this.transitionState.targetPreset);
      this.transitionState = null;
    }
  }

  applyPreset(presetId: string): void {
    if (this.activePreset === presetId) return;
    this.activePreset = presetId;
    const preset = this.config.presets.find(p => p.id === presetId);
    if (!preset) return;
    this.applyPresetInstant(presetId, preset);
  }

  transitionToPreset(presetId: string, duration: number): void {
    if (this.activePreset === presetId) return;
    const preset = this.config.presets.find(p => p.id === presetId);
    if (!preset) return;

    this.transitionState = {
      active: true,
      fromAmbient: this.ambientLight.intensity,
      toAmbient: preset.ambient,
      progress: 0,
      duration,
      targetPresetId: presetId,
      targetPreset: preset,
    };
  }

  private applyPresetInstant(presetId: string, preset: { ambient: number; spotlights?: string[]; emissive?: string[] } | null): void {
    if (!preset) return;
    this.activePreset = presetId;

    this.ambientLight.intensity = preset.ambient;
    this.clearEmissive();

    for (const spot of this.activeSpotlights) {
      spot.visible = false;
    }
    this.activeSpotlights = [];

    if (preset.spotlights) {
      for (const spotId of preset.spotlights) {
        const spot = this.spotlights.get(spotId);
        if (spot) {
          spot.visible = true;
          this.activeSpotlights.push(spot);
        }
      }
    }

    if (preset.emissive) {
      this.scene.traverse((child) => {
        if (child.userData?.objectId && preset.emissive!.includes(child.userData.objectId)) {
          this.emissiveObjects.set(child.userData.objectId, child);
          const mesh = this.findMesh(child);
          if (mesh && mesh.material) {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            mat.emissive = new THREE.Color(mat.color);
            mat.emissiveIntensity = 0.15;
          }
        }
      });
    }
  }

  clearEmissive(): void {
    this.emissiveObjects.forEach((obj) => {
      const mesh = this.findMesh(obj);
      if (mesh && mesh.material) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.emissive = new THREE.Color(0x000000);
        mat.emissiveIntensity = 0;
      }
    });
    this.emissiveObjects.clear();
  }

  getConfig(): LightingConfig | undefined {
    return this.config;
  }

  private findMesh(obj: THREE.Object3D): THREE.Mesh | null {
    if (obj instanceof THREE.Mesh) return obj;
    let result: THREE.Mesh | null = null;
    obj.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh && !result) result = child;
    });
    return result;
  }
}
