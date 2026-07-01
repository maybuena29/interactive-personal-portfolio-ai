import { ConfigLoader } from '../loaders/ConfigLoader';
import type { AudioConfig } from '../types';

export class AudioManager {
  private configLoader: ConfigLoader;
  private config!: AudioConfig;
  private audioContext: AudioContext | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private activeSources = new Map<string, AudioBufferSourceNode>();
  private activePanners = new Map<string, StereoPannerNode>();
  private activeGains = new Map<string, GainNode>();
  private masterGain: GainNode | null = null;
  private initialized = false;
  private listenerPos = { x: 0, y: 0, z: 0 };
  private currentAmbient: string | null = null;
  private fadeState: {
    active: boolean;
    fromTrack: string | null;
    toTrack: string;
    progress: number;
    duration: number;
    fromVolume: number;
    toVolume: number;
  } | null = null;

  constructor(configLoader: ConfigLoader) {
    this.configLoader = configLoader;
  }

  async init(): Promise<void> {
    try {
      this.config = await this.configLoader.loadAudioConfig();
    } catch (err) {
      console.warn('AudioManager: failed to load config, using defaults', err);
      this.config = { version: 1, masterVolume: 0.5, ambient: [], effects: [] };
    }
    try {
      this.audioContext = new AudioContext();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.config.masterVolume;
      this.masterGain.connect(this.audioContext.destination);
      this.initialized = true;
    } catch (err) {
      console.warn('AudioManager: failed to create AudioContext, audio disabled', err);
    }
  }

