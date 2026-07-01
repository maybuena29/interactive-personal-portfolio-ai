import { ConfigLoader } from './ConfigLoader';
import type { PortfolioSchema } from '../types';

export class DataLoader {
  private configLoader: ConfigLoader;
  private dataCache = new Map<string, any>();
  private loadedKeys = new Set<string>();
  private schema!: PortfolioSchema;

  constructor(configLoader: ConfigLoader) {
    this.configLoader = configLoader;
  }

  async init(): Promise<void> {
    try {
      this.schema = await this.configLoader.loadSchema();
    } catch (err) {
      console.warn('DataLoader: failed to load schema, using empty config', err);
      this.schema = { version: 1, portfolio: {}, world: {}, relationships: {}, entryPoints: {} };
    }
  }

  async loadDataset<T>(key: string): Promise<T | null> {
    if (this.dataCache.has(key)) return this.dataCache.get(key) as T;
    const path = this.schema?.portfolio?.[key];
    if (!path) return null;

    try {
      const loader = this.getLoader(key);
      if (!loader) return null;
      const data = await loader() as T;
      this.dataCache.set(key, data);
      this.loadedKeys.add(key);
      return data;
    } catch {
      return null;
    }
  }

  private getLoader(key: string): (() => Promise<any>) | null {
    const loaders: Record<string, () => Promise<any>> = {
      profile: () => this.configLoader.loadProfile(),
      projects: () => this.configLoader.loadProjects(),
      experience: () => this.configLoader.loadExperience(),
      education: () => this.configLoader.loadEducation(),
      skills: () => this.configLoader.loadSkills(),
      contact: () => this.configLoader.loadContact(),
      timeline: () => this.configLoader.loadTimeline(),
      future: () => this.configLoader.loadFuture(),
      settings: () => this.configLoader.loadSettings(),
    };
    return loaders[key] || null;
  }

  async loadDatasets(keys: string[]): Promise<Map<string, any>> {
    const results = new Map<string, any>();
    const unique = [...new Set(keys)];
    for (const key of unique) {
      const data = await this.loadDataset(key);
      if (data) results.set(key, data);
    }
    return results;
  }

  async preloadAll(): Promise<void> {
    if (!this.schema) await this.init();
    const keys = Object.keys(this.schema.portfolio);
    for (const key of keys) {
      await this.loadDataset(key);
    }
  }

  isLoaded(key: string): boolean {
    return this.loadedKeys.has(key);
  }

  getCached<T>(key: string): T | undefined {
    return this.dataCache.get(key) as T | undefined;
  }
}
