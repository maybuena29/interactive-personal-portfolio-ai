import type {
  Settings, SceneConfig, WorldMap, WorldObject, InteractionConfig,
  LightingConfig, AudioConfig, Profile, Experience, Project, Education,
  Skills, Contact, Timeline, PortfolioSchema, QueryMap, PromptContext, AgentRules
} from '../types';
import type { FutureGoals } from '../types';

const CONFIG_BASE = '/config';

export class ConfigLoader {
  private cache = new Map<string, any>();

  private async fetchJSON<T>(path: string): Promise<T> {
    if (this.cache.has(path)) return this.cache.get(path) as T;
    const res = await fetch(`${CONFIG_BASE}/${path}`);
    if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
    const data = await res.json() as T;
    this.cache.set(path, data);
    return data;
  }

  async loadSettings(): Promise<Settings> {
    return this.fetchJSON<Settings>('data/settings.json');
  }

  async loadSceneConfig(): Promise<SceneConfig> {
    return this.fetchJSON<SceneConfig>('world/scene.json');
  }

  async loadWorldMap(): Promise<WorldMap> {
    return this.fetchJSON<WorldMap>('world/world-map.json');
  }

  async loadObjects(): Promise<WorldObject[]> {
    const data = await this.fetchJSON<{ version: number; objects: WorldObject[] }>('world/objects.json');
    return data.objects;
  }

  async loadInteractionConfig(): Promise<InteractionConfig> {
    return this.fetchJSON<InteractionConfig>('world/interactions.json');
  }

  async loadLightingConfig(): Promise<LightingConfig> {
    return this.fetchJSON<LightingConfig>('world/lighting.json');
  }

  async loadAudioConfig(): Promise<AudioConfig> {
    return this.fetchJSON<AudioConfig>('world/audio.json');
  }

  async loadProfile(): Promise<Profile> {
    return this.fetchJSON<Profile>('data/profile.json');
  }

  async loadExperience(): Promise<Experience[]> {
    return this.fetchJSON<Experience[]>('data/experience.json');
  }

  async loadProjects(): Promise<Project[]> {
    return this.fetchJSON<Project[]>('data/projects.json');
  }

  async loadEducation(): Promise<Education[]> {
    return this.fetchJSON<Education[]>('data/education.json');
  }

  async loadSkills(): Promise<Skills> {
    return this.fetchJSON<Skills>('data/skills.json');
  }

  async loadContact(): Promise<Contact> {
    return this.fetchJSON<Contact>('data/contact.json');
  }

  async loadTimeline(): Promise<Timeline[]> {
    return this.fetchJSON<Timeline[]>('data/timeline.json');
  }

  async loadFuture(): Promise<FutureGoals> {
    return this.fetchJSON<FutureGoals>('data/future.json');
  }

  async loadSchema(): Promise<PortfolioSchema> {
    return this.fetchJSON<PortfolioSchema>('ai/portfolio.schema.json');
  }

  async loadQueryMap(): Promise<QueryMap> {
    return this.fetchJSON<QueryMap>('ai/query-map.json');
  }

  async loadPromptContext(): Promise<PromptContext> {
    return this.fetchJSON<PromptContext>('ai/prompt-context.json');
  }

  async loadAgentRules(): Promise<AgentRules> {
    return this.fetchJSON<AgentRules>('ai/agent-rules.json');
  }

  clearCache(): void {
    this.cache.clear();
  }
}
