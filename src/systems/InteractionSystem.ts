import * as THREE from 'three';
import type { WorldMap, ObjectInteraction } from '../types';
import { ConfigLoader } from '../loaders/ConfigLoader';
import { InteractionStateMachine, InteractionPhase } from '../interactions/InteractionStateMachine';

export interface InteractionState {
  objectId: string;
  interaction: ObjectInteraction;
  mesh: THREE.Object3D;
}

export type ObjectAccessCheck = (objectId: string) => boolean;

export class InteractionSystem {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private raycaster: THREE.Raycaster;
  private pointer: THREE.Vector2;
  private configLoader: ConfigLoader;
  private interactables: THREE.Object3D[] = [];
  private hoveredObject: THREE.Object3D | null = null;
  private onInteractCallbacks: Array<(state: InteractionState) => void> = [];
  private controlsTarget: THREE.Vector3;
  private interactDistance = 2.5;
  public stateMachine: InteractionStateMachine;
  public activeInteraction: InteractionState | null = null;
  private isObjectAccessible: ObjectAccessCheck | null = null;

  private _hoveredObjectId: string | null = null;
  private _hoveredObjectLocked = false;
  private _lockedCondition: string | null = null;

  get hoveredObjectId(): string | null {
    return this._hoveredObjectId;
  }

  get hoveredObjectLocked(): boolean {
    return this._hoveredObjectLocked;
  }

  get lockedCondition(): string | null {
    return this._lockedCondition;
  }

  constructor(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    raycaster: THREE.Raycaster,
    pointer: THREE.Vector2
  ) {
    this.scene = scene;
    this.camera = camera;
    this.raycaster = raycaster;
    this.pointer = pointer;
    this.configLoader = new ConfigLoader();
    this.controlsTarget = new THREE.Vector3(0, 0, 0);
    this.stateMachine = new InteractionStateMachine();
  }

  async init(_worldMap: WorldMap): Promise<void> {
    let objects: any[] = [];
    try {
      objects = await this.configLoader.loadObjects();
    } catch (err) {
      console.warn('InteractionSystem: failed to load object config', err);
    }
    const objectsById = new Map(objects.map((o: any) => [o.id, o]));
    let interactionDistance = 2.5;
    try {
      const sceneConfig = await this.configLoader.loadSceneConfig();
      interactionDistance = sceneConfig.player?.interactionDistance ?? 2.5;
    } catch (err) {
      console.warn('InteractionSystem: failed to load scene config, using defaults', err);
    }
    this.interactDistance = interactionDistance;

    this.scene.traverse((child: THREE.Object3D) => {
      if (child.userData?.interactable) {
        this.interactables.push(child);
      }
    });

    this.scene.traverse((child: THREE.Object3D) => {
      if (child.userData?.interactable && child.userData?.objectId) {
        const def = objectsById.get(child.userData.objectId);
        if (def && def.interaction) {
          child.userData.interaction = def.interaction;
        }
      }
    });

    this.stateMachine.onPhaseChangeCallback((phase) => {
      if (phase === InteractionPhase.FOCUS) {
        const active = this.stateMachine.getActive();
        if (active) {
          this.activeInteraction = {
            objectId: active.objectId,
            interaction: active.interaction,
            mesh: active.mesh,
          };
          for (const cb of this.onInteractCallbacks) {
            cb(this.activeInteraction);
          }
        }
      }
      if (phase === InteractionPhase.IDLE) {
        this.activeInteraction = null;
      }
    });

    window.addEventListener('keydown', (e) => this.onKeyDown(e));
  }

  private onUnlockCallbacks: Array<(condition: string) => void> = [];
  private onInteractionEndCallbacks: Array<() => void> = [];

  setObjectAccessCheck(check: ObjectAccessCheck): void {
    this.isObjectAccessible = check;
  }

  onUnlock(cb: (condition: string) => void): void {
    this.onUnlockCallbacks.push(cb);
  }

