import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const HDR_BASE = '/assets/hdr';

export class EnvironmentLoader {
  private rgbeLoader: RGBELoader;
  private envMapCache = new Map<string, THREE.DataTexture>();

  constructor(_renderer: THREE.WebGLRenderer) {
    this.rgbeLoader = new RGBELoader();
  }

  async loadHDR(hdrPath: string): Promise<THREE.DataTexture | null> {
    if (this.envMapCache.has(hdrPath)) return this.envMapCache.get(hdrPath)!;

    const urlsToTry = this.buildUrlCandidates(hdrPath);
    for (const url of urlsToTry) {
      try {
        const texture = await new Promise<THREE.DataTexture>((resolve, reject) => {
          this.rgbeLoader.load(url, resolve, undefined, reject);
        });
        texture.mapping = THREE.EquirectangularReflectionMapping;
        this.envMapCache.set(hdrPath, texture);
        return texture;
      } catch {
      }
    }

    console.warn(`HDR not found: ${hdrPath}`);
    return null;
  }

  async applyEnvironment(scene: THREE.Scene, hdrPath: string): Promise<void> {
    const texture = await this.loadHDR(hdrPath);
    if (texture) {
      scene.environment = texture;
      scene.background = texture;
    }
  }

  private buildUrlCandidates(hdrPath: string): string[] {
    const candidates: string[] = [];
    const hasExtension = hdrPath.includes('.');

    if (hasExtension) {
      const base = hdrPath.substring(0, hdrPath.lastIndexOf('.'));
      const ext = hdrPath.substring(hdrPath.lastIndexOf('.'));
      candidates.push(`${HDR_BASE}/${hdrPath}`);

      const alternatives: Record<string, string[]> = {
        '.hdr': ['.exr', '.png', '.jpg'],
      };
      const alts = alternatives[ext] || [];
      for (const alt of alts) {
        candidates.push(`${HDR_BASE}/${base}${alt}`);
      }
    } else {
      candidates.push(`${HDR_BASE}/${hdrPath}.hdr`);
    }

    return candidates;
  }

  clearCache(): void {
    this.envMapCache.clear();
  }
}
