import * as THREE from 'three';

const TEXTURE_BASE = '/assets/textures';

export class TextureLoader {
  private loader: THREE.TextureLoader;
  private cache = new Map<string, THREE.Texture>();

  constructor() {
    this.loader = new THREE.TextureLoader();
  }

  async loadTexture(texturePath: string): Promise<THREE.Texture | null> {
    if (this.cache.has(texturePath)) return this.cache.get(texturePath)!;

    const urlsToTry = this.buildUrlCandidates(texturePath);
    for (const url of urlsToTry) {
      try {
        const texture = await new Promise<THREE.Texture>((resolve, reject) => {
          this.loader.load(url, resolve, undefined, reject);
        });
        this.cache.set(texturePath, texture);
        return texture;
      } catch {
      }
    }

    console.warn(`Texture not found: ${texturePath}`);
    return null;
  }

  private buildUrlCandidates(texturePath: string): string[] {
    const candidates: string[] = [];
    const hasExtension = texturePath.includes('.');

    if (hasExtension) {
      const base = texturePath.substring(0, texturePath.lastIndexOf('.'));
      const ext = texturePath.substring(texturePath.lastIndexOf('.'));
      candidates.push(`${TEXTURE_BASE}/${texturePath}`);

      const texExtMap: Record<string, string[]> = {
        '.png': ['.webp', '.jpg', '.jpeg'],
        '.jpg': ['.webp', '.png', '.jpeg'],
        '.jpeg': ['.webp', '.png', '.jpg'],
        '.webp': ['.png', '.jpg', '.jpeg'],
      };
      const alts = texExtMap[ext] || ['.webp', '.png', '.jpg'];
      for (const alt of alts) {
        candidates.push(`${TEXTURE_BASE}/${base}${alt}`);
      }
    } else {
      for (const ext of ['.webp', '.png', '.jpg']) {
        candidates.push(`${TEXTURE_BASE}/${texturePath}${ext}`);
      }
    }

    return [...new Set(candidates)];
  }

  clearCache(): void {
    this.cache.clear();
  }
}