  onInteractionEnd(cb: () => void): void {
    this.onInteractionEndCallbacks.push(cb);
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      if (this.stateMachine.getPhase() !== InteractionPhase.IDLE) {
        this.endInteraction();
      }
    }
    if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') {
      if (this.stateMachine.getPhase() === InteractionPhase.IDLE && this.hoveredObject && !this._hoveredObjectLocked) {
        this.handleClick();
      }
    }
  }

  handleMobileTap(): void {
    if (this.stateMachine.getPhase() === InteractionPhase.IDLE && this.hoveredObject && !this._hoveredObjectLocked) {
      this.handleClick();
    }
  }

  update(delta: number): void {
    if (this.stateMachine.isTransitioning()) {
      this.stateMachine.update(delta, this.camera, this.controlsTarget);
      return;
    }

    if (this.stateMachine.getPhase() !== InteractionPhase.IDLE) return;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactables, true);

    let hitInteractable: THREE.Object3D | null = null;
    let hitDistance = Infinity;

    for (const hit of intersects) {
      let obj: THREE.Object3D | null = hit.object;
      while (obj && !obj.userData.interactable) {
        obj = obj.parent;
      }
      if (obj && obj.userData.interactable) {
        const dist = this.camera.position.distanceTo(hit.point);
        if (dist <= this.interactDistance && dist < hitDistance) {
          hitInteractable = obj;
          hitDistance = dist;
        }
      }
    }

    if (hitInteractable) {
      const obj = hitInteractable;
      const objectId = obj.userData.objectId as string || '';
      const objectLocked = this.isObjectAccessible ? !this.isObjectAccessible(objectId) : false;

      if (this.hoveredObject !== obj) {
        this.onHoverOut();
        this.hoveredObject = obj;
        this._hoveredObjectId = objectId || null;
        this._hoveredObjectLocked = objectLocked;
        this._lockedCondition = objectLocked ? 'locked' : null;
        this.onHoverIn(obj, objectLocked);
      }
      this._hoveredObjectLocked = objectLocked;
      document.body.style.cursor = objectLocked ? 'not-allowed' : 'pointer';
    } else {
      if (this.hoveredObject) {
        this.onHoverOut();
        this.hoveredObject = null;
        this._hoveredObjectId = null;
        this._hoveredObjectLocked = false;
        this._lockedCondition = null;
      }
      document.body.style.cursor = 'default';
    }
  }

  private onHoverIn(obj: THREE.Object3D, locked: boolean): void {
    if (obj.userData._originalColor !== undefined) return;
    const mesh = this.findMesh(obj);
    if (mesh && mesh.material) {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      obj.userData._originalColor = mat.color.getHex();
      const highlightColor = locked ? 0xff4444 : 0x66ccff;
      mat.color.setHex(highlightColor);
    }
  }

  private onHoverOut(): void {
    if (!this.hoveredObject) return;
    const mesh = this.findMesh(this.hoveredObject);
    if (mesh && mesh.material && this.hoveredObject.userData._originalColor !== undefined) {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.color.setHex(this.hoveredObject.userData._originalColor);
      delete this.hoveredObject.userData._originalColor;
    }
  }

  handleClick(): void {
    if (!this.hoveredObject) return;
    if (this.stateMachine.getPhase() !== InteractionPhase.IDLE) return;
    if (this._hoveredObjectLocked) return;

    const obj = this.hoveredObject;
    const interaction = obj.userData.interaction as ObjectInteraction | undefined;
    const objectId = obj.userData.objectId as string | undefined;

    if (!interaction || !objectId) return;

    const mesh = this.findMesh(obj);
    const originalColor = mesh && mesh.material
      ? (mesh.material as THREE.MeshStandardMaterial).color.getHex()
      : 0x999999;

    this.stateMachine.setCameraStart(this.camera.position.clone(), this.controlsTarget.clone(), this.camera.quaternion.clone());

    this.stateMachine.startFocus({
      objectId,
      objectName: obj.userData.objectName || objectId,
      interaction,
      mesh: obj,
      originalColor,
    });

    if (interaction.unlocks) {
      for (const cb of this.onUnlockCallbacks) {
        cb(interaction.unlocks);
      }
    }
  }

  onInteract(cb: (state: InteractionState) => void): void {
    this.onInteractCallbacks.push(cb);
  }

  endInteraction(): void {
    if (this.stateMachine.getPhase() === InteractionPhase.IDLE) return;

    for (const cb of this.onInteractionEndCallbacks) {
      cb();
    }

    const phase = this.stateMachine.getPhase();
    if (phase === InteractionPhase.FOCUS || phase === InteractionPhase.INTERACT || phase === InteractionPhase.INFO) {
      this.stateMachine.setCameraStart(this.camera.position.clone(), this.controlsTarget.clone(), this.camera.quaternion.clone());
      this.stateMachine.startReturn();
    } else {
      this.stateMachine.endInteraction();
    }
  }

  getControlsTarget(): THREE.Vector3 {
    return this.controlsTarget;
  }

  private findMesh(obj: THREE.Object3D): THREE.Mesh | null {
    if (obj instanceof THREE.Mesh) return obj;
    let result: THREE.Mesh | null = null;
    obj.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh && !result) result = child;
    });
    return result;
  }
}
