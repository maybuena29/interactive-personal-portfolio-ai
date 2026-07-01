import * as THREE from 'three';
import { LightingSystem } from './LightingSystem';
import { ConfigLoader } from '../loaders/ConfigLoader';

type WeatherType = 'rain' | 'clear';

export class EnvironmentManager {
  private scene: THREE.Scene;
  private lightingSystem: LightingSystem;
  private configLoader: ConfigLoader;
  private currentPreset: string = 'clear-night';
  private weather: WeatherType = 'clear';
  private timeRanges: any = null;
  private updateInterval: number | null = null;
  private weatherToggleInterval: number | null = null;
  private particleSystem: THREE.Points | null = null;
  private rainVelocities: Float32Array | null = null;
  private rainBounds = { width: 40, height: 10, depth: 40 };
  private roomBounds = { xMin: -5, xMax: 5, yMin: 0, yMax: 4, zMin: -5, zMax: 5 };
  onWeatherChange: ((weather: WeatherType) => void) | null = null;

  constructor(scene: THREE.Scene, lightingSystem: LightingSystem, configLoader: ConfigLoader) {
    this.scene = scene;
    this.lightingSystem = lightingSystem;
    this.configLoader = configLoader;
  }

  async init(weatherOverride: string, timeRanges: any): Promise<void> {
    this.timeRanges = timeRanges;
    this.weather = (weatherOverride === 'rain' ? 'rain' : 'clear') as WeatherType;
    this.determinePreset();
    try {
      await this.applyCurrentPreset();
    } catch (err) {
      console.warn('EnvironmentManager.init: error applying preset, continuing with defaults', err);
    }
  }

  startTimeUpdate(weather: string): void {
    this.weather = (weather === 'rain' ? 'rain' : 'clear') as WeatherType;
    this.determinePreset();
    this.applyCurrentPreset().catch(err =>
      console.warn('EnvironmentManager.startTimeUpdate: initial apply failed', err)
    );

    this.updateInterval = window.setInterval(() => {
      this.determinePreset();
      this.applyCurrentPreset().catch(err =>
        console.warn('EnvironmentManager interval: apply failed', err)
      );
    }, 60000);

    this.weatherToggleInterval = window.setInterval(() => {
      const next: WeatherType = this.weather === 'rain' ? 'clear' : 'rain';
      this.setWeather(next);
    }, 90000);
  }

  private determinePreset(): void {
    if (!this.timeRanges) return;
    const hour = new Date().getHours();
    const isDay = hour >= this.timeRanges.day.startHour && hour < this.timeRanges.day.endHour;
    const timeRange = isDay ? this.timeRanges.day : this.timeRanges.night;
    this.currentPreset = this.weather === 'rain' ? timeRange.alternatePreset : timeRange.defaultPreset;
  }

  private async applyCurrentPreset(): Promise<void> {
    let sceneConfig: any;
    try {
      sceneConfig = await this.configLoader.loadSceneConfig();
    } catch (err) {
      console.warn('EnvironmentManager: failed to load scene config, cannot apply preset', err);
      return;
    }
    const preset = sceneConfig?.environment?.presets?.[this.currentPreset];
    if (!preset) {
      console.warn(`EnvironmentManager: preset "${this.currentPreset}" not found in config`);
      return;
    }

    if (preset.lightingPreset) {
      this.lightingSystem.applyWeather(preset.lightingPreset);
    }

    if (preset.particles === 'rain') {
      this.createRain();
    } else {
      this.removeRain();
    }
  }

  update(delta: number): void {
    if (!this.particleSystem || !this.rainVelocities) return;
    const positions = this.particleSystem.geometry.attributes.position.array as Float32Array;
    const alphas = this.particleSystem.geometry.attributes.alpha.array as Float32Array;

    for (let i = 0; i < positions.length; i += 3) {
      const idx = i / 3;
      positions[i + 1] -= this.rainVelocities[idx] * delta;
      positions[i] += 0.3 * delta;
      positions[i + 2] += 0.2 * delta;

      const px = positions[i], py = positions[i + 1], pz = positions[i + 2];

      if (py < -1) {
        const [x, y, z] = this.spawnOutsideRoom();
        positions[i] = x;
        positions[i + 1] = y;
        positions[i + 2] = z;
      }

      const inside = px > this.roomBounds.xMin && px < this.roomBounds.xMax &&
                     py > this.roomBounds.yMin && py < this.roomBounds.yMax &&
                     pz > this.roomBounds.zMin && pz < this.roomBounds.zMax;
      alphas[idx] = inside ? 0 : 1;
    }
    this.particleSystem.geometry.attributes.position.needsUpdate = true;
    this.particleSystem.geometry.attributes.alpha.needsUpdate = true;
  }

  private spawnOutsideRoom(): [number, number, number] {
    const b = this.roomBounds;
    for (;;) {
      const x = (Math.random() - 0.5) * this.rainBounds.width;
      const y = Math.random() * this.rainBounds.height;
      const z = (Math.random() - 0.5) * this.rainBounds.depth;
      if (!(x > b.xMin && x < b.xMax && y > b.yMin && y < b.yMax && z > b.zMin && z < b.zMax)) {
        return [x, y, z];
      }
    }
  }

  private createRain(): void {
    this.removeRain();
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const alphas = new Float32Array(count).fill(1);
    const velocities = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const [x, y, z] = this.spawnOutsideRoom();
      positions[idx] = x;
      positions[idx + 1] = y;
      positions[idx + 2] = z;
      velocities[i] = 3 + Math.random() * 3;
    }
    this.rainVelocities = velocities;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0x8888cc) },
        uSize: { value: 0.05 },
      },
      vertexShader: `
        attribute float alpha;
        varying float vAlpha;
        void main() {
          vAlpha = alpha;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = uSize * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vAlpha;
        void main() {
          vec2 c = gl_PointCoord - vec2(0.5);
          float d = 1.0 - smoothstep(0.0, 0.5, length(c));
          gl_FragColor = vec4(uColor, d * vAlpha * 0.4);
        }
      `,
      transparent: true,
      depthWrite: false,
    });
    this.particleSystem = new THREE.Points(geometry, material);
    this.scene.add(this.particleSystem);
  }

  private removeRain(): void {
    if (this.particleSystem) {
      this.scene.remove(this.particleSystem);
      this.particleSystem.geometry.dispose();
      (this.particleSystem.material as THREE.Material).dispose();
      this.particleSystem = null;
      this.rainVelocities = null;
    }
  }

  setWeather(weather: string): void {
    this.weather = (weather === 'rain' ? 'rain' : 'clear') as WeatherType;
    this.determinePreset();
    this.applyCurrentPreset().catch(err =>
      console.warn('EnvironmentManager.setWeather: apply failed', err)
    );
    this.onWeatherChange?.(this.weather);
  }

  getCurrentPreset(): string {
    return this.currentPreset;
  }

  destroy(): void {
    if (this.updateInterval !== null) clearInterval(this.updateInterval);
    if (this.weatherToggleInterval !== null) clearInterval(this.weatherToggleInterval);
    this.removeRain();
  }
}
