import * as THREE from 'three';
import type { ObjectInteraction } from '../types';
import { easeInOutCubic } from '../utils';

export enum InteractionPhase {
  IDLE = 'idle',
  HOVER = 'hover',
  FOCUS = 'focus',
  INTERACT = 'interact',
  ANIMATE = 'animate',
  INFO = 'info',
  RETURN = 'return',
}

export interface ActiveInteraction {
  objectId: string;
  objectName: string;
  interaction: ObjectInteraction;
  mesh: THREE.Object3D;
  originalColor: number;
}

export type InteractionCallback = (phase: InteractionPhase, interaction: ActiveInteraction | null) => void;

const FLOOR_Y = 0.5;

export class InteractionStateMachine {
  private phase: InteractionPhase = InteractionPhase.IDLE;
  private active: ActiveInteraction | null = null;
  private onPhaseChange: InteractionCallback | null = null;
  private transitionProgress = 0;
  private transitionDuration = 0.6;
  private transitionActive = false;
  private cameraStart = new THREE.Vector3();
  private cameraEnd = new THREE.Vector3();
  private targetStart = new THREE.Vector3();
  private targetEnd = new THREE.Vector3();
  private currentCameraPos = new THREE.Vector3();
  private currentTargetPos = new THREE.Vector3();
  private orbitEnabled = true;
  private savedPlayerPos = new THREE.Vector3();
  private savedPlayerQuat = new THREE.Quaternion();
  private savedPlayerEuler = new THREE.Euler(0, 0, 0, 'YXZ');
  private savedControlsTarget = new THREE.Vector3();

  getPhase(): InteractionPhase {
    return this.phase;
  }

  getActive(): ActiveInteraction | null {
    return this.active;
  }

  isTransitioning(): boolean {
    return this.transitionActive;
  }

  isOrbitEnabled(): boolean {
    return this.orbitEnabled;
  }

  onPhaseChangeCallback(cb: InteractionCallback): void {
    this.onPhaseChange = cb;
  }

  startFocus(interaction: ActiveInteraction): void {
    this.active = interaction;
    this.transitionActive = true;
    this.transitionProgress = 0;
    this.orbitEnabled = false;

    this.savedPlayerPos.copy(this.cameraStart);
    this.savedControlsTarget.copy(this.targetStart);

    const cf = interaction.mesh.userData.cameraFocus;
    if (cf) {
      this.cameraEnd.set(cf.position.x, cf.position.y, cf.position.z);
      this.targetEnd.set(cf.lookAt.x, cf.lookAt.y, cf.lookAt.z);
    } else {
      const box = new THREE.Box3().setFromObject(interaction.mesh);
      if (box.min.x !== Infinity) {
        const cx = (box.min.x + box.max.x) / 2;
        const cy = (box.min.y + box.max.y) / 2;
        const cz = (box.min.z + box.max.z) / 2;
        const size = box.max.distanceTo(box.min);
        this.cameraEnd.set(cx + 0.6, Math.max(cy + 0.4, FLOOR_Y), cz + size * 0.8);
        this.targetEnd.set(cx, cy, cz);
      } else {
        this.cameraEnd.set(0, Math.max(1.2, FLOOR_Y), 2);
        this.targetEnd.set(0, 0, 0);
      }
    }

    this.cameraEnd.y = Math.max(this.cameraEnd.y, FLOOR_Y);

    this.setPhase(InteractionPhase.FOCUS);
  }

  startInteract(): void {
    this.setPhase(InteractionPhase.INTERACT);
  }

  startAnimate(): void {
    this.setPhase(InteractionPhase.ANIMATE);
  }

  startReturn(): void {
    this.transitionActive = true;
    this.transitionProgress = 0;
    this.orbitEnabled = true;

    this.cameraEnd.copy(this.savedPlayerPos);
    this.targetEnd.copy(this.savedControlsTarget);

    this.setPhase(InteractionPhase.RETURN);
  }

  endInteraction(): void {
    this.active = null;
    this.transitionActive = false;
    this.orbitEnabled = true;
    this.setPhase(InteractionPhase.IDLE);
  }

  setCameraStart(position: THREE.Vector3, target: THREE.Vector3, quaternion?: THREE.Quaternion): void {
    this.cameraStart.copy(position);
    this.targetStart.copy(target);
    this.currentCameraPos.copy(position);
    this.currentTargetPos.copy(target);
    if (quaternion) {
      this.savedPlayerQuat.copy(quaternion);
      this.savedPlayerEuler.setFromQuaternion(quaternion);
    }
  }

  update(delta: number, camera: THREE.PerspectiveCamera, controlsTarget: THREE.Vector3): void {
    if (!this.transitionActive) return;

    this.transitionProgress += delta / this.transitionDuration;
    if (this.transitionProgress >= 1) {
      this.transitionProgress = 1;
      this.transitionActive = false;
    }

    const t = easeInOutCubic(this.transitionProgress);
    this.currentCameraPos.lerpVectors(this.cameraStart, this.cameraEnd, t);
    this.currentTargetPos.lerpVectors(this.targetStart, this.targetEnd, t);

    camera.position.copy(this.currentCameraPos);
    controlsTarget.copy(this.currentTargetPos);

    if (this.transitionProgress >= 1) {
      camera.quaternion.copy(this.savedPlayerQuat);
    }

    if (!this.transitionActive && this.phase === InteractionPhase.RETURN) {
      this.endInteraction();
    }
  }

  private setPhase(phase: InteractionPhase): void {
    this.phase = phase;
    if (this.onPhaseChange) {
      this.onPhaseChange(phase, this.active);
    }
  }
}
