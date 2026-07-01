import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { SAOPass } from 'three/addons/postprocessing/SAOPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    offset: { value: 0.35 },
    darkness: { value: 0.45 },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float offset;
    uniform float darkness;
    varying vec2 vUv;
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec2 vigUv = (vUv - vec2(0.5)) * vec2(1.0);
      float vignette = 1.0 - dot(vigUv, vigUv) * offset;
      gl_FragColor = vec4(texel.rgb * (vignette + darkness), texel.a);
    }
  `,
};

export class PostProcessingSystem {
  private composer: EffectComposer | null = null;
  private bloomPass: UnrealBloomPass | null = null;
  private saoPass: SAOPass | null = null;
  private vignettePass: ShaderPass | null = null;

  enabled = {
    bloom: false,
    ambientOcclusion: false,
    vignette: false,
  };

  init(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    config: { bloom: boolean; ambientOcclusion: boolean; vignette: boolean }
  ): void {
    try {
      this.composer = new EffectComposer(renderer);
    } catch (err) {
      console.warn('PostProcessing: EffectComposer failed to initialize, disabled', err);
      return;
    }
    this.composer.addPass(new RenderPass(scene, camera));

    if (config.bloom) {
      try {
        this.bloomPass = new UnrealBloomPass(
          new THREE.Vector2(window.innerWidth, window.innerHeight),
          0.12,
          0.3,
          0.4
        );
        this.composer.addPass(this.bloomPass);
        this.enabled.bloom = true;
      } catch (err) {
        console.warn('PostProcessing: bloom pass failed to initialize, disabled', err);
      }
    }

    if (config.ambientOcclusion) {
      try {
        this.saoPass = new SAOPass(scene, camera, new THREE.Vector2(window.innerWidth, window.innerHeight));
        this.saoPass.params = {
          output: SAOPass.OUTPUT.Default,
          saoBias: 0.5,
          saoIntensity: 0.5,
          saoScale: 100,
          saoKernelRadius: 100,
          saoMinResolution: 0,
          saoBlur: true,
          saoBlurRadius: 8,
          saoBlurStdDev: 4,
          saoBlurDepthCutoff: 0.01,
        };
        this.composer.addPass(this.saoPass);
        this.enabled.ambientOcclusion = true;
      } catch (err) {
        console.warn('PostProcessing: SAO pass failed to initialize, disabled', err);
      }
    }

    if (config.vignette) {
      try {
        this.vignettePass = new ShaderPass(VignetteShader);
        this.vignettePass.uniforms.offset.value = 0.35;
        this.vignettePass.uniforms.darkness.value = 0.45;
        this.composer.addPass(this.vignettePass);
        this.enabled.vignette = true;
      } catch (err) {
        console.warn('PostProcessing: vignette pass failed to initialize, disabled', err);
      }
    }

    try {
      this.composer.addPass(new OutputPass());
    } catch (err) {
      console.warn('PostProcessing: OutputPass failed, disabled', err);
      this.composer = null;
      return;
    }
  }

  setSize(width: number, height: number): void {
    if (this.composer) this.composer.setSize(width, height);
    if (this.bloomPass) {
      this.bloomPass.resolution.set(width, height);
    }
  }

  setBloomIntensity(intensity: number): void {
    if (this.bloomPass) this.bloomPass.strength = intensity;
  }

  setBloomRadius(radius: number): void {
    if (this.bloomPass) this.bloomPass.radius = radius;
  }

  setBloomThreshold(threshold: number): void {
    if (this.bloomPass) this.bloomPass.threshold = threshold;
  }

  isActive(): boolean {
    return this.composer !== null;
  }

  render(): void {
    if (this.composer) {
      this.composer.render();
    }
  }

  dispose(): void {
    if (this.composer) this.composer.dispose();
    this.composer = null;
    this.bloomPass = null;
    this.saoPass = null;
    this.vignettePass = null;
  }
}
