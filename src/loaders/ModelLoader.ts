import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const MODEL_BASE = '/assets/models';
const DRACO_DECODER_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/';

export type LoadCallback = (loaded: number, total: number, label: string) => void;

const FORMAT_EXTENSIONS = ['.glb', '.gltf'];

export class ModelLoader {
  private gltfLoader: GLTFLoader;
  private dracoLoader: DRACOLoader;
  private cache = new Map<string, THREE.Group>();
  private pending = new Map<string, Promise<THREE.Group | null>>();
  private loadingCount = 0;
  private totalCount = 0;
  private onProgress: LoadCallback | null = null;

  constructor() {
    this.gltfLoader = new GLTFLoader();
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath(DRACO_DECODER_PATH);
    this.gltfLoader.setDRACOLoader(this.dracoLoader);
  }

  setProgressCallback(cb: LoadCallback): void {
    this.onProgress = cb;
  }

  getLoadCounts(): { loaded: number; total: number } {
    return { loaded: this.loadingCount, total: this.totalCount };
  }

  resetCounts(): void {
    this.loadingCount = 0;
    this.totalCount = 0;
  }

  queueAll(modelPaths: string[]): void {
    const unique = [...new Set(modelPaths)].filter(m => m && !this.cache.has(m));
    this.totalCount = unique.length;
  }

  async loadModel(modelPath: string): Promise<THREE.Group | null> {
    if (this.cache.has(modelPath)) return this.cache.get(modelPath)!.clone();

    if (this.pending.has(modelPath)) {
      const result = await this.pending.get(modelPath)!;
      return result ? result.clone() : null;
    }

    const promise = this.loadWithFallback(modelPath);
    this.pending.set(modelPath, promise);
    return promise;
  }

  private async loadWithFallback(modelPath: string): Promise<THREE.Group | null> {
    const urlsToTry = this.buildUrlCandidates(modelPath);

    for (const url of urlsToTry) {
      const result = await this.tryLoadUrl(url);
      if (result) {
        this.cache.set(modelPath, result);
        this.loadingCount++;
        this.reportProgress(modelPath);
        return result.clone();
      }
    }

    this.loadingCount++;
    this.reportProgress(`${modelPath} (fallback)`);
    return null;
  }

  private buildUrlCandidates(modelPath: string): string[] {
    const candidates: string[] = [];
    const hasExtension = modelPath.includes('.');

    if (hasExtension) {
      const base = modelPath.substring(0, modelPath.lastIndexOf('.'));
      const ext = modelPath.substring(modelPath.lastIndexOf('.'));
      candidates.push(`${MODEL_BASE}/${modelPath}`);

      for (const fmt of FORMAT_EXTENSIONS) {
        if (fmt !== ext) {
          candidates.push(`${MODEL_BASE}/${base}${fmt}`);
        }
      }
    } else {
      for (const fmt of FORMAT_EXTENSIONS) {
        candidates.push(`${MODEL_BASE}/${modelPath}${fmt}`);
      }
    }

    return candidates;
  }

  private tryLoadUrl(url: string): Promise<THREE.Group | null> {
    return new Promise((resolve) => {
      this.gltfLoader.load(
        url,
        (gltf) => resolve(gltf.scene),
        undefined,
        () => resolve(null)
      );
    });
  }

  async loadAll(models: string[]): Promise<Map<string, THREE.Group | null>> {
    const results = new Map<string, THREE.Group | null>();
    const unique = [...new Set(models)].filter(m => m && !this.cache.has(m));
    this.totalCount = unique.length;
    this.loadingCount = 0;

    for (const modelPath of unique) {
      const result = await this.loadModel(modelPath);
      results.set(modelPath, result);
    }
    return results;
  }

  getCachedGroup(modelPath: string): THREE.Group | null {
    const cached = this.cache.get(modelPath);
    return cached ? cached.clone() : null;
  }

  private reportProgress(label: string): void {
    if (this.onProgress) {
      this.onProgress(this.loadingCount, this.totalCount, label);
    }
  }

  clearCache(): void {
    this.cache.clear();
    this.pending.clear();
  }
}
