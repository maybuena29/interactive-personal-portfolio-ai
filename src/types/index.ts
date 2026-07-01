export interface Profile {
  id: string;
  personal: {
    firstName: string;
    lastName: string;
    displayName: string;
    title: string;
    headline: string;
    location: { country: string };
    availability: string;
  };
  about: {
    summary: string;
    careerObjective: string;
  };
  professionalProfile: {
    currentRole: string;
    currentCompany: string;
    specialization: string[];
  };
  yearsOfExperience: { professional: number; industryStart: number };
  strengths: string[];
  coreValues: string[];
  interests: string[];
  featuredProjectIds: string[];
  quickFacts: {
    graduationAward: string;
    academicRecognition: string;
    codeCompetition: string;
    preferredStack: string[];
  };
  scene: {
    primaryObject: string;
    cameraFocus: string;
    interaction: string;
  };
  metadata: { version: number; lastUpdated: string; source: string };
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  employmentType: string;
  start: string;
  end: string | null;
  current: boolean;
  summary: string;
  responsibilities: string[];
  technologies: string[];
  projects: string[];
}

export interface Project {
  id: string;
  title: string;
  category: string;
  featured?: boolean;
  status?: string;
  company?: string;
  client?: string;
  role?: string;
  period?: { start: string; end: string | null };
  summary: string;
  description?: string;
  responsibilities?: string[];
  technologies: string[];
  highlights?: string[];
  skills?: string[];
}

export interface Education {
  id: string;
  institution: string;
  program: string;
  specialization?: string;
  level: string;
  startYear: number;
  endYear: number;
  honors?: string[];
  thesis?: { title: string; projectId: string };
  awards?: { title: string; event: string }[];
  description?: string;
}

export interface SkillCategory {
  id: string;
  title: string;
  icon: string;
  priority: number;
  description: string;
  skills: string[];
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  experienceLevel: string;
  featured?: boolean;
  years?: number;
  description?: string;
  relatedProjects?: string[];
}

export interface Skills {
  version: number;
  lastUpdated: string;
  categories: SkillCategory[];
  skills: Skill[];
  featuredSkills: string[];
}

export interface Contact {
  email: string;
  website: string;
  github: { username: string; url: string };
  resume: { enabled: boolean; filename: string };
  socials: string[];
  preferredContact: string;
}

export interface Timeline {
  id: string;
  year: number;
  type: string;
  title: string;
  organization?: string;
  description: string;
  related?: {
    projectId?: string;
    experienceId?: string;
    educationId?: string;
    achievementId?: string;
  };
}

export interface Settings {
  theme: { default: string; allowSwitch: boolean };
  environment: { weather: string; ambientAudio: boolean; backgroundMusic: boolean; particles: boolean };
  camera: { fov: number; smoothMovement: boolean; smoothRotation: boolean };
  controls: { desktop: string; tablet: string; mobile: string };
  performance: { targetFPSDesktop: number; targetFPSMobile: number; dynamicQuality: boolean };
  accessibility: { reduceMotion: boolean; subtitles: boolean; highContrast: boolean };
  developer: { showFPS: boolean; debug: boolean };
}

export interface SceneConfig {
  version: number;
  id: string;
  environment: {
    mode: string;
    allowManualOverride: boolean;
    activePreset: string | null;
    timeRanges: {
      day: { startHour: number; endHour: number; defaultPreset: string; alternatePreset: string };
      night: { startHour: number; endHour: number; defaultPreset: string; alternatePreset: string };
    };
    presets: Record<string, EnvironmentPreset>;
  };
  player: { spawn: string; height: number; speed: number; sprintSpeed: number; interactionDistance: number };
  camera: { defaultFov: number; near: number; far: number; smoothFactor: number };
  physics: { gravity: boolean; collision: boolean };
  rendering: { shadows: boolean; toneMapping: string; antialias: boolean; pixelRatio: string };
  postProcessing: { bloom: boolean; ambientOcclusion: boolean; vignette: boolean };
  mobile: { simplifiedShadows: boolean; disableSSR: boolean; disableReflectionProbes: boolean };
}

export interface EnvironmentPreset {
  weather: string;
  time: string;
  skybox: string;
  lightingPreset: string;
  audioPreset: string;
  particles: string;
  fog: { enabled: boolean; near?: number; far?: number };
}

