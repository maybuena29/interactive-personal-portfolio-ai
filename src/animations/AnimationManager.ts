import * as THREE from 'three';
import gsap from 'gsap';

export type AnimationCallback = () => void;

export class AnimationManager {
  private registry = new Map<string, (target: THREE.Object3D, onComplete?: AnimationCallback) => void>();
  private activeTweens: gsap.core.Tween[] = [];

  constructor() {
    this.registerDefaults();
  }

  play(animationName: string, target: THREE.Object3D, onComplete?: AnimationCallback): void {
    const animFn = this.registry.get(animationName);
    if (animFn) {
      animFn(target, onComplete);
    } else if (onComplete) {
      onComplete();
    }
  }

  register(name: string, fn: (target: THREE.Object3D, onComplete?: AnimationCallback) => void): void {
    this.registry.set(name, fn);
  }

  stopAll(): void {
    for (const tween of this.activeTweens) {
      tween.kill();
    }
    this.activeTweens = [];
  }

  private track(tween: gsap.core.Tween): void {
    this.activeTweens.push(tween);
    tween.eventCallback('onComplete', () => {
      const idx = this.activeTweens.indexOf(tween);
      if (idx >= 0) this.activeTweens.splice(idx, 1);
    });
  }

  private registerDefaults(): void {
    this.register('monitorBoot', (target, onComplete) => {
      const mesh = findMesh(target);
      if (!mesh) { onComplete?.(); return; }
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.emissive.setHex(0x4488ff);
      mat.emissiveIntensity = 0;
      const tween = gsap.to(mat, {
        emissiveIntensity: 0.6,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(mat, {
            emissiveIntensity: 0.3,
            duration: 0.3,
            ease: 'power1.inOut',
          });
          onComplete?.();
        },
      });
      this.track(tween);
    });

    this.register('signGlow', (target, onComplete) => {
      const mesh = findMesh(target);
      if (!mesh) { onComplete?.(); return; }
      const mat = mesh.material as THREE.MeshStandardMaterial;
      const tween = gsap.to(mat, {
        emissiveIntensity: 0.8,
        duration: 1.2,
        yoyo: true,
        repeat: 2,
        ease: 'sine.inOut',
        onComplete,
      });
      this.track(tween);
    });

    this.register('chairRotate', (target, onComplete) => {
      const tween = gsap.to(target.rotation, {
        y: target.rotation.y + Math.PI * 2,
        duration: 1.5,
        ease: 'power2.out',
        onComplete,
      });
      this.track(tween);
    });

    this.register('keyboardTyping', (_target, onComplete) => {
      const tween = gsap.to({}, {
        duration: 0.6,
        onComplete,
      });
      this.track(tween);
    });

    this.register('mouseClick', (target, onComplete) => {
      const origScale = target.scale.x;
      const tween = gsap.to(target.scale, {
        x: origScale * 0.9,
        y: origScale * 0.9,
        duration: 0.1,
        yoyo: true,
        repeat: 2,
        ease: 'power1.inOut',
        onComplete,
      });
      this.track(tween);
    });

    this.register('coffeeSteam', (_target, onComplete) => {
      const dummy = { opacity: 1 };
      const tween = gsap.to(dummy, {
        opacity: 0,
        duration: 2,
        ease: 'power1.inOut',
        onComplete,
      });
      this.track(tween);
    });

    this.register('bookPull', (target, onComplete) => {
      const tween = gsap.to(target.position, {
        z: target.position.z + 0.3,
        duration: 0.4,
        yoyo: true,
        repeat: 1,
        ease: 'back.out(2)',
        onComplete,
      });
      this.track(tween);
    });

    this.register('serverBoot', (target, onComplete) => {
      const mesh = findMesh(target);
      if (!mesh) { onComplete?.(); return; }
      const mat = mesh.material as THREE.MeshStandardMaterial;
      const origColor = mat.color.getHex();
      mat.color.setHex(0x33ff33);
      const tween = gsap.to(mat.color, {
        r: ((origColor >> 16) & 0xff) / 255,
        g: ((origColor >> 8) & 0xff) / 255,
        b: (origColor & 0xff) / 255,
        duration: 0.5,
        ease: 'power1.out',
        onComplete,
      });
      this.track(tween);
    });

    this.register('frameLight', (target, onComplete) => {
      const mesh = findMesh(target);
      if (!mesh) { onComplete?.(); return; }
      const mat = mesh.material as THREE.MeshStandardMaterial;
      const tween = gsap.to(mat, {
        emissiveIntensity: 0.5,
        duration: 0.6,
        yoyo: true,
        repeat: 1,
        ease: 'sine.inOut',
        onComplete,
      });
      this.track(tween);
    });

    this.register('rainWindow', (_target, onComplete) => {
      const tween = gsap.to({}, {
        duration: 1.5,
        onComplete,
      });
      this.track(tween);
    });

    this.register('terminalBoot', (target, onComplete) => {
      const mesh = findMesh(target);
      if (!mesh) { onComplete?.(); return; }
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.emissive.setHex(0x33ff33);
      mat.emissiveIntensity = 0;
      const tween = gsap.to(mat, {
        emissiveIntensity: 0.4,
        duration: 1,
        ease: 'power2.out',
        onComplete: () => {
          onComplete?.();
        },
      });
      this.track(tween);
    });
  }
}

function findMesh(obj: THREE.Object3D): THREE.Mesh | null {
  if (obj instanceof THREE.Mesh) return obj;
  let result: THREE.Mesh | null = null;
  obj.traverse((child: THREE.Object3D) => {
    if (child instanceof THREE.Mesh && !result) result = child;
  });
  return result;
}