  resume(): void {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  async preload(): Promise<void> {
    if (!this.audioContext) return;
    for (const track of [...this.config.ambient, ...this.config.effects]) {
      const buffer = await this.loadAudioWithFallback(track.file);
      if (buffer) {
        this.buffers.set(track.id, buffer);
      } else {
        console.warn(`Failed to load audio: ${track.file}`);
      }
    }
  }

  private async loadAudioWithFallback(filePath: string): Promise<AudioBuffer | null> {
    const urlsToTry = this.buildAudioUrlCandidates(filePath);
    if (!this.audioContext) return null;

    for (const url of urlsToTry) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const arrayBuf = await res.arrayBuffer();
        return await this.audioContext.decodeAudioData(arrayBuf);
      } catch {
      }
    }
    return null;
  }

  private buildAudioUrlCandidates(filePath: string): string[] {
    const candidates: string[] = [];
    const hasExtension = filePath.includes('.');

    if (hasExtension) {
      const base = filePath.substring(0, filePath.lastIndexOf('.'));
      const ext = filePath.substring(filePath.lastIndexOf('.'));
      candidates.push(`/assets/${filePath}`);

      const audioExtMap: Record<string, string[]> = {
        '.mp3': ['.ogg', '.wav', '.m4a'],
        '.ogg': ['.mp3', '.wav'],
        '.wav': ['.mp3', '.ogg'],
      };
      const alts = audioExtMap[ext] || ['.mp3', '.ogg', '.wav'];
      for (const alt of alts) {
        candidates.push(`/assets/${base}${alt}`);
      }
    } else {
      for (const ext of ['.mp3', '.ogg', '.wav']) {
        candidates.push(`/assets/${filePath}${ext}`);
      }
    }

    return [...new Set(candidates)];
  }

  playAmbient(trackId: string): void {
    if (!this.audioContext || !this.masterGain) return;
    if (this.currentAmbient === trackId) return;
    this.stopAllAmbient();
    const buffer = this.buffers.get(trackId);
    if (!buffer) return;
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const gain = this.audioContext.createGain();
    gain.gain.value = this.getTrackVolume(trackId);
    const panner = this.audioContext.createStereoPanner();
    panner.pan.value = 0;
    source.connect(gain);
    gain.connect(panner);
    panner.connect(this.masterGain);
    source.start();
    this.activeSources.set(trackId, source);
    this.activePanners.set(trackId, panner);
    this.activeGains.set(trackId, gain);
    this.currentAmbient = trackId;
  }

  stopAmbient(trackId: string): void {
    const ctx = this.audioContext;
    const stopTime = ctx ? ctx.currentTime + 0.05 : 0;
    const gain = this.activeGains.get(trackId);
    if (gain && ctx) {
      gain.gain.linearRampToValueAtTime(0, stopTime);
    }
    const source = this.activeSources.get(trackId);
    if (source) {
      try { source.stop(stopTime + 0.01); } catch {}
      this.activeSources.delete(trackId);
    }
    const panner = this.activePanners.get(trackId);
    if (panner) {
      panner.disconnect();
      this.activePanners.delete(trackId);
    }
    if (gain) {
      gain.disconnect();
      this.activeGains.delete(trackId);
    }
    if (this.currentAmbient === trackId) {
      this.currentAmbient = null;
    }
  }

  stopAllAmbient(): void {
    for (const id of Array.from(this.activeSources.keys())) {
      this.stopAmbient(id);
    }
  }

  fadeToAmbient(trackId: string, duration: number): void {
    if (this.currentAmbient === trackId) return;
    const fromVolume = this.currentAmbient
      ? (this.activeGains.get(this.currentAmbient)?.gain.value ?? 0)
      : 0;
    const toVolume = this.getTrackVolume(trackId);

    this.fadeState = {
      active: true,
      fromTrack: this.currentAmbient,
      toTrack: trackId,
      progress: 0,
      duration,
      fromVolume,
      toVolume,
    };
  }

  playEffect(trackId: string): void {
    if (!this.audioContext || !this.masterGain) return;
    const buffer = this.buffers.get(trackId);
    if (!buffer) return;
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.masterGain);
    source.start();
  }

  update(playerPos: { x: number; y: number; z: number }, delta?: number): void {
    if (!this.initialized) return;

    if (this.fadeState && this.fadeState.active && delta) {
      this.fadeState.progress += delta / this.fadeState.duration;
      const t = Math.min(1, this.fadeState.progress);

      if (this.fadeState.fromTrack) {
        const fromGain = this.activeGains.get(this.fadeState.fromTrack);
        if (fromGain) {
          fromGain.gain.value = this.fadeState.fromVolume * (1 - t);
        }
      }

      if (t >= 0.5 && this.fadeState.toTrack !== this.currentAmbient) {
        this.startFadeInTrack(this.fadeState.toTrack, this.fadeState.toVolume);
      }

      if (t >= 1) {
        if (this.fadeState.fromTrack) {
          this.stopAmbient(this.fadeState.fromTrack);
        }
        const toGain = this.activeGains.get(this.fadeState.toTrack);
        if (toGain) {
          toGain.gain.value = this.fadeState.toVolume;
        }
        this.currentAmbient = this.fadeState.toTrack;
        this.fadeState = null;
      }
    }

    this.listenerPos = { ...playerPos };
    const dx = this.listenerPos.x;
    const dz = this.listenerPos.z;
    for (const [_id, panner] of this.activePanners) {
      const pan = Math.max(-1, Math.min(1, dx * 0.15 + dz * 0.1));
      panner.pan.setTargetAtTime(pan, this.audioContext!.currentTime, 0.1);
    }
  }

  getConfig(): AudioConfig | undefined {
    return this.config;
  }

  getCurrentAmbient(): string | null {
    return this.currentAmbient;
  }

  private startFadeInTrack(trackId: string, targetVolume: number): void {
    const buffer = this.buffers.get(trackId);
    if (!buffer || !this.audioContext || !this.masterGain) return;
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const gain = this.audioContext.createGain();
    gain.gain.value = 0;
    const panner = this.audioContext.createStereoPanner();
    panner.pan.value = 0;
    source.connect(gain);
    gain.connect(panner);
    panner.connect(this.masterGain);
    source.start();
    this.activeSources.set(trackId, source);
    this.activePanners.set(trackId, panner);
    this.activeGains.set(trackId, gain);

    gain.gain.linearRampToValueAtTime(targetVolume, this.audioContext.currentTime + 0.4);
  }

  private getTrackVolume(trackId: string): number {
    const track = this.config.ambient.find(t => t.id === trackId);
    return track?.volume ?? 0.5;
  }
}