export interface WorldObject {
  id: string;
  name?: string;
  category: string;
  area: string;
  model: string;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: number;
  interactable: boolean;
  collidable?: boolean;
  interaction?: ObjectInteraction;
  cameraFocus?: {
    position: { x: number; y: number; z: number };
    lookAt: { x: number; y: number; z: number };
  };
}

export interface ObjectInteraction {
  type: string;
  title?: string;
  dataSource?: string;
  application?: string;
  animation?: string;
  camera?: string;
  sound?: string;
  filter?: string;
  unlocks?: string;
}

export interface SpawnPointDefinition {
  position: { x: number; y: number; z: number };
  rotation: number;
}

export interface WorldMap {
  version: number;
  scene: string;
  startingArea: string;
  spawnPoint: string;
  defaultCamera: string;
  areas: Area[];
  spawnPoints?: Record<string, SpawnPointDefinition>;
  navigation: {
    desktop: { mode: string };
    tablet: { mode: string };
    mobile: { mode: string };
  };
  cameraFlow: string[];
  interactionPriority: string[];
}

export interface Area {
  id: string;
  name: string;
  title: string;
  description: string;
  order: number;
  music?: string;
  lighting: string;
  camera: string;
  objects: string[];
  connections: string[];
  hidden?: boolean;
  unlockCondition?: string;
  position?: { x: number; y: number; z: number };
  radius?: number;
}

export interface InteractionConfig {
  version: number;
  interactionTypes: Record<string, InteractionTypeConfig>;
  highlight: { enabled: boolean; type: string; color: string; pulse: boolean };
  cursor: { default: string; interactive: string };
}

export interface InteractionTypeConfig {
  cameraTransition: boolean;
  freezePlayer: boolean;
  showCursor?: boolean;
  closeKey?: string;
  allowKeyboardInput?: boolean;
  scrollable?: boolean;
  zoomable?: boolean;
  voiceReady?: boolean;
  chatEnabled?: boolean;
}

export interface LightingConfig {
  version: number;
  global: { environmentIntensity: number; exposure: number };
  weatherLighting: Record<string, WeatherLighting>;
  presets: LightingPreset[];
  effects: LightingEffects;
}

export interface WeatherLighting {
  environmentIntensity: number;
  exposure: number;
  backgroundColor: string;
  directionalLight?: DirectionalLight;
  moonLight?: DirectionalLight;
  ambientLight: { intensity: number; color: string };
  bloom: boolean;
  contactShadows: boolean;
  softShadows: boolean;
}

export interface DirectionalLight {
  enabled: boolean;
  intensity: number;
  color: string;
  angle: number;
}

export interface LightingPreset {
  id: string;
  ambient: number;
  spotlights?: string[];
  emissive?: string[];
}

export interface LightingEffects {
  monitorGlow: boolean;
  bloom: boolean;
  contactShadows: boolean;
  softShadows: boolean;
  autoExposure: boolean;
  volumetricLight: boolean;
}

export interface AudioConfig {
  version: number;
  masterVolume: number;
  ambient: AudioTrack[];
  effects: AudioTrack[];
}

export interface AudioTrack {
  id: string;
  file: string;
  loop?: boolean;
  volume?: number;
}

export interface AgentRules {
  version: number;
  identity: { name: string; role: string };
  behavior: { tone: string; friendly: boolean; concise: boolean; technicalDepth: string };
  rules: string[];
  privacy: Record<string, boolean>;
  capabilities: string[];
  limitations: string[];
}

export interface QueryMap {
  version: number;
  description: string;
  lookupPriority: string[];
  keywords: Record<string, string[]>;
  intentMap: Record<string, string[]>;
  responseStrategy: {
    maximumDatasets: number;
    preferProjectExamples: boolean;
    preferRecentExperience: boolean;
    mergeDuplicateResults: boolean;
    includeTimelineWhenRelevant: boolean;
  };
}

export interface PromptContext {
  version: number;
  systemPrompt: string[];
  conversation: { welcome: string; fallback: string; goodbye: string };
  examples: { question: string; lookup: string[] }[];
}

export interface FutureGoals {
  version: number;
  lastUpdated: string;
  goals: {
    title: string;
    description: string;
    category: string;
    timeframe: string;
    technologies?: string[];
  }[];
}

export interface PortfolioSchema {
  version: number;
  portfolio: Record<string, string>;
  world: Record<string, string>;
  relationships: Record<string, string>;
  entryPoints: Record<string, string>;
}
